import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth, { GoogleAuthProvider } from '@react-native-firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackRootScreen } from '../../types/navigationtype';

export async function onGoogleButtonPress(
  navigation: StackNavigationProp<StackRootScreen>,
) {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    if (Platform.OS === 'android') {
      const isGoogleSignIn = await GoogleSignin.hasPreviousSignIn();
      if (isGoogleSignIn) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
    }

    const signInResult = await GoogleSignin.signIn();
    let idToken = signInResult.data?.idToken;
    let user = signInResult.data?.user;

    if (!idToken) {
      throw new Error('No ID token found');
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);

    const isNewUser = userCredential.additionalUserInfo?.isNewUser;
    if (isNewUser) {
      const nameParts = user?.name ? user.name.split(' ') : [];
      const firstName = nameParts[0] || '';

      const lastName = nameParts.slice(1).join(' ') || '';

      navigation.navigate('SignUp', {
        email: user?.email,
        firstName: firstName,
        lastName: lastName,
        isGoogleUser: true,
      });
    } else {
      navigation.navigate('DrawerNavigation', {
        screen: 'BottomTabNavigation',
        params: { screen: 'Home' },
      });
    }
  } catch (error) {
    console.error('Google Error:', error);
    throw error;
  }
}
