import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth, { GoogleAuthProvider } from '@react-native-firebase/auth';

// export async function onGoogleButtonPress(navigation: any) {
//   try {
//     await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

//     if (Platform.OS === 'android') {
//       const isGoogleSignIn = await GoogleSignin.hasPreviousSignIn();
//       if (isGoogleSignIn) {
//         await GoogleSignin.revokeAccess();
//         await GoogleSignin.signOut();
//         await auth.signOut();
//       }
//     }

//     const signInResult = await GoogleSignin.signIn();
//     let idToken = signInResult.data?.idToken;
//     let user = signInResult.data?.user;

//     if (!idToken) {
//       throw new Error('No ID token found');
//     }

//     const googleCredential = GoogleAuthProvider.credential(idToken);

//     await signInWithCredential(auth, googleCredential);
//     navigation.navigate('SignUp', {
//       email: user?.email,
//       name: user?.name,
//     });
//   } catch (error) {
//     console.error('Google Error:', error);
//     throw error;
//   }
// }
export async function onGoogleButtonPress(navigation: any) {
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
    console.log('userCredential :>> ', userCredential);

    const isNewUser = (userCredential as any).additionalUserInfo?.isNewUser;
    if (isNewUser) {
      console.log('isNewUser :>> ', isNewUser);
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
      console.log('navigation :>> ');
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
