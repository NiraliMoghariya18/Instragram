import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import BottomTabNavigation from './BottomTabNavigation';
import { CustomDrawerContent } from './CustomDrawer';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { rw } from '../utils/responsive';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  const drawer = (props: DrawerContentComponentProps) => {
    return <CustomDrawerContent {...props} />;
  };

  return (
    <Drawer.Navigator
      drawerContent={drawer}
      screenOptions={{
        drawerStyle: {
          width: rw(320),
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen
        component={BottomTabNavigation}
        name="BottomTabNavigation"
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
          return {
            title: routeName,
          };
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
