import React, { useEffect, useState } from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import SignUp from '../screens/auth/SignUp';
import Login from '../screens/auth/Login';
import DrawerNavigation from './DrawerNavigation';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { StackRootScreen } from '../types/navigationtype';
import auth from '@react-native-firebase/auth';
import EditProfile from '../screens/app/EditProfile';
import Followers from '../screens/app/Followers';
import Following from '../screens/app/Following';
import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import { navigate } from '../services/navigationService';
import firestore from '@react-native-firebase/firestore';
const Stack = createStackNavigator<StackRootScreen>();

const StackNavigation = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();

  const initialRoute = user ? 'DrawerNavigation' : 'Login';

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async userState => {
      setUser(userState);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const saveTokenToFirestore = async (token: string) => {
      try {
        await firestore().collection('users').doc(user.uid).update({
          fcmToken: token,
        });
      } catch (error) {
        console.error('Error updating FCM token:', error);
      }
    };

    messaging()
      .getToken()
      .then(token => {
        if (token) {
          saveTokenToFirestore(token);
        }
      });

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      saveTokenToFirestore(token);
    });

    return () => {
      unsubscribeTokenRefresh();
    };
  }, [user]);

  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      const targetScreen = remoteMessage?.data?.screen as string;

      if (remoteMessage?.data?.screen === 'Notification') {
        navigate(targetScreen);
      }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        const targetScreen = remoteMessage?.data?.screen as string;

        if (targetScreen === 'Notification') {
          navigate(targetScreen);
        }
      });

    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const screens = detail.notification?.data?.screen;

        if (screens === 'Notification') {
          navigate(screens);
        }
      }
    });

    return () => {
      unsubscribeNotifee();
    };
  }, [navigation]);

  if (loading) {
    return null;
  }
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen
        name="DrawerNavigation"
        component={DrawerNavigation}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Followers"
        component={Followers}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Following"
        component={Following}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigation;
