import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { rf, rh, rw } from '../../utils/responsive';
import { colors } from '../../utils/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/Theme';
import { useRoute } from '@react-navigation/native';
import { RenderPost, Theme, User } from '../../types/screens';
import { images } from '../../utils/images';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackRootScreen } from '../../types/navigationtype';

const UserProfile = () => {
  // Extract userId from the deep link route parameters
  const route = useRoute();
  const params = route.params as { userId: string } | undefined;
  const userId = params?.userId;
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  console.log('userId :>> ', userId);
  console.log('userData :>> ', userData);
  const { currentTheme, themeMode } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const ITEM_SIZE = screenWidth / 3.05;
  const styles = inlineStyle(currentTheme, ITEM_SIZE);
  const { t } = useTranslation();
  const [posts, setPosts] = useState<RenderPost[]>([]);
  const navigation = useNavigation<StackNavigationProp<StackRootScreen>>();

  //   useEffect(() => {
  //     const unsubscribe = firestore()
  //       .collection('users')
  //       .doc(userId)
  //       .onSnapshot(onSnapshot => {
  //         if (onSnapshot.exists) {
  //           setUserData(onSnapshot.data());
  //         }
  //         setLoading(false);
  //       });

  //     return () => unsubscribe();
  //   }, [userId]);
  useEffect(() => {
    getProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // const getProfileData = async () => {
  //   // const uid = auth().currentUser?.uid;

  //   const userDoc = await firestore()
  //     .collection('users')
  //     .doc(userId)
  //     .onSnapshot(onSnapshot => {
  //       if (onSnapshot.exists) {
  //         //   const postSnapshot = await firestore()
  //         //     .collection('posts')
  //         //     .where('userId', '==', userId)
  //         //     .get();

  //         //   const userPosts: RenderPost[] = postSnapshot.docs.map(doc => ({
  //         //     id: doc.id,
  //         //     ...doc.data(),
  //         //   }));
  //         //   setLoading(false);
  //         //   setPosts(userPosts);
  //         setUserData(onSnapshot.data());
  //       }
  //       setLoading(false);
  //     });

  //   // setUserData(userDoc.data() as any);
  // };
  const getProfileData = async () => {
    // const uid = auth().currentUser?.uid;
    setLoading(false);
    const userDoc = await firestore().collection('users').doc(userId).get();

    setUserData(userDoc.data() as User);

    const postSnapshot = await firestore()
      .collection('posts')
      .where('userId', '==', userId)
      .get();

    const userPosts: RenderPost[] = postSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPosts(userPosts);
  };

  if (loading) return <ActivityIndicator size="large" />;
  const renderPost = ({ item }: { item: RenderPost }) => {
    return (
      <TouchableOpacity
      // onPress={() => {
      //   setSelectedPost(item);
      //   setModalVisible(true);
      // }}
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
      {/* <CustomHeader route={t('profile')} /> */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.left}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'DrawerNavigation' }],
            })
          }
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
        <Text style={styles.instagramText}>{t('profile')}</Text>
      </View>
      <ScrollView
        style={styles.container}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        // }
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
              <Text style={styles.count}>{posts?.length}</Text>
              <Text style={styles.text}>{t('posts')}</Text>
            </View>
            <TouchableOpacity
              style={styles.statBox}
              //   onPress={() =>
              //     navigation.navigate('Followers', {
              //       followers: userData?.followers || [],
              //     })
              //   }
            >
              <Text style={styles.count}>
                {userData?.followers?.length || 0}
              </Text>
              <Text style={styles.text}>{t('followers')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statBox}
              //   onPress={() =>
              //     navigation.navigate('Following', {
              //       following: userData?.following || [],
              //     })
              //   }
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

        {/* <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            // if (userData) {
            //   editProfile(userData);
            // }
          }}
        >
          <Text style={styles.editText}>{t('edit_profile')}</Text>
        </TouchableOpacity> */}

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
      {/* <Modal
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
      </Modal> */}
    </SafeAreaView>
  );
};
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
      textAlign: 'center',
      color: currentTheme.text,
      // fontFamily: route === 'Instagram' ? 'GrandHotel-Regular' : undefined,
      fontSize: rf(22),
    },
    icon: {
      width: rw(22),
      height: rw(22),
      tintColor: currentTheme.text,
    },
    // safeAreaViewStyle: { backgroundColor: currentTheme.background },
  });
export default UserProfile;
