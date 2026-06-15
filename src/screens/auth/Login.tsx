import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Alert,
  I18nManager,
  NativeModules,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import CustomInput from '../../components/common/CustomInput';
import { images } from '../../utils/images';
import CustomButton from '../../components/common/CustomButton';
import { rf, rh, rw } from '../../utils/responsive';
import { colors } from '../../utils/color';
import { strings } from '../../utils/strings';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackRootScreen } from '../../types/navigationtype';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { onGoogleButtonPress } from '../../functions/auth/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/Theme';
import { Theme } from '../../types/screens';
import Toast from 'react-native-toast-message';

interface FormError {
  email?: string;
  password?: string;
}

const Login = () => {
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormError>({});
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const { t, i18n } = useTranslation();
  const [value, setValue] = useState(i18n.language || 'en');
  const languages = [
    { label: t('english'), value: 'en' },
    { label: t('hindi'), value: 'hi' },
    { label: t('arabic'), value: 'ar' },
  ];
  const { currentTheme } = useTheme();
  const handleSuccess = () => {
    Toast.show({
      type: 'success',
      text1: t('login_successfully'),
    });
  };

  useEffect(() => {
    if (i18n.language && i18n.language !== value) {
      setValue(i18n.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const changeLanguage = async (langCode: string) => {
    await i18n.changeLanguage(langCode);

    const isRTL = langCode === 'ar';

    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      NativeModules.DevSettings.reload();
    }
  };

  const signUp = () => {
    navigation.navigate('SignUp');
  };

  const onChangeEmail = (text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };
  const onChangePassword = (text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '437698094226-7f1n74ks1n7psic47j0b05u3q3joh8kr.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  const validate = () => {
    const newErrors: FormError = {};

    if (!email.trim()) {
      newErrors.email = t('email_validation');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('invalid_email');
    }

    if (!password.trim()) {
      newErrors.password = t('password_validation');
    } else if (password.length < 6) {
      newErrors.password = t('invalid_password');
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  async function saveTokenToDatabase(token: string) {
    let uid = auth().currentUser?.uid;
    if (uid) {
      await firestore().collection('users').doc(uid).update({
        fcmToken: token,
      });
    }
  }

  useEffect(() => {
    messaging()
      .getToken()
      .then(token => {
        return saveTokenToDatabase(token);
      });

    return messaging().onTokenRefresh(token => {
      saveTokenToDatabase(token);
    });
  }, []);

  const handleLogin = async ({
    // eslint-disable-next-line @typescript-eslint/no-shadow
    email,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    password,
  }: {
    email: string;
    password: string;
  }) => {
    if (!validate()) return;
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const uid = userCredential.user.uid;

      const token = await messaging().getToken();

      await firestore().collection('users').doc(uid).update({
        fcmToken: token,
      });
      handleSuccess();
      navigation.replace('DrawerNavigation');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  };
  const styles = inlineStyle(currentTheme);
  return (
    <KeyboardAvoidingView style={styles.container}>
      <SafeAreaView>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.dropDownView}>
            <Dropdown
              style={styles.dropDown}
              selectedTextStyle={styles.selectedTextStyle}
              containerStyle={styles.dropDownContainer}
              itemTextStyle={styles.itemTextStyle}
              data={languages}
              labelField="label"
              valueField="value"
              placeholder={t('language')}
              value={value}
              onChange={item => {
                setValue(item.value);
                changeLanguage(item?.value);
              }}
              activeColor={currentTheme.background}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.headerText}>{strings.instagram}</Text>
          </View>

          <CustomInput
            placeholder={t('email')}
            value={email}
            onChangeText={onChangeEmail}
            placeholderTextColor={colors.lightGray}
            error={errors.email}
            variant="primary"
            style={styles.inputStyle}
          />

          <CustomInput
            placeholder={t('password')}
            value={password}
            onChangeText={onChangePassword}
            placeholderTextColor={colors.lightGray}
            secureTextEntry={isPasswordSecure}
            error={errors.password}
            imageStyle={styles.eye}
            rightImage={isPasswordSecure ? images.hidePass : images.eye}
            onPressImage={() => setIsPasswordSecure(!isPasswordSecure)}
            variant="primary"
            style={styles.inputStyle}
          />

          <CustomButton
            label={t('login')}
            onPress={() => handleLogin({ email, password })}
          />

          <Text style={styles.lastLineText}>
            {t('DoNotAccount')}
            <Text style={styles.subText} onPress={signUp}>
              {' '}
              {t('signUpHere')}
            </Text>
          </Text>

          <View style={styles.subContainer}>
            <View style={styles.line} />
            <Text style={styles.text}>{t('or')}</Text>
            <View style={styles.line} />
          </View>
          <CustomButton
            label={t('googleSignup')}
            onPress={() => onGoogleButtonPress(navigation)}
            leftImage={images.google}
            imageStyle={styles.imageStyle}
            style={styles.customButtonStyle}
            textStyle={styles.textStyle}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const inlineStyle = (currentTheme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    headerText: {
      fontSize: rf(40),
      fontFamily: 'GrandHotel-Regular',
      marginHorizontal: rw(50),
      textAlign: 'center',
      marginBottom: rh(24),
      color: currentTheme.text,
    },
    inputStyle: { backgroundColor: currentTheme.background },
    subContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: rw(28),
    },
    line: {
      flex: 1,
      height: rh(2),
      backgroundColor: colors.mediumDarkGray,
    },
    text: {
      textAlign: 'center',
      marginHorizontal: rw(20),
      color: colors.gray,
    },
    eye: {
      width: rw(18),
      height: rw(18),
    },
    dropDown: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropDownContainer: {
      width: rw(120),
      backgroundColor: currentTheme.background,
    },
    itemTextStyle: { color: currentTheme.text },
    dropDownView: {
      width: rw(120),
      alignSelf: 'center',
      marginBottom: rh(45),
    },

    textContainer: {
      paddingTop: rh(140),
      justifyContent: 'center',
      paddingHorizontal: rw(28),
    },

    lastLineText: {
      fontSize: rf(15),
      textAlign: 'center',
      marginTop: rh(12),
      marginBottom: rh(32),
      marginHorizontal: rw(28),
      color: currentTheme.text,
    },
    subText: { color: colors.blue },

    selectedTextStyle: {
      fontSize: rf(16),
      flex: 0,
      alignItems: 'center',
      justifyContent: 'center',
      color: currentTheme.text,
    },
    imageStyle: { width: rw(20), height: rh(20) },
    customButtonStyle: {
      marginBottom: rh(30),
      backgroundColor: currentTheme.googleButton,
    },
    textStyle: { color: colors.blue },
  });

export default Login;
