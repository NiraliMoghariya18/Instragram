import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import { defaultImages, images } from '../../utils/images';
import CustomInput from '../../components/common/CustomInput';
import { colors } from '../../utils/color';
import CustomButton from '../../components/common/CustomButton';
import { rf, rh, rw } from '../../utils/responsive';
import { strings } from '../../utils/strings';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackRootScreen } from '../../types/navigationtype';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import { onGoogleButtonPress } from '../../functions/auth/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import RadioButton from '../../components/common/CustomRadioButton';
import auth from '@react-native-firebase/auth';
import { auths } from '../../utils/firebaseConfig';
import messaging from '@react-native-firebase/messaging';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/Theme';
import { Theme } from '../../types/screens';
import Toast from 'react-native-toast-message';

interface Error {
  firstName?: string;
  lastName?: string;
  gender?: string;
  phoneNo?: string;
  dob?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setConfirmPasswordSecure] = useState(true);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { t } = useTranslation();
  const [gender, setGender] = useState<string | undefined>(t('male'));
  const [phoneNo, setPhoneNo] = useState<string>('');
  const [dob, setDob] = useState('');
  const [errors, setErrors] = useState<Error>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();
  const route = useRoute();
  const params = route.params as { email: string; firstName: string };

  useEffect(() => {
    if (params) {
      setEmail(params?.email);
      setFirstName(params?.firstName);
    }
  }, [params]);

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(image => {
        setProfileImage(image.path);
      })
      .catch(err => {
        console.log('User cancelled or error:', err);
      });
  };
  const handleSuccess = () => {
    Toast.show({
      type: 'success',
      text1: t('sigUp_successfully'),
    });
  };

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);

    return defaultImages[randomIndex];
  };

  const radioButtons = [t('male'), t('female'), t('other')];

  const validate = () => {
    const newErrors: Error = {};

    if (!firstName.trim()) newErrors.firstName = t('firstName_validation');
    if (!lastName.trim()) newErrors.lastName = t('lastName_validation');

    if (!phoneNo.trim()) {
      newErrors.phoneNo = t('phoneNumber_validation');
    } else if (!/^\d{10,}$/.test(phoneNo.replace(/[-+() ]/g, ''))) {
      newErrors.phoneNo = t('invalid_phoneNumber_validation');
    }

    if (!gender) newErrors.gender = t('gender_validation');

    if (!dob) newErrors.dob = t('DOB_validation');

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

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('confirm_pass_validation');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('not_match_pass');
    }

    const today = new Date();
    const tenYearsAgo = new Date(
      today.getFullYear() - 10,
      today.getMonth(),
      today.getDate(),
    );

    if (date > tenYearsAgo) {
      newErrors.dob = t('date_validation');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { isGoogleUser }: any = route.params || {};

  const handleSignUp = async () => {
    if (!validate()) return;
    const randomProfileImage = getRandomImage();

    try {
      let uid = '';

      if (isGoogleUser) {
        const currentUser = auth().currentUser;

        if (!currentUser) throw new Error('No authenticated user found.');
        uid = currentUser?.uid;
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auths,
          email,
          password,
        );
        uid = userCredential.user.uid;
      }

      const token = await messaging().getToken();

      await firestore().collection('users').doc(uid).set(
        {
          userId: uid,
          profileImage: randomProfileImage,
          firstName: firstName.toLowerCase(),
          lastName: lastName.toLowerCase(),
          gender,
          phoneNo,
          dob,
          email,
          followers: [],
          following: [],
          fcmToken: token,
          createdAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      if (isGoogleUser) {
        await auth().signOut();
      }
      handleSuccess();
      navigation.replace('Login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Sign Up Error', error.message);
      }
    }
  };

  const signIn = () => {
    navigation.navigate('Login');
  };

  const onChangeFirstName = (text: string) => {
    setFirstName(text);
    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
  };

  const onChangeLastName = (text: string) => {
    setLastName(text);
    if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
  };

  const onChangePhoneNo = (text: string) => {
    setPhoneNo(text);
    if (errors.phoneNo) setErrors(prev => ({ ...prev, phoneNo: '' }));
  };

  const onChangeEmail = (text: string) => {
    setEmail(text);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  const onChangePassword = (text: string) => {
    setPassword(text);
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  const onChangeConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword)
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
  };

  const onConfirmDob = (selectedDate: Date) => {
    setOpen(false);
    setDate(selectedDate);
    setDob(selectedDate.toLocaleDateString());
    if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
  };

  const onSelectGender = (selectedGender: string) => {
    setGender(selectedGender);
    if (errors.gender) setErrors(prev => ({ ...prev, gender: '' }));
  };
  const { currentTheme } = useTheme();
  const styles = inlineStyle(currentTheme);
  return (
    <KeyboardAvoidingView style={styles.container}>
      <SafeAreaView>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.textContainer}>
            <Text style={styles.headerImage}>{strings.instagram}</Text>
          </View>
          <View style={styles.profileView}>
            <TouchableOpacity
              onPress={selectImage}
              style={styles.imagePickerField}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.preview} />
              ) : (
                <Image source={images.add} resizeMode="contain" />
              )}
            </TouchableOpacity>
          </View>
          <CustomInput
            placeholder={t('firstName')}
            value={firstName}
            onChangeText={onChangeFirstName}
            placeholderTextColor={colors.lightGray}
            error={errors.firstName}
            style={styles.inputStyle}
          />
          <CustomInput
            placeholder={t('lastName')}
            value={lastName}
            onChangeText={onChangeLastName}
            placeholderTextColor={colors.lightGray}
            error={errors.lastName}
            style={styles.inputStyle}
          />
          <View style={styles.radioView}>
            <Text style={styles.radioText}>{t('gender')}</Text>

            <View style={styles.radioButtonInnerView}>
              {radioButtons.map(option => (
                <RadioButton
                  key={option}
                  label={option}
                  selected={gender === option}
                  onSelect={() => onSelectGender(option)}
                  error={errors.gender}
                  style={styles.radioButton}
                />
              ))}
            </View>
          </View>

          <CustomInput
            placeholder={t('phoneNo')}
            placeholderTextColor={colors.lightGray}
            value={phoneNo}
            onChangeText={onChangePhoneNo}
            error={errors.phoneNo}
            style={styles.inputStyle}
          />
          <CustomInput
            placeholder={t('dob')}
            placeholderTextColor={colors.lightGray}
            value={moment(date).format('YYYY-MM-DD')}
            onPressIn={() => setOpen(true)}
            error={errors.dob}
            style={styles.inputStyle}
          />
          <DatePicker
            modal
            mode="date"
            open={open}
            date={date}
            onConfirm={onConfirmDob}
            onCancel={() => {
              setOpen(false);
            }}
            maximumDate={new Date()}
          />
          <CustomInput
            placeholder={t('email')}
            placeholderTextColor={colors.lightGray}
            value={email}
            onChangeText={onChangeEmail}
            error={errors.email}
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
            style={styles.inputStyle}
          />
          <CustomInput
            placeholderTextColor={colors.lightGray}
            placeholder={t('confirmPassword')}
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry={isConfirmPasswordSecure}
            imageStyle={styles.eye}
            rightImage={isConfirmPasswordSecure ? images.hidePass : images.eye}
            onPressImage={() =>
              setConfirmPasswordSecure(!isConfirmPasswordSecure)
            }
            style={styles.inputStyle}
          />

          <CustomButton label={t('signUp')} onPress={handleSignUp} />
          <Text style={styles.accountText}>
            {t('haveAccount')}
            <Text style={styles.color} onPress={signIn}>
              {' '}
              {t('signHere')}
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
            textStyle={styles.colorBlue}
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
    headerImage: {
      fontSize: rf(40),
      fontFamily: 'GrandHotel-Regular',
      textAlign: 'center',
      marginBottom: rh(24),
      color: currentTheme.text,
    },

    accountText: {
      fontSize: rf(16),
      textAlign: 'center',
      marginTop: rh(12),
      marginBottom: rh(30),
      color: currentTheme.text,
    },
    color: { color: colors.blue },
    textContainer: {
      justifyContent: 'center',
    },
    eye: {
      width: rw(18),
      height: rw(18),
    },
    imagePickerField: {
      height: rw(120),
      width: rw(120),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.blueGray,
      marginVertical: rh(10),
      borderRadius: rw(100),
      backgroundColor: currentTheme.googleButton,
    },
    preview: {
      height: rw(120),
      width: rw(120),
      borderRadius: rw(100),
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

    imageStyle: { width: rw(20), height: rh(20) },
    customButtonStyle: {
      marginBottom: rh(30),
      backgroundColor: currentTheme.googleButton,
    },
    colorBlue: { color: colors.blue },
    profileView: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: rh(20),
    },
    radioText: {
      fontSize: rf(16),
      fontWeight: 600,
      marginBottom: rh(7),
      color: currentTheme.text,
    },
    radioButton: { color: currentTheme.text },
    radioView: {
      marginHorizontal: rw(28),
      marginBottom: rh(12),
    },
    radioButtonInnerView: {
      flexDirection: 'row',
      gap: rw(20),
    },
  });

export default SignUp;
