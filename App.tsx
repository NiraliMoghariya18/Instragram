import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import BootSplash from 'react-native-bootsplash';
import StackNavigation from './src/navigations/StackNavigation';
import 'react-native-url-polyfill/auto';
import Toast from 'react-native-toast-message';

const App = () => {
  return (
    <>
      <NavigationContainer
        onReady={() => {
          BootSplash.hide({ fade: true });
        }}
      >
        <StackNavigation />
      </NavigationContainer>
      <Toast />
    </>
  );
};

export default App;
