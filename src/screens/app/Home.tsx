import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  I18nManager,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { images } from '../../utils/images';
import { rf, rh, rw } from '../../utils/responsive';

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';

import { colors } from '../../utils/color';
import { useTheme } from '../../context/Theme';
import { Comments, Post, Theme } from '../../types/screens';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../navigations/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../../components/common/CustomPost';

const Home = () => {
  const { t } = useTranslation();
  const { currentTheme, themeMode } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comments[]>([]);
  const [selectedPost, setSelectedPost] = useState<null | Post>(null);
  const [commentText, setCommentText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '80%'], []);
  const [loading, setLoading] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getPosts();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    setLoading(false);
    getPosts();
  }, []);

  const getPosts = async () => {
    const currentUid = auth().currentUser?.uid;

    const currentUserDoc = await firestore()
      .collection('users')
      .doc(currentUid)
      .get();
    const currentUserData = currentUserDoc.data();

    const followingIds = currentUserData?.following || [];
    const userIds = [...followingIds, currentUid];
    if (userIds.length === 0) {
      setPosts([]);
      return;
    }

    const snapshot = await firestore()
      .collection('posts')
      .where('userId', 'in', userIds.slice(0, 10))
      .get();

    const data = await Promise.all(
      snapshot.docs.map(async doc => {
        const post = doc.data();

        const userDoc = await firestore()
          .collection('users')
          .doc(post.userId)
          .get();

        let lastLikedUser = null;

        if (post.likes?.length > 0) {
          const lastLikedUserId = post.likes[post.likes.length - 1];

          const likeUserDoc = await firestore()
            .collection('users')
            .doc(lastLikedUserId)
            .get();

          lastLikedUser = likeUserDoc.data();
        }

        return {
          id: doc.id,
          ...post,
          user: userDoc.data(),
          lastLikedUser,
        };
      }),
    );

    setPosts(data as Post[]);
  };
  const toggleLike = async (item: Post) => {
    const uid = auth().currentUser?.uid as string;
    if (item.likes?.includes(uid)) {
      await firestore()
        .collection('posts')
        .doc(item.id)
        .update({
          likes: firestore.FieldValue.arrayRemove(uid),
        });
    } else {
      await firestore()
        .collection('posts')
        .doc(item.id)
        .update({
          likes: firestore.FieldValue.arrayUnion(uid),
        });
    }
    setLoading(false);
    getPosts();
  };

  const loadComments = async (postId: string) => {
    const snapshot = await firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    const data = await Promise.all(
      snapshot.docs.map(async doc => {
        const post = doc.data();
        const userDoc = await firestore()
          .collection('users')
          .doc(post.userId)
          .get();
        return { id: doc.id, ...post, user: userDoc.data() };
      }),
    );

    setComments(data as Comments[]);
  };

  const openComments = async (post: Post) => {
    setSelectedPost(post);
    await loadComments(post.id);
    bottomSheetRef.current?.expand();
  };

  const addComment = async () => {
    if (!commentText.trim()) {
      return;
    }

    const uid = auth().currentUser?.uid;
    const userDoc = await firestore().collection('users').doc(uid).get();
    const user = userDoc.data();

    await firestore()
      .collection('posts')
      .doc(selectedPost?.id)
      .collection('comments')
      .add({
        userId: uid,
        userName: `${user?.firstName} ${user?.lastName}`,
        comment: commentText,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

    setCommentText('');
    loadComments(selectedPost?.id || '');
  };

  const productDetailStrings = {
    lessText: 'Show less',
    seeText: 'See more...',
  };

  const isRTL = I18nManager.isRTL;
  const styles = inlineStyle(currentTheme, isRTL);
  const renderPost = ({ item }: { item: Post }) => {
    const currentUser = auth().currentUser?.uid as string;

    return (
      <PostCard
        item={item}
        currentUser={currentUser}
        themeMode={themeMode}
        t={t}
        productDetailStrings={productDetailStrings}
        toggleLike={() => toggleLike(item)}
        openComments={() => openComments(item)}
      />
    );
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const ListEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size={'large'} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('noPost')}</Text>
      </View>
    );
  };
  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={styles.safeAreaViewStyle}
    >
      <CustomHeader route={t('instagram')} />
      <View style={styles.flex}>
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={ListEmptyComponent}
        />
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose={true}
          snapPoints={snapPoints}
          keyboardBehavior="extend"
          android_keyboardInputMode="adjustResize"
          backgroundStyle={styles.bottomSheetStyle}
          // eslint-disable-next-line react/no-unstable-nested-components
          backdropComponent={props => (
            <BottomSheetBackdrop
              {...props}
              pressBehavior={'close'}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
            />
          )}
          handleIndicatorStyle={{ backgroundColor: currentTheme.text }}
        >
          <View style={styles.flex}>
            <Text style={styles.commentTitle}>{t('comments')}</Text>

            <BottomSheetFlatList
              data={comments}
              keyExtractor={item => item?.id}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pb20}
              renderItem={({ item }: { item: Comments }) => {
                return (
                  <View style={styles.leftContainer}>
                    <Image
                      source={{ uri: item.user?.profileImage }}
                      style={styles.profile}
                      resizeMode="contain"
                    />
                    <View style={styles.flex}>
                      <Text style={styles.name}>
                        {item.user?.firstName} {item.user?.lastName}
                      </Text>
                      <Text style={styles.description}>{item.comment}</Text>
                    </View>
                  </View>
                );
              }}
            />

            <View style={styles.inputView}>
              <BottomSheetTextInput
                placeholder={t('write_comment')}
                value={commentText}
                onChangeText={setCommentText}
                placeholderTextColor={currentTheme.text}
                style={styles.input}
              />
              <TouchableOpacity style={styles.buttonView} onPress={addComment}>
                <Image
                  source={images.send}
                  style={[
                    styles.sendImage,
                    {
                      tintColor:
                        themeMode === 'dark' ? colors.white : colors.black,
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
};

export default Home;
const inlineStyle = (currentTheme: Theme, isRTL: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: rw(12),
    },
    inputContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    pb20: { paddingBottom: rh(20) },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: rw(20),
      marginVertical: rh(10),
      flex: 1,
    },
    dot: {
      backgroundColor: colors.lightGray,
      borderRadius: 50,
      width: rw(8),
      height: rw(8),
    },
    profile: {
      alignSelf: 'flex-start',
      width: rw(45),
      height: rw(45),
      borderRadius: 22,
      marginRight: rw(10),
    },
    flex: { flex: 1, backgroundColor: currentTheme.background },
    toggleText: {
      color: '#007AFF',
      fontWeight: 'bold',
    },
    name: {
      fontWeight: '700',
      fontSize: rf(16),
      color: currentTheme.text,
    },

    paginationContainer: {
      gap: rw(8),
    },

    activeDot: {
      backgroundColor: colors.blue,
    },

    description: {
      marginTop: rh(5),
      color: currentTheme.text,
    },
    descriptionStyle: {
      marginHorizontal: rw(20),
      marginTop: rh(10),
    },

    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: rw(20),
      justifyContent: 'space-between',
      marginTop: rh(15),
    },

    commentTitle: {
      fontSize: rf(20),
      fontWeight: '700',
      marginHorizontal: rw(20),
      marginBottom: rh(20),
      color: currentTheme.text,
    },

    heartImage: { width: rw(30), height: rh(30) },
    heartView: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: rw(10),
    },
    commentImage: {
      width: rw(27),
      height: rw(27),
    },
    mr60: { marginRight: rw(60) },
    likeText: {
      marginHorizontal: rw(20),
      marginTop: rh(10),
      fontWeight: '600',
      color: currentTheme.text,
    },
    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: rh(250),
    },

    emptyText: {
      fontSize: rf(16),
      color: currentTheme.text,
    },
    bottomSheetStyle: { backgroundColor: currentTheme.background },
    input: {
      flex: 1,
      textAlign: isRTL ? 'right' : 'left',
      color: currentTheme.text,
    },
    safeAreaViewStyle: { backgroundColor: currentTheme.background, flex: 1 },
    inputView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomColor: colors.blueGray,
      borderBottomWidth: 2,
      marginHorizontal: rw(20),

      backgroundColor: currentTheme.background,
    },
    buttonView: { alignSelf: 'center', paddingLeft: 10 },
    sendImage: { width: rw(25), height: rw(25) },
  });
