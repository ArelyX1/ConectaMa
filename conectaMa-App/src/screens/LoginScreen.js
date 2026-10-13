import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUser } from "../context/UserContext"; // Asegúrate de importar correctamente tu contexto
import { ActivityIndicator } from "react-native-paper";
import LoadingOverlay from "../components/LoadingOverlay";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado para el indicador de carga
  const { user, loginUser } = useUser();

  // Verificar si hay un usuario autenticado al cargar la pantalla
  useEffect(() => {
    if (user) {
      // Si hay un usuario autenticado, redirigir automáticamente
      navigation.navigate("MenuNavigator");
    } 
  }, [user, navigation]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async () => {
    setIsLoading(true); // Activar la carga al intentar iniciar sesión
    try {
      await loginUser(email, password);
      navigation.navigate("MenuNavigator");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false); // Desactivar la carga después de intentar iniciar sesión
    }
  };
  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };
  
  if (isLoading) {
    // Mostrar un indicador de carga mientras se verifica la autenticación
    return (
      <View style={styles.loadingContainer}>
        <LoadingOverlay visible={isLoading} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
          >
            <View style={styles.container}>
              <Image
                source={require("../assets/LOGO_SIMBOLO_VERDE.png")}
                style={styles.logo}
              />
              <Text style={styles.title}>Iniciar Sesión</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Image
                  source={require("../assets/Madre.png")}
                  style={styles.inputIcon}
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Ionicons
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color="#43A89B"
                    style={styles.eyeInput}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.links}>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.linkText}>
                    ¿No tienes cuenta? Regístrate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Ingresar</Text>
              </TouchableOpacity>

            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F4F0",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F4F4F0",
  },
  logo: {
    width: 100,
    height: 145,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#04352C",
    fontFamily: "Signika Negative",
  },
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  eyeInput: {
    width: 23,
    height: 20,
    marginLeft: 10,
  },
  inputIcon: {
    width: 20,
    height: 28,
    marginLeft: 10,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#04352C",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Signika Negative",
  },
  links: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    borderRadius: 10,
  },
  linkText: {
    color: "#43A89B",
    marginVertical: 5,
    textAlign: "center",
  },
  loadingContainer: {
    position: "absolute", // Position it absolutely
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    zIndex: 1000, // Ensure it is above other components
  },
});

export default LoginScreen;
