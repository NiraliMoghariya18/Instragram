import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Alert,
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
interface FormError {
  email?: string;
  password?: string;
}
const languages = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
];
const Login = () => {
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormError>({});
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [value, setValue] = useState('en');

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
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    if (!validate()) return;

    try {
      await auth().signInWithEmailAndPassword(email, password);

      navigation.navigate('DrawerNavigation');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  };
  return (
    <KeyboardAvoidingView style={styles.container}>
      <SafeAreaView>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.dropDownView}>
            <Dropdown
              style={styles.dropDown}
              selectedTextStyle={styles.selectedTextStyle}
              containerStyle={styles.dropDownContainer}
              data={languages}
              labelField="label"
              valueField="value"
              placeholder={strings.language}
              value={value}
              onChange={item => setValue(item.value)}
            />
          </View>

          <View style={styles.textContainer}>
            {/* <Image
              source={images.instagramLogo}
              style={styles.headerImage}
              resizeMode="contain"
            /> */}
            <Text style={styles.headerImage}>{strings.instagram}</Text>
          </View>

          <CustomInput
            placeholder={strings.email}
            value={email}
            onChangeText={onChangeEmail}
            placeholderTextColor={colors.lightGray}
            error={errors.email}
            variant="primary"
          />

          <CustomInput
            placeholder={strings.password}
            value={password}
            onChangeText={onChangePassword}
            placeholderTextColor={colors.lightGray}
            secureTextEntry={isPasswordSecure}
            error={errors.password}
            imageStyle={styles.eye}
            rightImage={isPasswordSecure ? images.hidePass : images.eye}
            onPressImage={() => setIsPasswordSecure(!isPasswordSecure)}
            variant="primary"
          />

          <CustomButton
            label={strings.login}
            onPress={() => handleLogin({ email, password })}
          />

          <Text style={styles.lastLineText}>
            {strings.DoNotAccount}
            <Text style={styles.subText} onPress={signUp}>
              {' '}
              {strings.signUpHere}
            </Text>
          </Text>

          <View style={styles.subContainer}>
            <View style={styles.line} />
            <Text style={styles.text}>{strings.or}</Text>
            <View style={styles.line} />
          </View>
          <CustomButton
            label={strings.googleSignup}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerImage: {
    fontSize: rf(40),
    fontFamily: 'GrandHotel-Regular',
    alignSelf: 'center',
    marginBottom: rh(24),
  },
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
  dropDownContainer: { width: rw(120) },
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
  },
  subText: { color: colors.blue },

  selectedTextStyle: {
    fontSize: rf(16),
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: { width: rw(20), height: rh(20) },
  customButtonStyle: { backgroundColor: colors.offWhite, marginBottom: rh(30) },
  textStyle: { color: colors.blue },
});

export default Login;
