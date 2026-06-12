import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  StyleProp,
  TextStyle,
  Image,
  ImageSourcePropType,
  ImageStyle,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { rf, rh, rw } from '../../utils/responsive';
import { colors } from '../../utils/color';
import { useTheme } from '../../context/Theme';
import { Theme } from '../../types/screens';

interface Props {
  placeholderTextColor?: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  onChangeText?: (text: string) => void;
  error?: string;
  label?: string;
  rightImage?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  onPressImage?: () => void;
  secureTextEntry?: boolean;
  editable?: boolean;
  onPressIn?: () => void;
  variant?: 'primary' | 'secondary';
}

const CustomInput = ({
  placeholderTextColor,
  value,
  placeholder,
  multiline,
  numberOfLines,
  style,
  error,
  label,
  onChangeText,
  rightImage,
  imageStyle,
  onPressImage,
  secureTextEntry,
  editable = true,
  onPressIn,
  variant,
}: Props) => {
  const { currentTheme } = useTheme();
  const isRTL = I18nManager.isRTL;
  const styles = inlineStyle(isRTL, currentTheme);
  return (
    <View style={styles.mainContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}

      <View
        style={[
          styles.inputRow,
          style,
          variant === 'primary' ? styles.primaryBorder : styles.secondaryBorder,
        ]}
      >
        <TextInput
          placeholderTextColor={placeholderTextColor}
          value={value}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.textInput]}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          editable={editable}
          onPressIn={onPressIn}
        />
        {rightImage && (
          <TouchableOpacity onPress={onPressImage} activeOpacity={0.7}>
            <Image
              source={rightImage}
              style={[styles.defaultImage, imageStyle]}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const inlineStyle = (isRTL: boolean, currentTheme: Theme) =>
  StyleSheet.create({
    mainContainer: {
      marginHorizontal: rw(28),
      marginBottom: rh(20),
    },
    inputLabel: {
      fontSize: rf(14),
      marginBottom: rh(5),
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.offWhite,
      borderRadius: rw(4),
      paddingHorizontal: rw(15),
      borderColor: colors.blueGray,
    },
    textInput: {
      flex: 1,
      height: rh(50),
      textAlign: isRTL ? 'right' : 'left',
      color: currentTheme.text,
    },
    defaultImage: {
      width: rw(24),
      height: rh(24),
      resizeMode: 'contain',
      marginLeft: rw(10),
    },
    errorText: {
      fontSize: rf(12),
      color: colors.red,
      marginTop: rh(5),
    },
    primaryBorder: {
      borderWidth: 1,
      borderColor: colors.blueGray,
    },

    secondaryBorder: {
      borderBottomWidth: 2,
      borderColor: colors.blueGray,
    },
  });

export default CustomInput;
