import { User } from './screens';

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
  EditProfile?: { userData: User; isEdit: boolean };
  Followers: { followers: string[] };
  Following: { following: string[] };
};
