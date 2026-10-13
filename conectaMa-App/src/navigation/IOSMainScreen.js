import React from "react";
import { SafeAreaView } from "react-native";
import MainNavigator from "./MainNavigator";
import { UserProvider } from "../context/UserContext";
import { View, StyleSheet } from "react-native";



const IOSMainScreen = () => {
  return (
    <View style={styles.container}>
      <SafeAreaView forceInset={{ top: "always" }} />
      <UserProvider>
        <MainNavigator />
      </UserProvider>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default IOSMainScreen;