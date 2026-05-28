import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import Home from '../screens/app/Home';
import CustomBottomTabbar from './CustomBottomTabbar';
import Search from '../screens/app/Search';
import AddPost from '../screens/app/AddPost';
import Notification from '../screens/app/Notification';
import Profile from '../screens/app/Profile';

const Tab = createBottomTabNavigator();

const BottomTabNavigation = () => {
  const tabBar = (props: BottomTabBarProps) => {
    return <CustomBottomTabbar {...props} />;
  };
  return (
    <Tab.Navigator
      tabBar={tabBar}
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="AddPost" component={AddPost} />
      <Tab.Screen name="Notification" component={Notification} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
