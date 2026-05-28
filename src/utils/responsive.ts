import { RFValue } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

export const rf = (value: number) => RFValue(value, 867);

export const rh = (value: number) => {
  return heightPercentageToDP((value * 100) / 867);
};
export const rw = (value: number) => {
  return widthPercentageToDP((value * 100) / 430);
};
