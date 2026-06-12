import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CustomInput from '../../components/common/CustomInput';
import { rf, rh, rw } from '../../utils/responsive';
import { colors } from '../../utils/color';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/Theme';
import { SearchUser, Theme, UserType } from '../../types/screens';
import { CustomCard } from '../../components/common/CustomCard';
import axios from 'axios';
import { access_token } from '../../../firebaseconfig';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../navigations/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

const Search = () => {
  const currentUserId = auth().currentUser?.uid;
  const { currentTheme } = useTheme();
  const [search, setSearch] = useState<string>('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchUser, setSearchUser] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getUsers();
    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const searchUsers = async (text: string) => {
    const { Filter } = firestore;

    try {
      setSearchLoading(true);
      const searchWord = text.toLowerCase();

      const querySnapshot = await firestore()
        .collection('users')
        .where(
          Filter.or(
            Filter('firstName', '==', searchWord),
            Filter('lastName', '==', searchWord),
          ),
        )
        .get();

      const rawUsers = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<UserType, 'id'>),
        }))
        .filter(item => item.id !== currentUserId);

      const unsubscribe = firestore()
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

          const usersWithStatus: SearchUser[] = rawUsers.map(user => {
            const myStatusToThem = outgoingStatus[user.id] || 'none';
            const theirStatusToMe = incomingStatus[user.id] || 'none';

            let finalStatus = 'none';

            if (myStatusToThem === 'accepted') {
              finalStatus = 'accepted';
            } else if (myStatusToThem === 'pending') {
              finalStatus = 'pending';
            } else if (
              theirStatusToMe === 'accepted' &&
              myStatusToThem === 'none'
            ) {
              finalStatus = 'follow_back';
            }

            return {
              ...user,
              followStatus: finalStatus as
                | 'none'
                | 'pending'
                | 'accepted'
                | 'follow_back'
                | undefined,
            };
          });

          setSearchUser(usersWithStatus);
          setSearchLoading(false);
        });

      return unsubscribe;
    } catch (error) {
      console.log(error);
      setSearchLoading(false);
      if (error instanceof Error) {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };

  const getUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await firestore().collection('users').get();

      const rawUsers = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<UserType, 'id'>),
        }))
        .filter(item => item.id !== currentUserId);

      const unsubscribe = firestore()
        .collection('followRequests')
        // eslint-disable-next-line @typescript-eslint/no-shadow
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

          const usersWithStatus: SearchUser[] = rawUsers.map(user => {
            const myStatusToThem = outgoingStatus[user.id] || 'none';
            const theirStatusToMe = incomingStatus[user.id] || 'none';

            let finalStatus = 'none';

            if (myStatusToThem === 'accepted') {
              finalStatus = 'accepted';
            } else if (myStatusToThem === 'pending') {
              finalStatus = 'pending';
            } else if (
              theirStatusToMe === 'accepted' &&
              myStatusToThem === 'none'
            ) {
              finalStatus = 'follow_back';
            }

            return {
              ...user,
              followStatus: finalStatus as
                | 'none'
                | 'pending'
                | 'accepted'
                | 'follow_back'
                | undefined,
            };
          });
          setUsers(usersWithStatus);
          setLoading(false);
        });

      return unsubscribe;
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (search.trim().length > 0) {
      setSearchLoading(true);
      debounceRef.current = setTimeout(() => {
        searchUsers(search);
      }, 2000);
    } else {
      setSearchUser([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const unfollowUser = async (targetUserId: string, firstName: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const currentUserId = auth().currentUser?.uid;
      if (!currentUserId) return;

      const batch = firestore().batch();

      const myRef = firestore().collection('users').doc(currentUserId);
      const targetRef = firestore().collection('users').doc(targetUserId);

      const requestDocId = `${currentUserId}_${targetUserId}`;
      const requestRef = firestore()
        .collection('followRequests')
        .doc(requestDocId);

      batch.update(myRef, {
        following: firestore.FieldValue.arrayRemove(targetUserId),
      });

      batch.update(targetRef, {
        followers: firestore.FieldValue.arrayRemove(currentUserId),
      });

      batch.delete(requestRef);

      await batch.commit();
      handleUnFollowUser(firstName);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', 'Something went wrong');
      }
    }
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

      const receiverDoc = await firestore()
        .collection('users')
        .doc(receiverId)
        .get();
      const currentUserDoc = await firestore()
        .collection('users')
        .doc(currentUserId)
        .get();

      const currentUserName = currentUserDoc.data();

      if (!receiverDoc.exists) {
        console.log('Receiver user not found in database');
        return;
      }

      const receiverData = receiverDoc.data();

      const token = receiverData?.fcmToken;

      if (token) {
        await axios.post(
          'https://fcm.googleapis.com/v1/projects/appinstragram-531c1/messages:send',
          {
            message: {
              notification: {
                title: 'New Follow Request',
                body: `${currentUserName?.firstName} sent you a follow request.`,
              },
              data: {
                screen: 'Notification',
                article_id: '12345',
                notification_receiver_id: receiverId,
              },
              token: token,
              android: {
                priority: 'high',
              },
              apns: {
                headers: {
                  'apns-priority': '10',
                  'apns-push-type': 'alert',
                  'apns-topic': 'de.myapp.app',
                },
                payload: {
                  aps: {
                    'content-available': 1,
                  },
                },
              },
            },
          },
          {
            headers: {
              Authorization: access_token.access_token,
            },
          },
        );
      } else {
        console.log('Receiver does not have an FCM token saved');
      }
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

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item }: { item: UserType }) => {
    const status = item.followStatus || 'none';

    return (
      <>
        <CustomCard
          firstName={item.firstName}
          lastName={item.lastName}
          image={item.profileImage}
          onPress={() => {
            if (status === 'pending') {
              cancelFollowRequest(item.id);
            } else if (status === 'accepted') {
              unfollowUser(item.id, item.firstName);
            } else {
              sendFollowRequest(item.id, item.firstName);
            }
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
          disable={status === 'accepted' && true}
        />
      </>
    );
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const ListEmptyComponentData = () => {
    if (loading) {
      return <ActivityIndicator size={'small'} />;
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('no_users_found')}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={styles.safeAreaViewStyle}
    >
      <CustomHeader route="Search" />
      <View style={styles.container}>
        <CustomInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('search_user')}
          variant="primary"
          placeholderTextColor={currentTheme.text}
          style={styles.searchInput}
        />

        {search.length === 0 ? (
          <>
            <View style={styles.suggestedAccountView}>
              <Text style={styles.suggestedAccountText}>
                {t('suggested_account')}
              </Text>

              <FlatList
                data={users}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                style={styles.flatList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={ListEmptyComponentData}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            </View>
          </>
        ) : (
          <>
            {searchLoading ? (
              <>
                <ActivityIndicator size={'large'} color={'blue'} />
              </>
            ) : (
              <>
                <FlatList
                  data={searchUser}
                  keyExtractor={item => item.id}
                  renderItem={renderItem}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  style={styles.mH25}
                />
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Search;

const inlineStyle = (currentTheme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    safeAreaViewStyle: { backgroundColor: currentTheme.background, flex: 1 },

    searchInput: {
      borderRadius: rw(12),
      marginBottom: rh(5),
      fontSize: 15,
      marginTop: rh(15),
      backgroundColor: currentTheme.background,
    },

    followingButton: {
      backgroundColor: colors.mediumDarkGray,
    },
    followingText: {
      color: colors.black,
    },

    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: rh(250),
    },

    emptyText: {
      color: colors.gray,
      fontSize: rf(16),
    },
    suggestedAccountView: {
      marginHorizontal: rw(10),
      borderRadius: rw(10),
      backgroundColor: currentTheme.background,
    },
    suggestedAccountText: {
      fontSize: rf(17),
      fontWeight: 'bold',
      paddingHorizontal: rw(15),
      marginVertical: rh(10),
      color: currentTheme.text,
    },
    flatList: { marginHorizontal: rw(10) },
    mH25: { marginHorizontal: rw(25) },
  });
