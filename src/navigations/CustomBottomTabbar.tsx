import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { rw, rh } from '../utils/responsive';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { images } from '../utils/images';
import { colors } from '../utils/color';
import { useTheme } from '../context/Theme';

const CustomBottomTabbar = ({ state, navigation }: BottomTabBarProps) => {
  const { currentTheme, themeMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.card }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        let iconSource;

        if (route.name === 'Home') {
          if (themeMode === 'dark') {
            iconSource = isFocused ? images.whiteActiveHome : images.whiteHome;
          } else {
            iconSource = isFocused ? images.activeHome : images.home;
          }
        } else if (route.name === 'Search') {
          if (themeMode === 'dark') {
            iconSource = isFocused
              ? images.whiteActiveSearch
              : images.whiteSearch;
          } else {
            iconSource = isFocused ? images.activeSearch : images.search;
          }
        } else if (route.name === 'AddPost') {
          if (themeMode === 'dark') {
            iconSource = isFocused
              ? images.whiteActiveAddPost
              : images.whiteAddPost;
          } else {
            iconSource = isFocused ? images.activeAddPost : images.addPost;
          }
        } else if (route.name === 'Notification') {
          if (themeMode === 'dark') {
            iconSource = isFocused
              ? images.whiteActiveNotification
              : images.whiteNotification;
          } else {
            iconSource = isFocused
              ? images.activeNotification
              : images.notification;
          }
        } else if (route.name === 'Profile') {
          if (themeMode === 'dark') {
            iconSource = isFocused ? images.whiteUser : images.whiteActiveUser;
          } else {
            iconSource = isFocused ? images.activeProfile : images.profile;
          }
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
  },
});
