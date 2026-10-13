import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useUser } from "../context/UserContext";
import MamiMatchAnfitrionaScreen from "./MamiMatchAnfitrionaScreen";
import AlertaMamiAfitrionaScreen from "./AlertaMamiAnfitrionaScreen";
import { createStackNavigator } from "@react-navigation/stack";
import MamiMatchColaboradoraScreen from "./MamiMatchColaboradoraScreen";
import AlertaMamiColaboradoraScreen from "./AlertaMamiColaboradoraScreen";

const Stack = createStackNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get("window"); 

const scaleFont = (size) => {
  const scale = SCREEN_WIDTH / 375;
  return size * scale;
};

const MainMenuServicioScreen = ({ navigation }) => {
  const { user } = useUser();
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
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle]}>Mami Match</Text>
            <Image
              source={require("../assets/corazonBlanco.png")}
              style={styles.logoContainer}
            />
          </View>
          <View style={styles.cardRow}>
            <View style={[styles.secondCard]}>
              <Text style={styles.cardSubtitle}>Anfitriona</Text>
              <Text style={styles.cardDescription}>
                Aquí podrás solicitar servicios a colaboradoras.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("MamiMatch")}
                  style={[styles.button, { backgroundColor: "#04352C" }]}
                >
                  <Text style={[styles.buttonText, { color: "#ffffff" }]}>
                    Comenzar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.thirdCard]}>
              <Text style={styles.cardSubtitleSecond}>Colaboradora</Text>
              <Text style={styles.cardDescriptionSecond}>
                Aquí podrás ver ofertas de anfitrionas que solicitan tus
                servicios.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("MamiMatchColaboradora")}
                  style={[styles.button, { backgroundColor: "#C499E0" }]}
                >
                  <Text style={[styles.buttonText, { color: "#ffffff" }]}>
                    Comenzar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle]}>Alerta Mami</Text>
            <Image
              source={require("../assets/ManoCorazonBlanco.png")}
              style={styles.logoContainer}
            />
          </View>
          <View style={styles.cardRow}>
            <View style={[styles.secondCard]}>
              <Text style={styles.cardSubtitle}>Anfitriona</Text>
              <Text style={styles.cardDescription}>
                Aquí podrás enviar alertas a colaboradoras para servicios
                solicitar inmediatos.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("AlertaMami")}
                  style={[styles.button, { backgroundColor: "#04352C" }]}
                >
                  <Text style={[styles.buttonText, { color: "#ffffff" }]}>
                    Comenzar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.thirdCard]}>
              <Text style={styles.cardSubtitleSecond}>Colaboradora</Text>
              <Text style={styles.cardDescriptionSecond}>
                Aquí podrás ver ofertas de anfitrionas que solicitan tus
                servicios.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("AlertaMamiColaboradora")}
                  style={[styles.button, { backgroundColor: "#C499E0" }]}
                >
                  <Text style={[styles.buttonText, { color: "#ffffff" }]}>
                    Comenzar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MainMenuServicioStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainMenu"
        component={MainMenuServicioScreen}
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
      <Stack.Screen
        name="MamiMatchColaboradora"
        component={MamiMatchColaboradoraScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AlertaMamiColaboradora"
        component={AlertaMamiColaboradoraScreen}
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
  logoContainer: {
    width: 37,
    height: 37,
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcomeText: {
    fontFamily: "SignikaNegative-Bold",
    fontSize: scaleFont(20), 
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
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondCard: {
    width: "48%",
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
  thirdCard: {
    width: "48%",
    padding: 15,
    backgroundColor: "#DCCEF0",
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
    fontSize: scaleFont(24), 
    color: "#ffffff",
  },
  cardSubtitle: {
    fontFamily: "SignikaNegative-Bold",
    fontSize: scaleFont(19), 
    color: "#04352C",
    marginBottom: 5,
  },
  cardSubtitleSecond: {
    fontFamily: "SignikaNegative-Bold",
    fontSize: scaleFont(19), 
    color: "#C499E0",
    marginBottom: 5,
  },
  cardDescription: {
    fontFamily: "SignikaNegative-Regular",
    fontSize: scaleFont(12), 
    color: "#43A89B",
    marginBottom: 15,
  },
  cardDescriptionSecond: {
    fontFamily: "SignikaNegative-Regular",
    fontSize: scaleFont(12), 
    color: "#FFFFFF",
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
    fontSize: scaleFont(14),
    fontWeight: "bold",
  },
});

export default MainMenuServicioStack;
