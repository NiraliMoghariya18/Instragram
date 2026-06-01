import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import BootSplash from 'react-native-bootsplash';
import StackNavigation from './src/navigations/StackNavigation';
import 'react-native-url-polyfill/auto';

const App = () => {
  return (
    <NavigationContainer
      onReady={() => {
        BootSplash.hide({ fade: true });
      }}
    >
      <StackNavigation />
    </NavigationContainer>
  );
};

export default App;
