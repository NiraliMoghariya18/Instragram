import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { rf, rh, rw } from '../utils/responsive';
import { colors } from '../utils/color';
import auth from '@react-native-firebase/auth';
import { strings } from '../utils/strings';
import { useTheme } from '../context/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const drawerState = props.state;
  const tabState = drawerState.routes[drawerState.index]?.state;
  const activeTab = tabState?.routeNames?.[tabState?.index ?? 0];
  const { themeMode, currentTheme, toggleTheme } = useTheme();

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

  const onSignOut = async () => {
    await auth().signOut();
    await props.navigation.navigate('Login');
  };

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: currentTheme.background }]}
    >
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Switch
        value={themeMode === 'dark'}
        onValueChange={toggleTheme}
        trackColor={{ false: colors.gray, true: colors.blue }}
        thumbColor={themeMode === 'dark' ? colors.yellow : colors.yellow_white}
        style={styles.switchStyle}
      />
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.containerStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gap}>
          <View>
            <View style={styles.menu}>
              <TouchableOpacity
                style={[styles.item, activeTab === 'Home' && styles.activeItem]}
                onPress={() => onPressHome()}
              >
                <Text
                  style={[
                    styles.itemText,
                    {
                      color:
                        activeTab === 'Home' ? colors.black : currentTheme.text,
                    },
                  ]}
                >
                  {strings.home}
                </Text>
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
                <Text
                  style={[
                    styles.itemText,
                    {
                      color:
                        activeTab === 'Search'
                          ? colors.black
                          : currentTheme.text,
                    },
                  ]}
                >
                  {strings.search}
                </Text>
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
                <Text
                  style={[
                    styles.itemText,
                    {
                      color:
                        activeTab === 'AddPost'
                          ? colors.black
                          : currentTheme.text,
                    },
                  ]}
                >
                  {strings.add_post}
                </Text>
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
                <Text
                  style={[
                    styles.itemText,
                    {
                      color:
                        activeTab === 'Notification'
                          ? colors.black
                          : currentTheme.text,
                    },
                  ]}
                >
                  {strings.notification}
                </Text>
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
                <Text
                  style={[
                    styles.itemText,
                    {
                      color:
                        activeTab === 'Profile'
                          ? colors.black
                          : currentTheme.text,
                    },
                  ]}
                >
                  {strings.profile}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={onSignOut} style={styles.logOutView}>
            <Text style={styles.logOutText}>{strings.logout}</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
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
  gap: { gap: rh(300) },
  switchStyle: { alignSelf: 'flex-end', marginRight: rh(15) },
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
    // color: colors.black,
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
