import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { rf, rh, rw } from '../../utils/responsive';
import { useTheme } from '../../context/Theme';
import { colors } from '../../utils/color';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import { images } from '../../utils/images';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackRootScreen } from '../../types/navigationtype';
import { useNavigation } from '@react-navigation/native';
import { RenderPost, Theme, User } from '../../types/screens';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../navigations/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [posts, setPosts] = useState<RenderPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<RenderPost>();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const ITEM_SIZE = screenWidth / 3.05;
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();

  const { currentTheme } = useTheme();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getProfileData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getProfileData();
  }, []);
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const getProfileData = async () => {
    const uid = auth().currentUser?.uid;

    const userDoc = await firestore().collection('users').doc(uid).get();

    setUserData(userDoc.data() as User);

    const postSnapshot = await firestore()
      .collection('posts')
      .where('userId', '==', uid)
      .get();

    const userPosts: RenderPost[] = postSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPosts(userPosts);
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const editProfile = (userData: User) => {
    navigation.navigate('EditProfile', { userData, isEdit: true });
  };
  const styles = inlineStyle(currentTheme, ITEM_SIZE);
  const renderPost = ({ item }: { item: RenderPost }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedPost(item);
          setModalVisible(true);
        }}
      >
        <Image
          source={{
            uri: item.imageUrl?.[0],
          }}
          style={styles.postImage}
        />
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={styles.safeAreaViewStyle}
    >
      <CustomHeader route={t('profile')} />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.imageView}>
            <Image
              source={{
                uri: userData?.profileImage,
              }}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.count}>{posts.length}</Text>
              <Text style={styles.text}>{t('posts')}</Text>
            </View>
            <TouchableOpacity
              style={styles.statBox}
              onPress={() =>
                navigation.navigate('Followers', {
                  followers: userData?.followers || [],
                })
              }
            >
              <Text style={styles.count}>
                {userData?.followers?.length || 0}
              </Text>
              <Text style={styles.text}>{t('followers')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statBox}
              onPress={() =>
                navigation.navigate('Following', {
                  following: userData?.following || [],
                })
              }
            >
              <Text style={styles.count}>
                {userData?.following?.length || 0}
              </Text>
              <Text style={styles.text}>{t('following')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.name}>
          {userData?.firstName} {userData?.lastName}
        </Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            if (userData) {
              editProfile(userData);
            }
          }}
        >
          <Text style={styles.editText}>{t('edit_profile')}</Text>
        </TouchableOpacity>

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id!}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          scrollEnabled={false}
        />
      </ScrollView>
      <Modal
        statusBarTranslucent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
        backdropColor={'rgba(0, 0, 0, 0.5)'}
      >
        <View style={styles.modalView}>
          <View style={styles.modalInnerView}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Image source={images.close} style={styles.closeImage} />
            </TouchableOpacity>
            <View
              style={{
                marginBottom:
                  (selectedPost?.imageUrl?.length || 0) > 1 ? rh(0) : rh(20),
              }}
            >
              <Carousel
                ref={ref}
                loop={false}
                width={screenWidth * 0.85}
                height={screenWidth * 0.85}
                data={selectedPost?.imageUrl || []}
                onProgressChange={progress}
                renderItem={({ item }: { item: string }) => {
                  const imageUrl = item;

                  return (
                    <Image
                      source={{ uri: imageUrl }}
                      style={{
                        width: screenWidth * 0.85,
                        height: screenWidth * 0.85,
                      }}
                      resizeMode="contain"
                    />
                  );
                }}
              />

              {(selectedPost?.imageUrl?.length || 0) > 1 && (
                <Pagination.Basic
                  progress={progress}
                  data={selectedPost?.imageUrl || []}
                  dotStyle={styles.dot}
                  activeDotStyle={styles.activeDot}
                  containerStyle={styles.paginationContainer}
                  horizontal
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
const inlineStyle = (currentTheme: Theme, ITEM_SIZE: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    safeAreaViewStyle: { backgroundColor: currentTheme.background, flex: 1 },

    listContainer: {
      paddingVertical: rh(10),
    },
    columnWrapper: {
      justifyContent: 'flex-start',
    },
    header: {
      flexDirection: 'row',
      marginHorizontal: rw(20),
      alignItems: 'center',
      marginTop: rh(10),
    },
    imageView: {
      width: rw(100),
      height: rw(100),
      borderRadius: 60,
      borderWidth: 2,
      borderColor: colors.offGray,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileImage: {
      width: rw(90),
      height: rw(90),
      borderRadius: 45,
    },

    statsContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },

    statBox: {
      alignItems: 'center',
    },

    count: {
      fontSize: rf(18),
      fontWeight: '700',
      color: currentTheme.text,
    },
    text: { color: currentTheme.text },

    name: {
      fontSize: rf(18),
      fontWeight: '700',
      marginHorizontal: rw(20),
      marginVertical: rh(10),
      color: currentTheme.text,
    },

    editBtn: {
      marginHorizontal: rw(20),
      borderWidth: 1,
      borderColor: colors.offGray,
      borderRadius: 8,
      paddingVertical: rh(10),
      alignItems: 'center',
      marginVertical: rh(10),
    },

    editText: {
      fontWeight: '600',
      color: currentTheme.text,
    },

    postImage: {
      margin: rw(1),
      width: ITEM_SIZE,
      height: ITEM_SIZE,
    },
    dot: {
      backgroundColor: colors.lightGray,
      borderRadius: 50,
      width: rw(8),
      height: rw(8),
    },
    activeDot: {
      backgroundColor: colors.blue,
    },
    paginationContainer: {
      marginVertical: rh(10),
      gap: rw(8),
    },

    modalView: {
      borderRadius: 20,
      padding: rw(35),
      alignItems: 'center',

      flex: 1,
      justifyContent: 'center',
    },
    modalInnerView: { backgroundColor: currentTheme.background },
    closeImage: {
      width: rw(20),
      height: rw(20),
      alignSelf: 'flex-end',
      marginTop: rh(10),
      marginHorizontal: rw(20),
      tintColor: currentTheme.text,
    },
  });
