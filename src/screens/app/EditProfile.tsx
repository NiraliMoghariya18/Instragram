import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import CustomInput from '../../components/common/CustomInput';
import { useRoute } from '@react-navigation/native';
import { colors } from '../../utils/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import RadioButton from '../../components/common/CustomRadioButton';
import { rf, rh, rw } from '../../utils/responsive';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { defaultImages, images } from '../../utils/images';
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackRootScreen } from '../../types/navigationtype';
import auth from '@react-native-firebase/auth';
import CustomButton from '../../components/common/CustomButton';
import { useTheme } from '../../context/Theme';
import { Theme, User } from '../../types/screens';
import { useTranslation } from 'react-i18next';
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

const EditProfile = () => {
  const route = useRoute();
  const params = route.params as
    | { isEdit: boolean; userData: User }
    | undefined;
  const editItem = params?.userData;
  const [firstName, setFirstName] = useState(editItem?.firstName || '');
  const { t } = useTranslation();
  const [lastName, setLastName] = useState(editItem?.lastName || '');

  const [gender, setGender] = useState<string | undefined>(editItem?.gender);
  const [open, setOpen] = useState(false);
  const [phoneNo, setPhoneNo] = useState<string>(editItem?.phoneNo || '');
  const [email, setEmail] = useState(editItem?.email || '');

  const radioButtons = [
    { key: 'Female', value: t('female') },
    { key: 'Male', value: t('male') },
    { key: 'Other', value: t('other') },
  ];
  const [dob, setDob] = useState('');
  const [date, setDate] = useState(
    new Date(moment(editItem?.dob, 'l').toDate()) || new Date(),
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    (Array.isArray(editItem?.profileImage)
      ? editItem.profileImage[0]
      : editItem?.profileImage) || null,
  );

  const handleSuccess = () => {
    Toast.show({
      type: 'success',
      text1: t('edit_Profile'),
    });
  };

  const [errors, setErrors] = useState<Error>({});
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();
  const { currentTheme, themeMode } = useTheme();

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);

    return defaultImages[randomIndex];
  };

  const onChangeFirstName = (text: string) => {
    setFirstName(text);
    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
  };
  const onChangePhoneNo = (text: string) => {
    setPhoneNo(text);
    if (errors.phoneNo) setErrors(prev => ({ ...prev, phoneNo: '' }));
  };

  const onChangeEmail = (text: string) => {
    setEmail(text);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  const onChangeLastName = (text: string) => {
    setLastName(text);
    if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
  };
  const onSelectGender = (selectedGender: string) => {
    setGender(selectedGender);
    if (errors.gender) setErrors(prev => ({ ...prev, gender: '' }));
  };

  const onConfirmDob = (selectedDate: Date) => {
    const formattedDate = moment(selectedDate).format('l');

    setOpen(false);
    setDob(formattedDate);
    setDate(selectedDate);

    if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
  };

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(image => {
        setProfileImage(image?.path);
      })
      .catch(err => {
        console.log('User cancelled or error:', err);
      });
  };

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

  const handleUpdate = async () => {
    if (!validate()) return;
    const randomProfileImage = getRandomImage();

    try {
      let uid = auth().currentUser?.uid;

      await firestore().collection('users').doc(uid).update({
        profileImage: randomProfileImage,
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        gender,
        phoneNo,
        dob,
        email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      handleSuccess();
      navigation.navigate('DrawerNavigation');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Sign Up Error', error.message);
      }
    }
  };
  const styles = inlineStyle(currentTheme);
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.left}
          onPress={() => navigation.goBack()}
        >
          <>
            <Image
              source={
                themeMode === 'light' ? images.blackBack : images.whiteBack
              }
              style={styles.icon}
              resizeMode="contain"
            />
          </>
        </TouchableOpacity>
        <Text style={styles.instagramText}>{t('edit')}</Text>
      </View>
      <ScrollView>
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
          style={styles.input}
        />
        <CustomInput
          placeholder={t('lastName')}
          value={lastName}
          onChangeText={onChangeLastName}
          placeholderTextColor={colors.lightGray}
          error={errors.lastName}
          style={styles.input}
        />
        <View style={styles.radioView}>
          <Text style={styles.radioText}>{t('gender')}</Text>

          <View style={styles.radioButtonInnerView}>
            {radioButtons.map(option => (
              <RadioButton
                key={option.key}
                label={option.value}
                selected={gender === option.key}
                disabled={true}
                onSelect={() => onSelectGender(option.key)}
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
          style={styles.input}
        />

        <CustomInput
          placeholder={t('email')}
          placeholderTextColor={colors.lightGray}
          value={email}
          onChangeText={onChangeEmail}
          editable={false}
          error={errors.email}
          style={styles.input}
        />

        <CustomInput
          placeholder={t('dob')}
          placeholderTextColor={colors.lightGray}
          value={moment(date).format('DD/MM/YYYY')}
          // editable={false}
          onPressIn={() => setOpen(true)}
          error={errors.dob}
          style={styles.input}
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
        <CustomButton label={t('submit')} onPress={handleUpdate} />
      </ScrollView>
    </SafeAreaView>
  );
};

const inlineStyle = (currentTheme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
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
    profileView: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: rh(10),
      marginTop: rh(15),
    },
    imagePickerField: {
      height: rw(120),
      width: rw(120),
      backgroundColor: colors.offWhite,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.blueGray,
      marginVertical: rh(10),
      borderRadius: rw(100),
    },
    preview: {
      height: rw(120),
      width: rw(120),
      borderRadius: rw(100),
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.background,
    },
    left: {
      position: 'absolute',
      left: rw(20),
    },
    instagramText: {
      fontSize: rf(25),
      color: currentTheme.text,
    },
    icon: {
      width: rw(20),
      height: rh(20),
      tintColor: currentTheme.text,
    },
    input: {
      color: currentTheme.text,
      backgroundColor: currentTheme.background,
    },
  });

export default EditProfile;
