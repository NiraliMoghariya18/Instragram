import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import BootSplash from 'react-native-bootsplash';
import StackNavigation from './src/navigations/StackNavigation';
import 'react-native-url-polyfill/auto';
import Toast from 'react-native-toast-message';
import 'react-native-url-polyfill/auto';
import { ThemeProvider } from './src/context/Theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  return (
    <>
      <SafeAreaProvider style={{ flex: 1 }}>
        <ThemeProvider>
          <NavigationContainer
            onReady={() => {
              BootSplash.hide({ fade: true });
            }}
          >
            <StackNavigation />
          </NavigationContainer>
          <Toast />
        </ThemeProvider>
      </SafeAreaProvider>
    </>
  );
};

export default App;
