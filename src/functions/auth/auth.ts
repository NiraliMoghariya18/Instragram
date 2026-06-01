import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../utils/firebaseConfig';

export async function onGoogleButtonPress(navigation: any) {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    if (Platform.OS === 'android') {
      const isGoogleSignIn = await GoogleSignin.hasPreviousSignIn();
      if (isGoogleSignIn) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        await auth.signOut();
      }
    }

    const signInResult = await GoogleSignin.signIn();
    let idToken = signInResult.data?.idToken;
    let user = signInResult.data?.user;

    if (!idToken) {
      throw new Error('No ID token found');
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);

    await signInWithCredential(auth, googleCredential);
    navigation.navigate('SignUp', {
      email: user?.email,
      name: user?.name,
    });
  } catch (error) {
    console.error('Google Error:', error);
    throw error;
  }
}
// export async function onGoogleButtonPress(navigation: any) {
//   try {
//     await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

//     // REMOVE THE REVOKE/SIGNOUT LOGIC HERE
//     // It was forcing the user to re-authenticate and clearing state every time.

//     const signInResult = await GoogleSignin.signIn();
//     let idToken = signInResult.data?.idToken;
//     let user = signInResult.data?.user;

//     if (!idToken) {
//       throw new Error('No ID token found');
//     }

//     const googleCredential = GoogleAuthProvider.credential(idToken);

//     // 1. Capture the user credential result from Firebase
//     const userCredential = await signInWithCredential(auth, googleCredential);
//     console.log('userCredential :>> ', userCredential);
//     // 2. Check if the user is completely new to Firebase
//     const isNewUser = userCredential?._tokenResponse?.isNewUser;

//     // 3. Conditional navigation based on user history
//     if (isNewUser) {
//       // First time logging in -> Go to registration/signup screen
//       navigation.navigate('SignUp', {
//         email: user?.email,
//         name: user?.name,
//       });
//     } else {
//       // Already registered before -> Go directly to the main screen
//       navigation.navigate('Home'); // Replace 'Home' with your main screen name
//     }
//   } catch (error) {
//     console.error('Google Error:', error);
//     throw error;
//   }
// }
