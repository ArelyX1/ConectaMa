import React from 'react';
import { UserProvider } from '../context/UserContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeAreaView from "react-native-safe-area-view";
import { NavigationContainer } from '@react-navigation/native'; // 1. Importar el contenedor
import MainNavigator from './MainNavigator';

const AndroidMainScreen = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} forceInset={{ top: "always" }}>
      <UserProvider>
        {/* 2. Envolver el navegador con el contenedor aquí */}

          <MainNavigator />

      </UserProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default AndroidMainScreen;