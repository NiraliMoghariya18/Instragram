import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { rf, rh, rw } from '../utils/responsive';
import { DrawerHeaderProps } from '@react-navigation/drawer';
import { images } from '../utils/images';
import { colors } from '../utils/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import { strings } from '../utils/strings';

const CustomHeader = ({ navigation }: DrawerHeaderProps) => {
  return (
    <SafeAreaView>
      <View style={[styles.headerContainer]}>
        <TouchableOpacity
          style={styles.left}
          onPress={() => navigation.openDrawer()}
        >
          <Image
            source={images.menu}
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.instagramText}>{strings.instagram}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: {
    position: 'absolute',
    left: rw(20),
  },
  instagramText: {
    fontSize: rf(35),
    fontFamily: 'GrandHotel-Regular',
  },
  icon: {
    width: rw(30),
    height: rh(30),
    tintColor: colors.black,
  },
});

export default CustomHeader;
