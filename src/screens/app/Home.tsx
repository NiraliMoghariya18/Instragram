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
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { images } from '../../utils/images';
import { rf, rh, rw } from '../../utils/responsive';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import { useSharedValue } from 'react-native-reanimated';
import CustomInput from '../../components/common/CustomInput';
import { colors } from '../../utils/color';
import { strings } from '../../utils/strings';
import { useTheme } from '../../context/Theme';
import { Comments, Post } from '../../types/screens';
// const { width } = Dimensions.get('window');

const Home = () => {
  const { currentTheme, themeMode } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comments[]>([]);
  const [selectedPost, setSelectedPost] = useState<null | Post>(null);
  const [commentText, setCommentText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '85%'], []);
  const { width: screenWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [like, setLike] = useState(false);

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

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const renderPost = ({ item }: { item: Post }) => {
    const data = [...new Array(...item.imageUrl).values()];
    const currentUser = auth().currentUser?.uid as string;
    return (
      <View style={[styles.card]}>
        <View style={styles.leftContainer}>
          <Image
            source={{
              uri: item.user?.profileImage,
            }}
            style={styles.profile}
          />
          <View style={[{ flex: 1 }]}>
            <Text style={[styles.name, { color: currentTheme.text }]}>
              {item.user?.firstName} {item.user?.lastName}
            </Text>
            <Text style={[styles.description, { color: currentTheme.text }]}>
              {item.title}
            </Text>
          </View>
        </View>
        <Carousel
          ref={ref}
          loop={false}
          width={screenWidth}
          height={screenWidth * 0.6}
          autoPlay={false}
          data={data}
          onProgressChange={progress}
          scrollAnimationDuration={1000}
          renderItem={({ item }) => {
            return (
              <Image
                source={{ uri: item as string }}
                style={[styles.imageCarousel, { width: screenWidth }]}
                resizeMode="cover"
              />
            );
          }}
        />

        <View style={styles.actions}>
          <View style={styles.heartView}>
            <TouchableOpacity
              onPress={() => {
                toggleLike(item);
                setLike(!like);
              }}
            >
              {item.likes?.includes(currentUser) ? (
                <Image
                  source={images.redHeart}
                  style={styles.heartImage}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={
                    themeMode === 'light' ? images.heart : images.whiteHeart
                  }
                  style={styles.heartImage}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openComments(item)}>
              <Image
                source={
                  themeMode === 'light' ? images.comments : images.whiteComments
                }
                style={styles.commentImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Pagination.Basic
            progress={progress}
            data={data}
            dotStyle={styles.dot}
            activeDotStyle={styles.activeDot}
            containerStyle={styles.paginationContainer}
            horizontal
            onPress={onPressPagination}
          />
          <View style={styles.mr60} />
        </View>
        {item.likes?.length > 0 && (
          <Text style={[styles.likeText, { color: currentTheme.text }]}>
            {strings.liked_by} {item.lastLikedUser?.firstName}{' '}
            {item.lastLikedUser?.lastName}
            {item.likes.length > 1
              ? ` and ${item.likes.length - 1} others`
              : ''}
          </Text>
        )}
        <Text
          style={[
            styles.description,
            styles.descriptionStyle,
            {
              color: currentTheme.text,
            },
          ]}
        >
          <Text style={styles.name}>
            {item.user?.firstName} {item.user?.lastName}{' '}
          </Text>
          {item.description}
        </Text>
      </View>
    );
  };

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
        <Text style={[styles.emptyText, { color: currentTheme.text }]}>
          {strings.noPost}
        </Text>
      </View>
    );
  };
  return (
    <GestureHandlerRootView
      style={[styles.flex, { backgroundColor: currentTheme.background }]}
    >
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
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <View style={[styles.flex, { marginVertical: rw(5) }]}>
          <Text style={styles.commentTitle}>{strings.comments}</Text>
          <BottomSheetFlatList
            data={comments}
            keyExtractor={item => item?.id}
            renderItem={({ item }: { item: Comments }) => {
              return (
                <>
                  <View style={styles.leftContainer}>
                    <Image
                      source={{
                        uri: item.user?.profileImage,
                      }}
                      style={styles.profile}
                    />

                    <View style={styles.flex}>
                      <Text style={styles.name}>
                        {item.user?.firstName} {item.user?.lastName}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.description}>{item.comment}</Text>
                      </View>
                    </View>
                  </View>
                </>
              );
            }}
            contentContainerStyle={styles.pb20}
            showsVerticalScrollIndicator={false}
          />

          <CustomInput
            placeholder="Write comment..."
            value={commentText}
            onChangeText={setCommentText}
            rightImage={images.send}
            onPressImage={addComment}
            style={{ backgroundColor: colors.white }}
          />
        </View>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};
export default Home;
const styles = StyleSheet.create({
  card: {
    borderRadius: rw(12),
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
  flex: { flex: 1 },

  name: {
    fontWeight: '700',
    fontSize: rf(16),
    // flex: 1,
  },

  paginationContainer: {
    gap: rw(8),
  },

  activeDot: {
    backgroundColor: colors.blue,
  },

  description: {
    marginTop: rh(5),
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
  },
  imageCarousel: { height: rh(250) },
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
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: rh(250),
  },

  emptyText: {
    color: colors.gray,
    fontSize: rf(16),
  },
});
