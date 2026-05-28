import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../utils/color';
import { rf, rh, rw } from '../../utils/responsive';
interface Props {
  label: string;
  selected: boolean;
  onSelect: () => void;
}
const RadioButton = ({ label, selected, onSelect }: Props) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      <View style={styles.outerCircle}>
        {selected ? <View style={styles.innerCircle} /> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: rh(10),
  },
  outerCircle: {
    height: rw(24),
    width: rw(24),
    borderRadius: rw(12),
    borderWidth: 2,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rw(10),
  },
  innerCircle: {
    height: rw(12),
    width: rw(12),
    borderRadius: rw(6),
    backgroundColor: colors.blue,
  },
  label: {
    fontSize: rf(16),
    color: colors.black,
  },
});

export default RadioButton;
