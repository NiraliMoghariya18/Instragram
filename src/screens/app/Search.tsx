import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CustomInput from '../../components/common/CustomInput';
import { rf, rh, rw } from '../../utils/responsive';
import { colors } from '../../utils/color';
import Toast from 'react-native-toast-message';
import { strings } from '../../utils/strings';

interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string;
  followStatus?: 'none' | 'pending' | 'accepted' | 'follow_back';
}

interface User {
  createdAt?: { _seconds: number; _nanoseconds: number };
  dob?: string;
  email?: string;
  firstName: string;
  followStatus?: 'none' | 'pending' | 'accepted' | 'follow_back';
  username: string;
  id: string;
  lastName: string;

  profileImage: string;
  followers?: string[];
  following?: string[];
  gender?: string;
  phoneNo?: string;
}

const Search = () => {
  const currentUserId = auth().currentUser?.uid;

  const [search, setSearch] = useState<string>('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<number | null>(null);
  console.log('debounceRef :>> ', debounceRef);
  const handleSuccess = (firstName: string) => {
    Toast.show({
      type: 'success',
      text1: `✅ Send to Follow Req ${firstName} `,
    });
  };

  const searchUsers = async (text: string) => {
    const { Filter } = firestore;

    try {
      setLoading(true);
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

          const usersWithStatus: User[] = rawUsers.map(user => {
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
      console.log(error);
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      const snapshot = await firestore().collection('users').get();

      const rawUsers = snapshot.docs
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

          const usersWithStatus: User[] = rawUsers.map(user => {
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
      console.log(error);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (search.trim().length > 0) {
      debounceRef.current = setTimeout(() => {
        searchUsers(search);
      }, 500);
    } else {
      setUsers([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  const sendFollowRequest = async (receiverId: string, firstName: string) => {
    try {
      if (!currentUserId) return;

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === receiverId ? { ...user, followStatus: 'pending' } : user,
        ),
      );

      const snapshot = await firestore()
        .collection('followRequests')
        .where('senderId', '==', currentUserId)
        .where('receiverId', '==', receiverId)
        .get();

      if (!snapshot.empty) return;

      await firestore().collection('followRequests').add({
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

  useEffect(() => {
    getUsers();
  }, [search]);

  const renderItem = ({ item }: { item: UserType }) => {
    const status = item.followStatus || 'none';

    return (
      <View style={styles.userContainer}>
        <View style={styles.leftContainer}>
          <Image
            source={{ uri: item.profileImage }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.username}>{item.firstName}</Text>
            <Text style={styles.name}>
              {item.firstName} {item.lastName}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={status === 'pending' || status === 'accepted'}
          style={[
            styles.followButton,
            status === 'accepted' && styles.followingButton,
          ]}
          onPress={() => sendFollowRequest(item.id, item.firstName)}
        >
          <Text
            style={[
              styles.followText,
              status === 'accepted' && styles.followingText,
            ]}
          >
            {status === 'accepted'
              ? 'Followed'
              : status === 'pending'
              ? 'Requested'
              : status === 'follow_back'
              ? 'Follow Back'
              : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const ListEmptyComponentData = () => {
    if (loading) {
      return <ActivityIndicator size={'small'} />;
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{strings.no_users_found}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search users..."
        variant="primary"
        style={styles.searchInput}
      />

      {search.length === 0 ? (
        <>
          <View style={styles.suggestedAccountView}>
            <Text style={styles.suggestedAccountText}>
              {strings.suggested_account}
            </Text>
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              style={styles.flatList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={ListEmptyComponentData}
            />
          </View>
        </>
      ) : (
        <>
          <FlatList
            data={users}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={ListEmptyComponentData}
            style={styles.mH25}
          />
        </>
      )}
    </View>
  );
};
export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  searchInput: {
    borderRadius: rw(12),
    marginBottom: rh(5),
    fontSize: 15,
    marginTop: rh(15),
  },

  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rh(20),
    paddingHorizontal: rw(15),
    paddingVertical: rh(10),
    backgroundColor: colors.white,
    borderRadius: rw(10),

    shadowColor: '#837e7e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,

    elevation: 8,
  },

  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: rw(55),
    height: rw(55),
    borderRadius: rw(100),
    marginRight: rw(12),
  },

  username: {
    fontSize: rf(16),
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  name: {
    fontSize: rf(14),
    textTransform: 'capitalize',
  },

  followButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: rw(18),
    paddingVertical: rh(8),
    borderRadius: rw(8),
    minWidth: rw(100),
    alignItems: 'center',
  },

  followingButton: {
    backgroundColor: '#dbdbdb',
  },
  followingText: {
    color: 'black',
  },

  followText: {
    color: '#fff',
    fontWeight: '600',
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: rh(250),
  },

  emptyText: {
    color: '#777',
    fontSize: rf(16),
  },
  suggestedAccountView: {
    backgroundColor: colors.white,
    marginHorizontal: rw(10),
    borderRadius: rw(10),
  },
  suggestedAccountText: {
    fontSize: rf(17),
    fontWeight: 'bold',
    paddingHorizontal: rw(15),
    marginVertical: rh(10),
  },
  flatList: { marginHorizontal: rw(10) },
  mH25: { marginHorizontal: rw(25) },
});
