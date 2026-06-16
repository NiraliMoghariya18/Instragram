import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import BootSplash from 'react-native-bootsplash';
import StackNavigation from './src/navigations/StackNavigation';
import 'react-native-url-polyfill/auto';
import Toast from 'react-native-toast-message';
import 'react-native-url-polyfill/auto';
import { ThemeProvider } from './src/context/Theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {
  navigationRef,
  processPendingActions,
} from './src/services/navigationService';
import firestore from '@react-native-firebase/firestore';
import './src/services/i18n';
import auth from '@react-native-firebase/auth';
// import { I18nextProvider } from 'react-i18next';
// import i18next from './src/services/i18n';
import './src/services/i18n';
// import Profile from './src/screens/app/Profile';

const App = () => {
  useEffect(() => {
    const setupFCM = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }

        const authStatus = await messaging().requestPermission();

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          await messaging().registerDeviceForRemoteMessages();
          await messaging().subscribeToTopic('public_notes_topic');
        }
      } catch (error) {
        console.log('FCM ERROR:', error);
      }
    };

    setupFCM();

    const unsubscribe = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        try {
          const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
          });

          await notifee.displayNotification({
            title:
              remoteMessage?.notification?.title ||
              (typeof remoteMessage?.data?.title === 'string'
                ? remoteMessage?.data?.title
                : 'Notification'),

            body:
              remoteMessage?.notification?.body ||
              (typeof remoteMessage?.data?.body === 'string'
                ? remoteMessage.data.body
                : String(remoteMessage?.data?.body || '')),

            android: {
              channelId,
              smallIcon: 'ic_launcher',
              pressAction: {
                id: 'default',
              },
            },
            data: remoteMessage.data,
          });
        } catch (error) {
          console.log('NOTIFICATION ERROR:', error);
        }
      },
    );

    const unsubscribeToken = messaging().onTokenRefresh(token => {
      saveTokenToDatabase(token);
    });

    return () => {
      unsubscribe();
      unsubscribeToken();
    };
  }, []);

  async function saveTokenToDatabase(token: string) {
    let uid = auth().currentUser?.uid;

    await firestore().collection('users').doc(uid).update({
      fcmToken: token,
    });
  }

  const linking: any = {
    prefixes: ['myapp://', 'https://myapp.com'],
    config: {
      screens: {
        DrawerNavigation: {
          screens: {
            Home: 'home',
          },
        },
        UserProfile: 'userProfile/:userId',
      },
    },
  };

  return (
    <>
      <SafeAreaProvider style={{ flex: 1 }}>
        <ThemeProvider>
          {/* <I18nextProvider i18n={i18next}> */}
          <NavigationContainer
            onReady={() => {
              processPendingActions();
              BootSplash.hide({ fade: true });
            }}
            ref={navigationRef}
            linking={linking}
          >
            <StackNavigation />
          </NavigationContainer>
          {/* </I18nextProvider> */}
          <Toast />
        </ThemeProvider>
      </SafeAreaProvider>
    </>
  );
};

export default App;
