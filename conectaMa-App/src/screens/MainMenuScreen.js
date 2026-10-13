import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import MamiMatchScreen from "./MamiMatchScreen";
import AlertaMamiAfitrionaScreen from "./AlertaMamiAnfitrionaScreen";
import MamiMatchAnfitrionaScreen from "./MamiMatchAnfitrionaScreen";
import { useUser } from "../context/UserContext";

const Stack = createStackNavigator();

const MainMenuScreen = ({ navigation }) => {
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      navigation.navigate("Login");
    }
  }, [user, navigation]);

  if (!user) {
    return null; 
  }

  const userName = user.nombres;
  const welcomeText = `Hola, ${userName}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#ffff" }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require("../assets/LOGO_PRINCIPAL_VERDE.png")}
          style={styles.logo}
        />

        <Text style={styles.welcomeText}>{welcomeText}</Text>

        <View style={[styles.card]}>
          <Text style={[styles.cardTitle]}>Mami Match</Text>
          <View style={[styles.secondCard]}>
            <Text style={styles.cardSubtitle}>Anfitriona</Text>
            <Text style={styles.cardDescription}>
              Aquí podrás solicitar servicios a colaboradoras.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#04352C" }]}
                onPress={() => navigation.navigate("MamiMatch")}
              >
                <Text style={[styles.buttonText, { color: "#ffffff" }]}>
                  Comenzar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.card]}>
          <Text style={[styles.cardTitle]}>Alerta Mami</Text>
          <View style={[styles.secondCard]}>
            <Text style={styles.cardSubtitle}>Anfitriona</Text>
            <Text style={styles.cardDescription}>
              Aquí podrás enviar alertas a colaboradoras para servicios
              solicitar inmediatos.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#04352C" }]}
                onPress={() => navigation.navigate("AlertaMami")}
              >
                <Text style={[styles.buttonText, { color: "#ffffff" }]}>
                  Comenzar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MainMenuStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainMenu"
        component={MainMenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MamiMatch"
        component={MamiMatchAnfitrionaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AlertaMami"
        component={AlertaMamiAfitrionaScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcomeText: {
    fontFamily: "SignikaNegative-Bold",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
    width: "89%",
    alignSelf: "center",
  },
  card: {
    width: "90%",
    padding: 15,
    backgroundColor: "#43A89B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 15,
    borderRadius: 10,
  },
  secondCard: {
    width: "100%",
    padding: 15,
    backgroundColor: "#B7EAE0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 15,
    borderRadius: 10,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontFamily: "SignikaNegative-Bold",
    fontWeight: "bold",
    fontSize: 24,
    color: "#ffffff",
  },
  cardSubtitle: {
    fontFamily: "SignikaNegative-Bold",
    fontSize: 20,
    color: "#04352C",
    marginBottom: 5,
  },
  cardDescription: {
    fontFamily: "SignikaNegative-Regular",
    fontSize: 12,
    color: "#43A89B",
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    padding: 8,
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: "SignikaNegative-Bold",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default MainMenuStack;
