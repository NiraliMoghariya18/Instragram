import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { rf, rw } from '../utils/responsive';
import { images } from '../utils/images';

import { useTheme } from '../context/Theme';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Theme } from '../types/screens';
const CustomHeader = ({ route }: { route: string }) => {
  const { currentTheme } = useTheme();
  const navigation = useNavigation();
  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const styles = inlineStyle(currentTheme, route);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.left} onPress={handleOpenDrawer}>
        <>
          <Image
            source={images.menu}
            style={styles.icon}
            resizeMode="contain"
          />
        </>
      </TouchableOpacity>
      <Text style={styles.instagramText}>{route}</Text>
    </View>
  );
};

const inlineStyle = (currentTheme: Theme, route: string) =>
  StyleSheet.create({
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
      fontFamily: route === 'Instagram' ? 'GrandHotel-Regular' : undefined,
      fontSize: route === 'Instagram' ? rf(30) : rf(22),
    },
    icon: {
      width: rw(30),
      height: rw(30),
      tintColor: currentTheme.text,
    },
    safeAreaViewStyle: { backgroundColor: currentTheme.background },
  });

export default CustomHeader;
