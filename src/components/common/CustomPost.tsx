import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  TextLayoutEvent,
} from 'react-native';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import { rf, rh, rw } from '../../utils/responsive';
import { Post, Theme } from '../../types/screens';
import { useTheme } from '../../context/Theme';
import { colors } from '../../utils/color';
import { images } from '../../utils/images';

export interface User {
  profileImage?: string;
  firstName?: string;
  lastName?: string;
}

interface PostCardProps {
  item: Post;
  currentUser: string;
  themeMode?: 'light' | 'dark';
  t: (key: string) => string;
  productDetailStrings?: { lessText: string; seeText: string };
  toggleLike?: () => void;
  openComments?: () => void;
}

const screenWidth = Dimensions.get('window').width;

export const PostCard: React.FC<PostCardProps> = ({
  item,
  currentUser,
  themeMode,
  t,
  productDetailStrings,
  toggleLike,
  openComments,
}) => {
  const [textShown, setTextShown] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [numLines, setNumLines] = useState<number | undefined>(3);

  const carouselRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const data = [...new Array(...item.imageUrl).values()];
  const { currentTheme } = useTheme();

  const onTextLayout = useCallback(
    (e: TextLayoutEvent) => {
      if (e.nativeEvent.lines.length > 3 && !textShown) {
        setShowMoreButton(true);
        setNumLines(2);
      }
    },
    [textShown],
  );
  const styles = inlineStyle(currentTheme);
  const toggleTextExpansion = () => {
    if (textShown) {
      setNumLines(3);
      setTextShown(false);
    } else {
      setNumLines(undefined);
      setTextShown(true);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftContainer}>
        <Image
          source={{ uri: item?.user?.profileImage }}
          style={styles.profile}
          resizeMode="contain"
        />
        <View style={styles.flex}>
          <Text style={styles.name}>
            {item?.user?.firstName} {item?.user?.lastName}
          </Text>
          <Text
            style={styles.description}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.title}
          </Text>
        </View>
      </View>

      <Carousel
        ref={carouselRef}
        loop={false}
        width={screenWidth}
        height={screenWidth * 0.6}
        autoPlay={false}
        data={data}
        onProgressChange={progress}
        scrollAnimationDuration={1000}
        renderItem={({ item: imgUrl }) => (
          <Image
            source={{ uri: imgUrl }}
            style={{ width: screenWidth, height: screenWidth * 0.6 }}
            resizeMode="cover"
          />
        )}
      />

      <View style={styles.actions}>
        <View style={styles.heartView}>
          <TouchableOpacity onPress={toggleLike}>
            {item?.likes?.includes(currentUser) ? (
              <Image
                source={images?.redHeart}
                style={styles.heartImage}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={
                  themeMode === 'light' ? images?.heart : images?.whiteHeart
                }
                style={styles.heartImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={openComments}>
            <Image
              source={
                themeMode === 'light' ? images?.comments : images?.whiteComments
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
          onPress={index =>
            carouselRef.current?.scrollTo({ index, animated: true })
          }
        />
        <View style={styles.mr60} />
      </View>

      {item?.likes && item?.likes.length > 0 && (
        <Text style={styles.likeText}>
          {t('liked_by')} {item?.lastLikedUser?.firstName}{' '}
          {item?.lastLikedUser?.lastName}
          {item?.likes.length > 1
            ? ` and ${item?.likes.length - 1} others`
            : ''}
        </Text>
      )}

      <View style={styles.f1}>
        <Text
          style={[styles.description, styles.descriptionStyle]}
          numberOfLines={numLines}
          ellipsizeMode="clip"
          onTextLayout={onTextLayout}
        >
          <Text style={styles.name}>
            {item?.user?.firstName} {item?.user?.lastName}{' '}
          </Text>
          {item?.description}
        </Text>

        {showMoreButton && (
          <TouchableOpacity onPress={toggleTextExpansion}>
            <Text style={styles.toggleText}>
              {textShown
                ? productDetailStrings?.lessText
                : productDetailStrings?.seeText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const inlineStyle = (currentTheme: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: rw(12),
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: rw(20),
      marginVertical: rh(10),
      flex: 1,
    },
    profile: {
      alignSelf: 'flex-start',
      width: rw(45),
      height: rw(45),
      borderRadius: 22,
      marginRight: rw(10),
    },
    flex: { flex: 1, backgroundColor: currentTheme.background },
    name: {
      fontWeight: '700',
      fontSize: rf(17),
      color: currentTheme.text,
    },

    description: {
      marginTop: rh(5),
      color: currentTheme.text,
      fontSize: rf(17),
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
    paginationContainer: {
      gap: rw(8),
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
    mr60: { marginRight: rw(60) },
    likeText: {
      marginHorizontal: rw(20),
      marginTop: rh(10),
      fontWeight: '600',
      color: currentTheme.text,
      fontSize: rf(15),
    },
    toggleText: {
      color: colors.blue,
      fontSize: rf(15),
      //   marginTop: rh(2),
      fontWeight: '500',
      marginHorizontal: rw(20),
    },
    f1: { flex: 1 },
  });
