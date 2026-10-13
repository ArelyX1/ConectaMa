import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';

import { useUser } from '../context/UserContext';


const CustomDrawerContent = (props) => {


  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <DrawerItem
        label="Cerrar sesión"

        labelStyle={styles.logoutButtonText}
        style={styles.logoutButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    borderTopColor: '#ccc',
    marginBottom: 50,
  },
  logoutButtonText: {
    color: 'red',
  },
});

export default CustomDrawerContent;