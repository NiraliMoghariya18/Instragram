import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { rw, rh } from '../utils/responsive';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { images } from '../utils/images';
import { colors } from '../utils/color';

const CustomBottomTabbar = ({ state, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        let iconSource;

        if (route.name === 'Home') {
          iconSource = isFocused ? images.activeHome : images.home;
        } else if (route.name === 'Search') {
          iconSource = isFocused ? images.activeSearch : images.search;
        } else if (route.name === 'AddPost') {
          iconSource = isFocused ? images.activeAddPost : images.addPost;
        } else if (route.name === 'Notification') {
          iconSource = isFocused
            ? images.activeNotification
            : images.notification;
        } else if (route.name === 'Profile') {
          iconSource = isFocused ? images.activeProfile : images.profile;
        }
        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabButton}
            onPress={onPress}
          >
            <View style={styles.innerContainer}>
              <Image
                source={iconSource}
                style={[styles.image]}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomBottomTabbar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: rh(90),
    backgroundColor: colors.white,
    elevation: 8,
  },

  tabButton: {
    flex: 1,
    marginTop: rh(20),
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: rw(25),
    height: rw(25),
    tintColor: colors.black,
  },
});
