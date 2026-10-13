import React from 'react';
import { Text } from 'react-native';

export const CustomText = ({ style, ...props }) => (
  <Text
    style={[{ fontFamily: 'SignikaNegative_400Regular' }, style]}
    {...props}
  />
);

export const CustomBoldText = ({ style, ...props }) => (
  <Text
    style={[{ fontFamily: 'SignikaNegative_700Bold' }, style]}
    {...props}
  />
);