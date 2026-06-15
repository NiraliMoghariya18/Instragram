import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { CustomCard } from '../../components/common/CustomCard';
import { SearchUser, Theme, UserType } from '../../types/screens';
import Toast from 'react-native-toast-message';
import { colors } from '../../utils/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../utils/images';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackRootScreen } from '../../types/navigationtype';
import { useTheme } from '../../context/Theme';
import { rf, rh, rw } from '../../utils/responsive';
import { useTranslation } from 'react-i18next';

const Followers = () => {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();
  const { currentTheme, themeMode } = useTheme();
  const params = route.params as { followers: string[] };
  const followers = params?.followers;
  const currentUserId = auth().currentUser?.uid;
  const [users, setUsers] = useState<UserType[]>([]);

  const { t } = useTranslation();
  const [removedUsers, setRemovedUsers] = useState<string[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const getFollowers = async () => {
      try {
        if (!followers?.length) {
          setUsers([]);
          return;
        }

        const rawProfiles = await Promise.all(
          followers.map(async (userId: string) => {
            const doc = await firestore().collection('users').doc(userId).get();

            return {
              id: doc.id,
              ...doc.data(),
            };
          }),
        );

        unsubscribe = firestore()
          .collection('followRequests')
          .onSnapshot(snapshot => {
            const outgoingStatus: Record<string, string> = {};
            const incomingStatus: Record<string, string> = {};

            snapshot.docs.forEach(doc => {
              const data = doc.data();

              if (data.senderId === currentUserId) {
                outgoingStatus[data.receiverId] = data.status;
              } else if (data.receiverId === currentUserId) {
                incomingStatus[data.senderId] = data.status;
              }
            });

            const usersWithStatus = rawProfiles
              .filter(user => !removedUsers.includes(user.id))
              .map(user => {
                const myStatusToThem = outgoingStatus[user.id] || 'none';

                const theirStatusToMe = incomingStatus[user.id] || 'none';

                let followStatus = 'none';

                if (myStatusToThem === 'accepted') {
                  followStatus = 'accepted';
                } else if (myStatusToThem === 'pending') {
                  followStatus = 'pending';
                } else if (
                  theirStatusToMe === 'accepted' &&
                  myStatusToThem === 'none'
                ) {
                  followStatus = 'follow_back';
                }

                return {
                  ...user,
                  followStatus,
                };
              });

            setUsers(usersWithStatus as SearchUser[]);
          });
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert('Error', 'Something went wrong');
        }
      }
    };

    getFollowers();

    return () => {
      unsubscribe?.();
    };
  }, [followers, currentUserId, removedUsers]);

  const cancelFollowRequest = async (receiverId: string) => {
    try {
      if (!currentUserId) return;

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === receiverId ? { ...user, followStatus: 'none' } : user,
        ),
      );

      const snapshot = await firestore()
        .collection('followRequests')
        .where('senderId', '==', currentUserId)
        .where('receiverId', '==', receiverId)
        .where('status', '==', 'pending')
        .get();

      if (!snapshot.empty) {
        const batch = firestore().batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      handleCancelReq();
    } catch (error) {
      console.log('Error', error);

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === receiverId ? { ...user, followStatus: 'pending' } : user,
        ),
      );

      if (error instanceof Error) {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };

  const unfollowUser = async (followerId: string, firstName: string) => {
    try {
      if (!currentUserId) return;

      setRemovedUsers(prev => [...prev, followerId]);

      setUsers(prev => prev.filter(user => user.id !== followerId));

      const batch = firestore().batch();

      const currentUserRef = firestore().collection('users').doc(currentUserId);

      const followerRef = firestore().collection('users').doc(followerId);

      batch.update(currentUserRef, {
        followers: firestore.FieldValue.arrayRemove(followerId),
      });

      batch.update(followerRef, {
        following: firestore.FieldValue.arrayRemove(currentUserId),
      });

      const request1 = firestore()
        .collection('followRequests')
        .doc(`${followerId}_${currentUserId}`);

      batch.delete(request1);

      await batch.commit();
      handleUnFollowUser(firstName);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };

  const handleSuccess = (firstName: string) => {
    Toast.show({
      type: 'success',
      text1: t('send_follow_req', { name: firstName }),
    });
  };

  const handleCancelReq = () => {
    Toast.show({
      type: 'success',
      text1: t('cancel_req'),
    });
  };
  const handleUnFollowUser = (firstName: string) => {
    Toast.show({
      type: 'success',
      text1: t('unfollow_user', { name: firstName }),
    });
  };

  const sendFollowRequest = async (receiverId: string, firstName: string) => {
    try {
      if (!currentUserId) return;

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === receiverId ? { ...user, followStatus: 'pending' } : user,
        ),
      );

      const requestDocId = `${currentUserId}_${receiverId}`;

      await firestore().collection('followRequests').doc(requestDocId).set({
        senderId: currentUserId,
        receiverId,
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      handleSuccess(firstName);
    } catch (error) {
      console.log(error);

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === receiverId ? { ...user, followStatus: 'none' } : user,
        ),
      );
      if (error instanceof Error) {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };
  const styles = inlineStyle(currentTheme);

  const customCardPress = (id: string, firstName: string, status: string) => {
    if (status === 'pending') {
      cancelFollowRequest(id);
    } else if (status === 'accepted') {
      unfollowUser(id, firstName);
    } else {
      sendFollowRequest(id, firstName);
    }
  };

  const renderItem = ({ item }: { item: UserType }) => {
    const status = item.followStatus || 'none';

    return (
      <View>
        <CustomCard
          firstName={item.firstName}
          lastName={item.lastName}
          image={item.profileImage}
          onPress={() => {
            customCardPress(item.id, item.firstName, status);
          }}
          textStyle={status === 'accepted' && styles.followingText}
          btnStyle={status === 'accepted' && styles.followingButton}
          buttonName={
            status === 'accepted'
              ? 'Followed'
              : status === 'pending'
              ? 'Cancel Requested'
              : status === 'follow_back'
              ? 'Follow Back'
              : 'Follow'
          }
          closeImage={images.close}
          closeImageStyle={styles.closeImageStyle}
          imageOnPress={() => unfollowUser(item.id, item.firstName)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.left}
          onPress={() => navigation.goBack()}
        >
          <>
            <Image
              source={
                themeMode === 'light' ? images.blackBack : images.whiteBack
              }
              style={styles.icon}
              resizeMode="contain"
            />
          </>
        </TouchableOpacity>
        <Text style={styles.instagramText}>{t('followers')}</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('no_followers_found')}</Text>
        }
        style={styles.flatListStyle}
      />
    </SafeAreaView>
  );
};

export default Followers;

const inlineStyle = (currentTheme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    flatListStyle: { marginHorizontal: rw(20), marginTop: rh(10) },
    followingButton: {
      backgroundColor: colors.mediumDarkGray,
    },
    followingText: {
      color: colors.black,
    },

    emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: currentTheme.text,
    },

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.background,
    },
    left: {
      position: 'absolute',
      left: rw(20),
    },
    instagramText: {
      fontSize: rf(25),
      color: currentTheme.text,
    },
    icon: {
      width: rw(20),
      height: rh(20),
      tintColor: currentTheme.text,
    },
    closeImageStyle: {
      width: rw(15),
      height: rw(15),
      tintColor: currentTheme.text,
    },
  });
