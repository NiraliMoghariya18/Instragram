export type StackRootScreen = {
  SignUp?: {
    email?: string;
    firstName: string;
    lastName: string;
    isGoogleUser: boolean;
  };
  Login: undefined;
  DrawerNavigation?: {
    screen: string;
    params: { screen: string };
  };
};
