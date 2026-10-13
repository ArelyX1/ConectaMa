import React,{useEffect} from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-view";
import AndroidMainScreen from "./src/navigation/AndroidMainScreen";
import IOSMainScreen from "./src/navigation/IOSMainScreen";
import { UserProvider } from "./src/context/UserContext";
import * as Notifications from 'expo-notifications';
import { useFonts, SignikaNegative_400Regular, SignikaNegative_700Bold } from '@expo-google-fonts/signika-negative';
import { NavigationContainer } from "@react-navigation/native";


export default function App() {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Otro código de inicialización puede ir aquí
  }, []);
  const isAndroid = Platform.OS === 'android';
  let [fontsLoaded] = useFonts({
    'Signika Negative': SignikaNegative_400Regular,
    'Signika Negative Bold': SignikaNegative_700Bold,
    'SignikaNegative-Regular': SignikaNegative_400Regular,
    'SignikaNegative-Bold': SignikaNegative_700Bold,
  });

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <NavigationContainer>
    <UserProvider>
      {isAndroid ? (
        <SafeAreaProvider>
          <AndroidMainScreen />
        </SafeAreaProvider>
      ) : (
        <IOSMainScreen />
      )}
    </UserProvider>
    </NavigationContainer>
  );
}
