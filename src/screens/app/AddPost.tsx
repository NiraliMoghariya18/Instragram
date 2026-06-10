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
} from 'react-native';
import ImagePicker, {
  Image as PickerImage,
} from 'react-native-image-crop-picker';
import Carousel from 'react-native-reanimated-carousel';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { rf, rh, rw } from '../../utils/responsive';
import { colors } from '../../utils/color';
import { images } from '../../utils/images';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { strings } from '../../utils/strings';
import { useTheme } from '../../context/Theme';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const RANDOM_IMAGES = [
  'https://fastly.picsum.photos/id/1011/500/500.jpg?hmac=YN3oCpwpniYpKEclMAlUd1vWTmlpeh6BUdpODrFAINc',
  'https://fastly.picsum.photos/id/1015/500/500.jpg?hmac=LNni84jXVOXdvxYPr-DoeAxRSQnnd-9Sf_-CunUKGYI',
  'https://fastly.picsum.photos/id/1025/500/500.jpg?hmac=-8oa3YhiI2vz-AJSkoxWl_7uP0QpVYMmQabi48iqMHM',
  'https://fastly.picsum.photos/id/1035/500/500.jpg?hmac=VgIFigWEM4x04jktFvmZVXDqJVVq6XHYyTtPX9C8PtQ',
  'https://fastly.picsum.photos/id/1040/500/500.jpg?hmac=bmdEjFeT-uNd51SRuaCY9lKhha5_o8mKmJ5gFTkXBNc',
  'https://fastly.picsum.photos/id/1050/500/500.jpg?hmac=RTjRfuSRUndu2kdCIsGfJq27Vx6u280W8xaA7R4nFGk',
  'https://fastly.picsum.photos/id/1060/500/500.jpg?hmac=1_Zfj2QnxUoauTpLLb7BO881mQrrsM9pgyEDTuOw-QM',
  'https://fastly.picsum.photos/id/1070/500/500.jpg?hmac=fFiEzBh4MVKg9RRd9A3Rdsbvza9QeuqcnNdsKHJzo-8',
  'https://fastly.picsum.photos/id/1080/500/500.jpg?hmac=yIT2RDfQXaNeihJn27EjmEjuQzADHzr-QtozN0qaz7Y',
];

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

  const getRandomImageUrl = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_IMAGES.length);

    return RANDOM_IMAGES[randomIndex];
  };

  const handleSuccess = () => {
    Toast.show({
      type: 'success',
      text1: `✅ Created the post successFully `,
    });
  };
  const validate = () => {
    const newErrors: Error = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (selectedImages.length === 0) {
      newErrors.selectedImages = 'Image is required';
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
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {selectedImages.length > 0 ? (
        <View style={styles.carouselView}>
          <Carousel
            loop={false}
            width={width - 30}
            height={300}
            data={selectedImages}
            renderItem={({ item }) => (
              <Image source={{ uri: item.path }} style={styles.image} />
            )}
          />
        </View>
      ) : (
        <View style={styles.profileView}>
          <TouchableOpacity
            onPress={pickImages}
            style={[
              styles.imagePickerField,
              {
                backgroundColor: currentTheme.background,
                borderColor: currentTheme.text,
              },
            ]}
          >
            <Image
              source={themeMode === 'light' ? images.blackAdd : images.whiteAdd}
              resizeMode="contain"
              style={[styles.addImage]}
            />
          </TouchableOpacity>
          {errors.selectedImages && (
            <Text style={styles.errorText}>{errors.selectedImages}</Text>
          )}
        </View>
      )}

      <CustomInput
        placeholder="Title"
        value={title}
        onChangeText={onChangeTitle}
        variant="primary"
        style={[
          styles.mt,
          {
            backgroundColor:
              themeMode === 'dark' ? currentTheme.background : undefined,
            color: currentTheme.text,
          },
        ]}
        error={errors.title}
        placeholderTextColor={currentTheme.text}
      />
      <CustomInput
        placeholder="Description"
        value={description}
        onChangeText={onChangeDescription}
        multiline={true}
        numberOfLines={4}
        variant="primary"
        style={[
          styles.input,
          {
            backgroundColor:
              themeMode === 'dark' ? currentTheme.background : undefined,
            color: currentTheme.text,
          },
        ]}
        error={errors.description}
        placeholderTextColor={currentTheme.text}
      />

      <CustomButton label={strings.create_post} onPress={createPost} />
    </ScrollView>
  );
};

export default AddPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselView: {
    marginTop: rh(15),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: rh(20),
  },
  addImage: { width: rw(30), height: rh(30) },
  mt: { marginTop: rh(5) },
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
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.black,
    marginVertical: rh(10),
    borderRadius: rw(20),
  },

  image: {
    width: rw(400),
    height: rh(300),
    borderRadius: rw(15),
  },
  input: {
    paddingVertical: rh(14),
    paddingHorizontal: rw(15),
  },
});
