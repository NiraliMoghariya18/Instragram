import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import CustomInput from '../../components/common/CustomInput';
import { useRoute } from '@react-navigation/native';
import { strings } from '../../utils/strings';
import { colors } from '../../utils/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import RadioButton from '../../components/common/CustomRadioButton';
import { rf, rh, rw } from '../../utils/responsive';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { images } from '../../utils/images';
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackRootScreen } from '../../types/navigationtype';
import auth from '@react-native-firebase/auth';
import CustomButton from '../../components/common/CustomButton';
import { useTheme } from '../../context/Theme';
import { User } from '../../types/screens';

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
  const [lastName, setLastName] = useState(editItem?.lastName || '');
  const radioButtons = ['Male', 'Female', 'Other'];
  const [gender, setGender] = useState<string | undefined>(
    editItem?.gender || 'Male',
  );

  const [open, setOpen] = useState(false);
  const [phoneNo, setPhoneNo] = useState<string>(editItem?.phoneNo || '');
  const [email, setEmail] = useState(editItem?.email || '');
  // const [date, setDate] = useState('');
  // const [dob, setDob] = useState(
  //   new Date(moment(editItem?.dob, 'l').toDate()) || new Date(),
  // );
  const [dob, setDob] = useState('');
  const [date, setDate] = useState(
    new Date(moment(editItem?.dob, 'l').toDate()) || new Date(),
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    (Array.isArray(editItem?.profileImage)
      ? editItem.profileImage[0]
      : editItem?.profileImage) || null,
  );

  const [errors, setErrors] = useState<Error>({});
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();
  const { currentTheme, themeMode } = useTheme();
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

      navigation.navigate('DrawerNavigation');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Sign Up Error', error.message);
      }
    }
  };
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <TouchableOpacity
          style={styles.left}
          onPress={() => navigation.goBack()}
        >
          <>
            <Image
              source={
                themeMode === 'light' ? images.blackBack : images.whiteBack
              }
              style={[styles.icon, { tintColor: currentTheme.text }]}
              resizeMode="contain"
            />
          </>
        </TouchableOpacity>
        <Text style={[styles.instagramText, { color: currentTheme.text }]}>
          {strings.edit}
        </Text>
      </View>
      <View style={styles.profileView}>
        <TouchableOpacity onPress={selectImage} style={styles.imagePickerField}>
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
        style={[
          {
            backgroundColor:
              themeMode === 'dark' ? currentTheme.background : undefined,
            color: currentTheme.text,
          },
        ]}
      />
      <CustomInput
        placeholder={strings.lastName}
        value={lastName}
        onChangeText={onChangeLastName}
        placeholderTextColor={colors.lightGray}
        error={errors.lastName}
        style={[
          {
            backgroundColor:
              themeMode === 'dark' ? currentTheme.background : undefined,
            color: currentTheme.text,
          },
        ]}
      />
      <View style={styles.radioView}>
        <Text style={[styles.radioText, { color: currentTheme.text }]}>
          {strings.gender}
        </Text>

        <View style={styles.radioButtonInnerView}>
          {radioButtons.map(option => (
            <RadioButton
              key={option}
              label={option}
              selected={gender === option}
              disabled={true}
              onSelect={() => onSelectGender(option)}
              style={{ color: currentTheme.text }}
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
        style={[
          {
            backgroundColor:
              themeMode === 'dark' ? currentTheme.background : undefined,
            color: currentTheme.text,
          },
        ]}
      />

      <CustomInput
        placeholder={strings.email}
        placeholderTextColor={colors.lightGray}
        value={email}
        onChangeText={onChangeEmail}
        editable={false}
        error={errors.email}
        style={[
          {
            backgroundColor:
              themeMode === 'dark' ? currentTheme.background : undefined,
            color: currentTheme.text,
          },
        ]}
      />

      <CustomInput
        placeholder={strings.dob}
        placeholderTextColor={colors.lightGray}
        value={moment(date).format('DD/MM/YYYY')}
        // editable={false}
        onPressIn={() => setOpen(true)}
        error={errors.dob}
        style={[
          {
            backgroundColor:
              themeMode === 'dark' ? currentTheme.background : undefined,
            color: currentTheme.text,
          },
        ]}
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
      <CustomButton label={strings.submit} onPress={handleUpdate} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  left: {
    position: 'absolute',
    left: rw(20),
  },
  instagramText: {
    fontSize: rf(25),
  },
  icon: {
    width: rw(20),
    height: rh(20),
  },
});

export default EditProfile;
