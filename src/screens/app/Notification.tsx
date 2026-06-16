import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useTheme } from '../../context/Theme';
import { RequestType, Theme } from '../../types/screens';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../navigations/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

const Notification = () => {
  const currentUserId = auth().currentUser?.uid;
  const { currentTheme } = useTheme();
  const { t } = useTranslation();
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
          if (error instanceof Error) {
            Alert.alert('Error', 'Something went wrong');
          }
        }
      });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const styles = inlineStyle(currentTheme);
  const handleSuccess = (firstName: string) => {
    Toast.show({
      type: 'success',
      text1: t('accept_follow_req', { name: firstName }),
    });
  };

  const handleDeleteReq = () => {
    Toast.show({
      type: 'success',
      text1: t('delete_follow_req'),
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
      if (error instanceof Error) {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      setRequests(prev => prev.filter(item => item.id !== requestId));

      await firestore().collection('followRequests').doc(requestId).delete();
      handleDeleteReq();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', 'Something went wrong');
      }
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
            <Text style={styles.username}>{name || ''}</Text>
            <Text style={styles.name}>
              {name || ''} {item.senderData?.lastName}
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => acceptRequest(item.id, item.senderId, name)}
          >
            <Text style={styles.buttonAcceptText}>{t('accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelRequest(item.id)}
          >
            <Text style={styles.buttonText}>{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const ListEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size={'large'} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('noNotification')}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={styles.safeAreaViewStyle}
    >
      <CustomHeader route={t('notifi')} />
      <View style={styles.container}>
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainerStyle}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
    </SafeAreaView>
  );
};

export default Notification;

const inlineStyle = (currentTheme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    safeAreaViewStyle: { backgroundColor: currentTheme.background, flex: 1 },

    card: {
      borderRadius: rw(10),
      padding: rh(15),
      marginVertical: rh(5),
      backgroundColor: currentTheme.card,
      marginHorizontal: rw(10),

      shadowColor: colors.lightGray,
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
      color: currentTheme.text,
    },

    name: {
      fontSize: rf(14),
      marginTop: rh(3),
      color: currentTheme.text,
    },

    buttonContainer: {
      flexDirection: 'row',
      marginTop: rh(15),
    },

    acceptButton: {
      backgroundColor: colors.blue,
      paddingHorizontal: rw(18),
      paddingVertical: rh(10),
      borderRadius: rw(8),
      marginRight: rw(10),
      flex: 1,
      alignItems: 'center',
    },

    cancelButton: {
      backgroundColor: colors.mediumDarkGray,
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
      fontSize: rf(16),
      color: currentTheme.text,
    },
    contentContainerStyle: {
      paddingBottom: rh(20),
      marginTop: rh(20),
    },
  });
