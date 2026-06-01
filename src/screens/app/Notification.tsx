import React, { useEffect, useState } from 'react';

import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { rf, rh, rw } from '../../utils/responsive';
import { colors } from '../../utils/color';
import Toast from 'react-native-toast-message';
import { strings } from '../../utils/strings';

interface RequestType {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted';

  senderData?: {
    firstName: string;
    lastName: string;
    username: string;
    profileImage: string;
  };
}

const Notification = () => {
  const currentUserId = auth().currentUser?.uid;

  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = firestore()
      .collection('followRequests')
      .where('receiverId', '==', currentUserId)
      .where('status', '==', 'pending')
      .onSnapshot(async snapshot => {
        try {
          const requestList = await Promise.all(
            snapshot.docs.map(async doc => {
              const requestData = doc.data();

              const senderDoc = await firestore()
                .collection('users')
                .doc(requestData.senderId)
                .get();

              return {
                id: doc.id,
                ...requestData,
                senderData: senderDoc.data(),
              };
            }),
          );

          setRequests(requestList as RequestType[]);
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      });

    return () => unsubscribe();
  }, []);

  const handleSuccess = (firstName: string) => {
    Toast.show({
      type: 'success',
      text1: `✅ Accepted the follow Req ${firstName} `,
    });
  };

  const handleDeleteReq = (firstName: string) => {
    Toast.show({
      type: 'success',
      text1: `✅ Deleted follow Req ${firstName} `,
    });
  };
  const acceptRequest = async (
    requestId: string,
    senderId: string,
    firstName: string,
  ) => {
    try {
      setRequests(prev => prev.filter(item => item.id !== requestId));

      const batch = firestore().batch();

      const requestRef = firestore()
        .collection('followRequests')
        .doc(requestId);
      batch.update(requestRef, { status: 'accepted' });

      const currentUserRef = firestore().collection('users').doc(currentUserId);
      batch.update(currentUserRef, {
        followers: firestore.FieldValue.arrayUnion(senderId),
      });

      const senderUserRef = firestore().collection('users').doc(senderId);
      batch.update(senderUserRef, {
        following: firestore.FieldValue.arrayUnion(currentUserId),
      });
      handleSuccess(firstName);
      await batch.commit();
    } catch (error) {
      console.error('Error accepting follow request:', error);
    }
  };

  const cancelRequest = async (requestId: string, firstName: string) => {
    try {
      setRequests(prev => prev.filter(item => item.id !== requestId));

      await firestore().collection('followRequests').doc(requestId).delete();
      handleDeleteReq(firstName);
    } catch (error) {
      console.log(error);
    }
  };

  const renderItem = ({ item }: { item: RequestType }) => {
    const name = item.senderData?.firstName ?? '';
    return (
      <View style={styles.card}>
        <View style={styles.leftContainer}>
          <Image
            source={{
              uri: item.senderData?.profileImage,
            }}
            style={styles.image}
          />
          <View>
            <Text style={styles.username}>
              {item.senderData?.firstName || ''}
            </Text>
            <Text style={styles.name}>{item.senderData?.lastName}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => acceptRequest(item.id, item.senderId, name)}
          >
            <Text style={styles.buttonAcceptText}>{strings.accept}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelRequest(item.id, name)}
          >
            <Text style={styles.buttonText}>{strings.delete}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ListEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{strings.loading}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{strings.noNotification}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        ListEmptyComponent={() => {
          if (loading) {
            return (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{strings.loading}</Text>
              </View>
            );
          }

          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{strings.noNotification}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  card: {
    borderRadius: rw(10),
    padding: rh(15),
    marginVertical: rh(15),
    backgroundColor: colors.white,
    marginHorizontal: rw(10),

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

  image: {
    width: rw(55),
    height: rw(55),
    borderRadius: rw(100),
    marginRight: rw(12),
  },

  username: {
    fontSize: rf(16),
    fontWeight: '700',
  },

  name: {
    fontSize: rf(14),
    color: '#999',
    marginTop: rh(3),
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: rh(15),
  },

  acceptButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: rw(18),
    paddingVertical: rh(10),
    borderRadius: rw(8),
    marginRight: rw(10),
    flex: 1,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#dbdbdb',
    paddingHorizontal: rw(18),
    paddingVertical: rh(10),
    borderRadius: rw(8),
    flex: 1,
    alignItems: 'center',
  },

  buttonText: {
    color: colors.black,
    fontWeight: '600',
  },
  buttonAcceptText: {
    color: colors.white,
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
});
