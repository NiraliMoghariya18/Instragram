//import liraries
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
  ImageStyle,
} from 'react-native';
import { colors } from '../../utils/color';
import { rf, rh, rw } from '../../utils/responsive';
import { useTheme } from '../../context/Theme';

interface Props {
  image: string;
  firstName: string;
  lastName: string;
  ButtonName: string;
  onPress: () => void;
  btnStyle: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  closeImage?: ImageSourcePropType;
  closeImageStyle?: StyleProp<ImageStyle>;
  imageOnPress?: () => void;
  disable?: boolean;
}

export const CustomCard = ({
  image,
  firstName,
  lastName,
  onPress,
  textStyle,
  ButtonName,
  btnStyle,
  closeImage,
  closeImageStyle,
  imageOnPress,
  disable = false,
}: Props) => {
  const { currentTheme } = useTheme();

  return (
    <View
      style={[styles.userContainer, { backgroundColor: currentTheme.card }]}
    >
      <View style={styles.leftContainer}>
        <Image source={{ uri: image }} style={styles.profileImage} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.username, { color: currentTheme.text }]}>
            {firstName}
          </Text>
          <Text style={[styles.name, { color: currentTheme.text }]}>
            {firstName} {lastName}
          </Text>
        </View>
      </View>
      <View style={styles.closeImageView}>
        {closeImage && (
          <TouchableOpacity onPress={imageOnPress}>
            <Image
              source={closeImage}
              style={[closeImageStyle]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.followButton, btnStyle]}
          onPress={onPress}
          disabled={disable}
        >
          <Text style={[styles.followText, textStyle]}>{ButtonName}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rh(20),
    paddingHorizontal: rw(15),
    paddingVertical: rh(10),
    backgroundColor: colors.white,
    borderRadius: rw(10),
    flex: 1,
    shadowColor: colors.gray,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,

    elevation: 8,
  },

  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: rw(55),
    height: rw(55),
    borderRadius: rw(100),
    marginRight: rw(12),
  },

  username: {
    fontSize: rf(16),
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  name: {
    fontSize: rf(14),
    textTransform: 'capitalize',
  },

  followButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: rw(18),
    paddingVertical: rh(8),
    borderRadius: rw(8),
    minWidth: rw(100),
    alignItems: 'center',
  },

  followText: {
    color: colors.white,
    fontWeight: '600',
  },
  closeImageView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(10),
  },
});
