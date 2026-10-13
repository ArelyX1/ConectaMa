// HomeScreen.js
import React from "react";
import { View, Button, StyleSheet } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button
        title="MamiMatch"
        onPress={() => navigation.navigate("MamiMatchScreen")}
      />

      <View style={styles.space} />
      <Button
        title="Alerta Mami"
        onPress={() => navigation.navigate("AlertaScreen")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  space: {
    height: 20,
  },
});

export default HomeScreen;
