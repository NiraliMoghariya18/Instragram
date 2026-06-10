import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from '../screens/auth/SignUp';
import Login from '../screens/auth/Login';
import DrawerNavigation from './DrawerNavigation';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { StackRootScreen } from '../types/navigationtype';
import auth from '@react-native-firebase/auth';
import EditProfile from '../screens/app/EditProfile';
import Followers from '../screens/app/Followers';
import Following from '../screens/app/Following';

const Stack = createStackNavigator<StackRootScreen>();

const StackNavigation = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  const initialRoute = user ? 'DrawerNavigation' : 'Login';

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(userState => {
      setUser(userState);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
