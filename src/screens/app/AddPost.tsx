import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  KeyboardAvoidingView,
} from 'react-native';
import ImagePicker, {
  Image as PickerImage,
} from 'react-native-image-crop-picker';
import Carousel from 'react-native-reanimated-carousel';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { rf, rh, rw } from '../../utils/responsive';
import { colors } from '../../utils/color';
import { images, RANDOM_IMAGES } from '../../utils/images';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { useTheme } from '../../context/Theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../navigations/CustomHeader';
import { Theme } from '../../types/screens';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Error {
  title?: string;
  description?: string;
  selectedImages?: string;
}

const AddPost = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<PickerImage[]>([]);
  const [errors, setErrors] = useState<Error>({});
  const { currentTheme, themeMode } = useTheme();
  const { t } = useTranslation();
  const getRandomImageUrl = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_IMAGES.length);
    return RANDOM_IMAGES[randomIndex];
  };

  const handleSuccess = () => {
    Toast.show({
      type: 'success',
      text1: t('create_Post'),
    });
  };

  const validate = () => {
    const newErrors: Error = {};

    if (!title.trim()) newErrors.title = t('title_validation');
    if (!description.trim())
      newErrors.description = t('description_validation');
    if (selectedImages.length === 0) {
      newErrors.selectedImages = t('image_validation');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPost = async () => {
    if (!validate()) return;
    try {
      const randomImageUrls = selectedImages.map(() => getRandomImageUrl());

      await firestore().collection('posts').add({
        userId: auth().currentUser?.uid,
        title,
        description,
        imageUrl: randomImageUrls,
        likes: [],
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      handleSuccess();

      setTitle('');
      setDescription('');
      setSelectedImages([]);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };
  const onChangeTitle = (text: string) => {
    setTitle(text);
    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
  };
  const onChangeDescription = (text: string) => {
    setDescription(text);
    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
  };

  const pickImages = async () => {
    try {
      const image = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
      });

      setSelectedImages(image);
      if (errors.selectedImages)
        setErrors(prev => ({ ...prev, selectedImages: '' }));
    } catch (error) {
      console.log(error);
    }
  };

  const removeImage = () => {
    if (selectedImages) {
      setSelectedImages([]);
    }
  };

  const styles = inlineStyle(currentTheme);
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={styles.safeAreaViewStyle}
    >
      <CustomHeader route={t('add_post')} />
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {selectedImages.length > 0 ? (
            <>
              <View style={styles.carouselView}>
                <Carousel
                  loop={false}
                  width={width - 20}
                  height={width - 120}
                  data={selectedImages}
                  renderItem={({ item }) => (
                    <>
                      <Image source={{ uri: item.path }} style={styles.image} />
                    </>
                  )}
                />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={removeImage}
                >
                  <Image
                    source={images.close}
                    style={{
                      width: rw(20),
                      height: rw(20),
                    }}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.profileView}>
              <TouchableOpacity
                onPress={pickImages}
                style={styles.imagePickerField}
              >
                <Image
                  source={
                    themeMode === 'light' ? images.blackAdd : images.whiteAdd
                  }
                  resizeMode="contain"
                  style={styles.addImage}
                />
              </TouchableOpacity>
              {errors.selectedImages && (
                <Text style={styles.errorText}>{errors.selectedImages}</Text>
              )}
            </View>
          )}

          <CustomInput
            placeholder={t('title')}
            value={title}
            onChangeText={onChangeTitle}
            variant="primary"
            style={styles.mt}
            error={errors.title}
            placeholderTextColor={currentTheme.text}
          />
          <CustomInput
            placeholder={t('description')}
            value={description}
            onChangeText={onChangeDescription}
            multiline={true}
            numberOfLines={4}
            variant="primary"
            style={styles.input}
            error={errors.description}
            placeholderTextColor={currentTheme.text}
            inputStyle={styles.descriptionInput}
          />

          <CustomButton label={t('create_post')} onPress={createPost} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddPost;

const inlineStyle = (currentTheme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    safeAreaViewStyle: { backgroundColor: currentTheme.background, flex: 1 },
    carouselView: {
      marginTop: rh(15),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      // marginBottom: rh(20),
    },
    addImage: { width: rw(30), height: rh(30) },
    mt: {
      marginTop: rh(5),
      color: currentTheme.text,
      backgroundColor: currentTheme.background,
    },
    profileView: {
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: rh(10),
    },
    errorText: {
      fontSize: rf(12),
      color: colors.red,
      marginTop: rh(5),
    },
    imagePickerField: {
      height: rw(120),
      width: rw(120),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      marginVertical: rh(10),
      borderRadius: rw(20),
      backgroundColor: currentTheme.background,
      borderColor: currentTheme.text,
    },

    image: {
      width: rw(400),
      height: rh(300),
      borderRadius: rw(15),

      alignSelf: 'center',
    },
    input: {
      color: currentTheme.text,
      backgroundColor: currentTheme.background,
    },
    descriptionInput: {
      minHeight: rh(100),
      textAlignVertical: 'top',
    },
    removeImage: {
      position: 'absolute',
      top: rh(15),
      right: rw(15),
    },
  });
