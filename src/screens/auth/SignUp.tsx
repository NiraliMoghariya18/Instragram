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
import { images } from '../../utils/images';
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
import { auth } from '../../utils/firebaseConfig';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import RadioButton from '../../components/common/CustomRadioButton';

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
  const [gender, setGender] = useState<string | undefined>('Male');
  const [phoneNo, setPhoneNo] = useState<string>('');
  const [dob, setDob] = useState('');
  const [errors, setErrors] = useState<Error>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();
  const route = useRoute();
  const params = route.params as { email: string; name: string };

  useEffect(() => {
    if (params) {
      setEmail(params?.email);
      setFirstName(params?.name);
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
  const defaultImages = [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/women/2.jpg',
    'https://randomuser.me/api/portraits/men/3.jpg',
    'https://randomuser.me/api/portraits/women/4.jpg',
    'https://randomuser.me/api/portraits/men/5.jpg',
    'https://randomuser.me/api/portraits/women/6.jpg',
    'https://randomuser.me/api/portraits/men/7.jpg',
    'https://randomuser.me/api/portraits/women/8.jpg',
    'https://randomuser.me/api/portraits/men/9.jpg',
    'https://randomuser.me/api/portraits/women/10.jpg',
  ];

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);

    return defaultImages[randomIndex];
  };

  const radioButtons = ['Male', 'Female', 'Other'];

  const validate = () => {
    const newErrors: Error = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!phoneNo.trim()) {
      newErrors.phoneNo = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(phoneNo.replace(/[-+() ]/g, ''))) {
      newErrors.phoneNo = 'Invalid phone number format';
    }

    if (!gender) newErrors.gender = 'Gender selection is required';

    if (!dob) newErrors.dob = 'Date of birth is required';

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

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    const today = new Date();
    const tenYearsAgo = new Date(
      today.getFullYear() - 10,
      today.getMonth(),
      today.getDate(),
    );

    if (date > tenYearsAgo) {
      newErrors.dob = 'You must be at least 10 years old.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSignUp = async () => {
    if (!validate()) return;
    const randomProfileImage = getRandomImage();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      await firestore().collection('users').doc(uid).set({
        profileImage: randomProfileImage,
        firstName,
        lastName,
        gender,
        phoneNo,
        dob,
        email,
        password,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await signOut(auth);

      navigation.replace('Login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert(error.message);
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
  // const [selectedOption, setSelectedOption] = useState('Option 1');
  return (
    <KeyboardAvoidingView style={styles.container}>
      <SafeAreaView>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.textContainer}>
            {/* <Image
              source={images.instagramLogo}
              style={styles.headerImage}
              resizeMode="contain"
            /> */}
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
            placeholder={strings.firstName}
            value={firstName}
            onChangeText={onChangeFirstName}
            placeholderTextColor={colors.lightGray}
            error={errors.firstName}
          />
          <CustomInput
            placeholder={strings.lastName}
            value={lastName}
            onChangeText={onChangeLastName}
            placeholderTextColor={colors.lightGray}
            error={errors.lastName}
          />
          <View style={styles.radioView}>
            <Text style={styles.radioText}>{strings.gender}</Text>

            <View style={styles.radioButtonInnerView}>
              {radioButtons.map(option => (
                <RadioButton
                  key={option}
                  label={option}
                  selected={gender === option}
                  onSelect={() => onSelectGender(option)}
                />
              ))}
            </View>
          </View>

          <CustomInput
            placeholder={strings.phoneNo}
            placeholderTextColor={colors.lightGray}
            value={phoneNo}
            onChangeText={onChangePhoneNo}
            error={errors.phoneNo}
          />
          <CustomInput
            placeholder={strings.dob}
            placeholderTextColor={colors.lightGray}
            value={moment(date).format('YYYY-MM-DD')}
            // editable={false}
            onPressIn={() => setOpen(true)}
            error={errors.dob}
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
            placeholder={strings.email}
            placeholderTextColor={colors.lightGray}
            value={email}
            onChangeText={onChangeEmail}
            error={errors.email}
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
          />
          <CustomInput
            placeholderTextColor={colors.lightGray}
            placeholder={strings.confirmPassword}
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry={isConfirmPasswordSecure}
            imageStyle={styles.eye}
            rightImage={isConfirmPasswordSecure ? images.hidePass : images.eye}
            onPressImage={() => setConfirmPasswordSecure(!isPasswordSecure)}
          />

          <CustomButton label={strings.signUp} onPress={handleSignUp} />
          <Text style={styles.accountText}>
            {strings.haveAccount}
            <Text style={styles.color} onPress={signIn}>
              {' '}
              {strings.signHere}
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
            textStyle={styles.colorBlue}
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

  accountText: {
    fontSize: rf(16),
    textAlign: 'center',
    marginTop: rh(12),
    marginBottom: rh(30),
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
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.blueGray,
    marginVertical: 10,
    borderRadius: rw(100),
  },
  preview: {
    height: rw(120),
    width: rw(120),
    borderRadius: rw(100),
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

  imageStyle: { width: rw(20), height: rh(20) },
  customButtonStyle: {
    backgroundColor: colors.yellow_white,
    marginBottom: rh(30),
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
  },
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
