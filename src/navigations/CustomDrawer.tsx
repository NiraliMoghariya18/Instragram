import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { rf, rh, rw } from '../utils/responsive';
import { colors } from '../utils/color';
import auth from '@react-native-firebase/auth';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const drawerState = props.state;
  const tabState = drawerState.routes[drawerState.index]?.state;
  const activeTab = tabState?.routeNames?.[tabState?.index ?? 0];

  const onPressHome = () => {
    props.navigation.navigate('BottomTabNavigation', {
      screen: 'Home',
    });
  };
  const onPressSearch = () => {
    props.navigation.navigate('BottomTabNavigation', {
      screen: 'Search',
    });
  };
  const onPressAddPost = () => {
    props.navigation.navigate('BottomTabNavigation', {
      screen: 'AddPost',
    });
  };
  const onPressNotification = () => {
    props.navigation.navigate('BottomTabNavigation', {
      screen: 'Notification',
    });
  };
  const onPressProfile = () => {
    props.navigation.navigate('BottomTabNavigation', {
      screen: 'Profile',
    });
  };

  return (
    <View style={styles.flex}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.containerStyle}
      >
        <View style={styles.gap}>
          <View>
            <View style={styles.menu}>
              <TouchableOpacity
                style={[styles.item, activeTab === 'Home' && styles.activeItem]}
                onPress={() => onPressHome()}
              >
                <Text style={styles.itemText}>Home</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menu}>
              <TouchableOpacity
                style={[
                  styles.item,
                  activeTab === 'Search' && styles.activeItem,
                ]}
                onPress={() => onPressSearch()}
              >
                <Text style={styles.itemText}>Search</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menu}>
              <TouchableOpacity
                style={[
                  styles.item,
                  activeTab === 'AddPost' && styles.activeItem,
                ]}
                onPress={() => onPressAddPost()}
              >
                <Text style={styles.itemText}>Add Post</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menu}>
              <TouchableOpacity
                style={[
                  styles.item,
                  activeTab === 'Notification' && styles.activeItem,
                ]}
                onPress={() => onPressNotification()}
              >
                <Text style={styles.itemText}>Notification</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menu}>
              <TouchableOpacity
                style={[
                  styles.item,
                  activeTab === 'Profile' && styles.activeItem,
                ]}
                onPress={() => onPressProfile()}
              >
                <Text style={styles.itemText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => auth().signOut()}
            style={styles.logOutView}
          >
            <Text style={styles.logOutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    flex: 1,
    paddingTop: rh(2),
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  flex: { flex: 1 },
  containerStyle: { flexGrow: 1, justifyContent: 'space-between' },
  gap: { gap: rh(370) },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rh(20),
    paddingHorizontal: rw(30),
    borderRadius: rw(10),
    marginHorizontal: rw(3),
    marginBottom: rh(0.8),
  },
  activeItem: {
    backgroundColor: colors.offGray,
  },
  itemText: {
    fontSize: rf(17),
    color: colors.black,
    fontWeight: '500',
  },
  logOutView: {
    marginHorizontal: rw(20),
    marginVertical: rh(10),
    backgroundColor: colors.red,
    borderRadius: rw(10),
    alignSelf: 'flex-end',
  },
  logOutText: {
    paddingVertical: rh(10),
    paddingHorizontal: rw(20),
    textAlign: 'right',
    fontSize: rf(20),
  },
});
