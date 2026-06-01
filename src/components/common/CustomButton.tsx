import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  TextStyle,
  Image,
  ImageSourcePropType,
  ImageStyle,
  View,
} from 'react-native';
import { rf, rh, rw } from '../../utils/responsive';
import { colors } from '../../utils/color';

interface Props {
  label: string;
  onPress: () => void;
  style?: StyleProp<TextStyle>;
  leftImage?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<TextStyle>;
}
const CustomButton = ({
  label,
  onPress,
  style,
  imageStyle,
  leftImage,
  textStyle,
}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, style]}
      onPress={onPress}
      activeOpacity={0.5}
    >
      {leftImage && (
        <View>
          <Image source={leftImage} style={[imageStyle]} />
        </View>
      )}
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: colors.blue,
    borderRadius: rw(4),
    marginTop: rh(14),
    marginHorizontal: rw(28),
    justifyContent: 'center',
    alignItems: 'center',
    gap: rw(10),
  },
  buttonText: {
    fontSize: rf(16),
    color: colors.white,
    textAlign: 'center',
    paddingVertical: rh(15),
  },
});

export default CustomButton;
