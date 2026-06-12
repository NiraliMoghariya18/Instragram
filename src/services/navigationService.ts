import { createNavigationContainerRef } from '@react-navigation/native';
import { StackRootScreen } from '../types/navigationtype';

export const navigationRef = createNavigationContainerRef<StackRootScreen>();

let pendingActions: (() => void)[] = [];

export const navigate = (name: string, params?: object) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('DrawerNavigation', {
      screen: 'BottomTabNavigation',
      params: { screen: name },
    });
  } else {
    pendingActions.push(() => navigate(name, params));
  }
};

export const processPendingActions = () => {
  pendingActions.forEach(action => action());
  pendingActions = [];
};
