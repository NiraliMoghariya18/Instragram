import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { CustomCard } from '../../components/common/CustomCard';
import { SearchUser, UserType } from '../../types/screens';
import Toast from 'react-native-toast-message';
import { colors } from '../../utils/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../utils/images';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackRootScreen } from '../../types/navigationtype';
import { useTheme } from '../../context/Theme';
import { rf, rh, rw } from '../../utils/responsive';
import { strings } from '../../utils/strings';

const Following = () => {
  const route = useRoute();
  const params = route.params as { following: string[] };
  const following = params?.following;
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();
  const { currentTheme, themeMode } = useTheme();
  const currentUserId = auth().currentUser?.uid;
  const [users, setUsers] = useState<UserType[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [removedUsers, setRemovedUsers] = useState<string[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const getFollowers = async () => {
      try {
        if (!following?.length) {
          setUsers([]);
          return;
        }

        const rawProfiles = await Promise.all(
          following.map(async (userId: string) => {
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
        console.log(error);
      }
    };

    getFollowers();

    return () => {
      unsubscribe?.();
    };
  }, [following, currentUserId, removedUsers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // await getData();
    setRefreshing(false);
  }, []);

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
        .where('senderId', '==', receiverId)
        .where('receiverId', '==', currentUserId)
        .where('status', '==', 'pending')
        .get();

      if (!snapshot.empty) {
        const batch = firestore().batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.log('Error', error);

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === receiverId ? { ...user, followStatus: 'pending' } : user,
        ),
      );
    }
  };

  const unfollowingUser = async (followerId: string) => {
    try {
      if (!currentUserId) return;

      setRemovedUsers(prev => [...prev, followerId]);

      setUsers(prev => prev.filter(user => user.id !== followerId));

      const batch = firestore().batch();

      const currentUserRef = firestore().collection('users').doc(followerId);

      const followerRef = firestore().collection('users').doc(currentUserId);

      batch.update(currentUserRef, {
        followers: firestore.FieldValue.arrayRemove(currentUserId),
      });

      batch.update(followerRef, {
        following: firestore.FieldValue.arrayRemove(followerId),
      });

      const request2 = firestore()
        .collection('followRequests')
        .doc(`${currentUserId}_${followerId}`);

      batch.delete(request2);

      await batch.commit();

      console.log('Following removed');
    } catch (error) {
      console.log(error);
    }
  };

  const handleSuccess = (firstName: string) => {
    Toast.show({
      type: 'success',
      text1: `✅ Send to Follow Req ${firstName} `,
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
    }
  };

  const renderItem = ({ item }: { item: UserType }) => {
    console.log('item :>> ', item);
    const status = item.followStatus || 'none';
    console.log('status :>> ', status);
    return (
      <View>
        <CustomCard
          firstName={item.firstName}
          lastName={item.lastName}
          image={item.profileImage}
          onPress={() => {
            if (status === 'pending') {
              cancelFollowRequest(item.id);
            } else if (status === 'accepted') {
              unfollowingUser(item.id);
            } else {
              sendFollowRequest(item.id, item.firstName);
            }
          }}
          textStyle={status === 'accepted' && styles.followingText}
          btnStyle={status === 'accepted' && styles.followingButton}
          ButtonName={
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
          imageOnPress={() => unfollowingUser(item.id)}
          disable={status === 'accepted' && true}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <TouchableOpacity
          style={styles.left}
          onPress={() => navigation.goBack()}
        >
          <>
            <Image
              source={
                themeMode === 'light' ? images.blackBack : images.whiteBack
              }
              style={[styles.icon, { tintColor: currentTheme.text }]}
              resizeMode="contain"
            />
          </>
        </TouchableOpacity>
        <Text style={[styles.instagramText, { color: currentTheme.text }]}>
          {strings.following}
        </Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{strings.no_following_found}</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Following;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: {
    position: 'absolute',
    left: rw(20),
  },
  instagramText: {
    fontSize: rf(25),
  },
  icon: {
    width: rw(20),
    height: rh(20),
  },
  closeImageStyle: { width: rw(15), height: rw(15) },
});
