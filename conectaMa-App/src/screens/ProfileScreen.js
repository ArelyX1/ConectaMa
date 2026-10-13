import React, { useState, useEffect } from "react";
import {
  Alert,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Switch,
  ScrollView,
} from "react-native";
import { useUser } from "../context/UserContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import { cambiarRol } from "../services/ProfileService";
import { CommonActions } from "@react-navigation/native";
import { pickImage, uploadImage } from "../services/ProfileImageService";
import LoadingOverlay from "../components/LoadingOverlay";

const ProfileScreen = ({ navigation }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, logoutUser, refreshUser } = useUser();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setIsEnabled(user.enServicio);
    }
  }, [user]);

  const handleImagePick = async () => {
    setLoading(true);
    try {
      const uri = await pickImage();
      await uploadImage(uri, user.uid);
      await refreshUser();
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la imagen");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = async () => {
    setIsEnabled((previousState) => !previousState);
    try {
      const nuevoEstado = !isEnabled;
      await cambiarRol(profileData.uid, nuevoEstado);
      await refreshUser();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo cambiar el estado de servicio");
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "No se pudo cerrar la sesión");
    }
  };

  if (!profileData) {
    return (
      <View style={styles.container}>
        <Text>No hay datos de usuario disponibles.</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            )
          }
        >
          <Text style={styles.logoutText}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Usando los nuevos campos de la base de datos
  const valoracionAnfitrion =
    profileData?.promedioValoracionAnfitrion?.toFixed(1) || "0.0";
  const cantidadValoracionesAnfitrion =
    profileData?.cantidadValoracionesAnfitrion || 0;

  const valoracionColaborador =
    profileData?.promedioValoracionColaborador?.toFixed(1) || "0.0";
  const cantidadValoracionesColaborador =
    profileData?.cantidadValoracionesColaborador || 0;

  return (
    <SafeAreaView style={styles.container}>
      {loading && <LoadingOverlay />}

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.topWhiteSection}></View>

        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.profileImageWrapper}
            onPress={handleImagePick}
          >
            <Image
              source={
                profileData?.profileImage
                  ? { uri: profileData.profileImage }
                  : require("../assets/LOGO_SIMBOLO_VERDE.png")
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View style={styles.profileContainer}>
            <Text style={styles.userName}>{`${profileData?.nombres || ""} ${
              profileData?.apellidos || ""
            }`}</Text>
            <Text style={styles.userEmail}>{profileData?.correo || ""}</Text>

            <View style={styles.ratingsContainer}>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingTitle}>Valoración anfitrión</Text>
                <View style={styles.ratingRow}>
                  <AntDesign
                    name="star"
                    size={24}
                    color="orange"
                    style={styles.starIcon}
                  />
                  <Text style={styles.ratingValue}>{valoracionAnfitrion}</Text>
                </View>
                <Text style={styles.ratingCount}>
                  Cantidad {cantidadValoracionesAnfitrion}
                </Text>
              </View>

              <View style={styles.separator}></View>

              <View style={styles.ratingBox}>
                <Text style={styles.ratingTitle}>Valoración colaborador</Text>
                <View style={styles.ratingRow}>
                  <AntDesign
                    name="star"
                    size={24}
                    color="orange"
                    style={styles.starIcon}
                  />
                  <Text style={styles.ratingValue}>{valoracionColaborador}</Text>
                </View>
                <Text style={styles.ratingCount}>
                  Cantidad {cantidadValoracionesColaborador}
                </Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>En servicio</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#43A89B" }}
                  thumbColor={isEnabled ? "#ffffff" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
              </View>

              {isEnabled && (
                <View style={styles.additionalContent}>
                  <Text style={styles.saldoTitle}>Saldo:</Text>
                  <Text style={styles.saldoValue}>28.00</Text>
                  <TouchableOpacity style={styles.recargarButton}>
                    <Text style={styles.recargarText}>Recargar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  topWhiteSection: {
    height: 100,
    backgroundColor: "#f6f6f6",
  },
  topSection: {
    backgroundColor: "#43A89B",
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
    paddingTop: 60,
    height: "100%",
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: "#43A89B",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    position: "absolute",
    top: -60,
    zIndex: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileContainer: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: "5%",
  },
  userName: {
    fontFamily: "SignikaNegative-Regular",
    fontSize: 24,
    color: "#000000",
    marginTop: 20,
    marginBottom: 5,
    textAlign: "center",
  },
  userEmail: {
    fontFamily: "SignikaNegative-Regular",
    fontSize: 20,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
  },
  ratingsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    width: "100%",
    marginBottom: 20,
  },
  ratingBox: {
    flex: 1,
    alignItems: "center",
  },
  ratingTitle: {
    fontFamily: "SignikaNegative-Regular",
    fontSize: 15,
    color: "#000000",
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  ratingValue: {
    fontFamily: "SignikaNegative-Regular",
    fontSize: 18,
    color: "#000000",
    marginTop: 8,
  },
  ratingCount: {
    fontFamily: "SignikaNegative-Regular",
    fontSize: 15,
    color: "#000000",
    marginTop: 8,
  },
  separator: {
    width: 1,
    backgroundColor: "#E0E0E0",
    height: "100%",
    marginHorizontal: 10,
  },
  statusContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontFamily: "SignikaNegative-Regular",
    fontSize: 16,
    color: "#000000",
  },
  saldoTitle: {
    fontSize: 18,
    fontFamily: "SignikaNegative-Regular",
    color: "#000",
  },
  saldoValue: {
    fontSize: 22,
    fontFamily: "SignikaNegative-Bold",
    color: "#FF9500",
  },
  recargarButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FF9500",
    borderRadius: 5,
  },
  recargarText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "SignikaNegative-Bold",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#04352C",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "SignikaNegative-Bold",
  },
});

export default ProfileScreen;