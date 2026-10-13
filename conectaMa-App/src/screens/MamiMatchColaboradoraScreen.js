import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MamiMatchMiOfertaCard from "../components/MamiMatchMiOfertaCard";
import MamiMatchColaboradoraCard from "../components/MamiMatchColaboradoraCard";
import ValoracionColaboradorModal from "../components/modals/ValoracionColaboradorModal";
import { endEncargoColaborador } from "../services/EncargoService";
import { getDatabase, ref, get, onValue, off } from "firebase/database";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";

const MamiMatchColaboradoraScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [Encargos, setEncargos] = useState([]);
  const [filteredEncargos, setFilteredEncargos] = useState([]);
  const [tusOfertas, setTusOfertas] = useState({});
  const [selectedEncargoId, setSelectedEncargoId] = useState(null);
  const [isOfertaModalVisible, setOfertaModalVisible] = useState(false);
  const [currentOfertas, setCurrentOfertas] = useState([]);
  const { user, refreshDistance } = useUser();
  const navigation = useNavigation();
  const [isEncargos, setIsEncargos] = useState(true);
  const [
    isValoracionColaboradorModalVisible,
    setValoracionColaboradorModalVisible,
  ] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [distance, setDistance] = useState(user.distancia);
  const [userLocation, setUserLocation] = useState(null);
  const db = getFirestore(); 

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permiso de localización denegado");
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error al obtener la ubicación", error);
      }
    };

    getUserLocation();
  }, []);

  const fetchEncargos = () => {
    const db = getDatabase();
    const encargosRef = ref(db, "encargos");

    onValue(encargosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const encargosConId = Object.entries(data).filter(([id, value]) => value.uidUsuario !== user.uid)
          .map(([id, value]) => ({
            encargoId: id,
            ...value,
          }));
        console.log("Encargos filtrados (excluyendo propios):", encargosConId);
        setEncargos(encargosConId);
        filterEncargosByDistance(encargosConId, distance);
      } else {
        console.log("No hay encargos disponibles.");
        setEncargos([]);
      }
    }, {
      onlyOnce: false
    });
};

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEncargos();
    setRefreshing(false);
  };

  const fetchContraofertasByUser = async () => {
    const db = getDatabase();
    const encargosRef = ref(db, "encargos");

    try {
      const snapshot = await get(encargosRef);
      const encargos = snapshot.val() || {};
      const userOffers = {};

      for (const encargoId in encargos) {
        if (encargos[encargoId].contraofertas) {
          for (const contraofertaId in encargos[encargoId].contraofertas) {
            if (
              encargos[encargoId].contraofertas[contraofertaId].uidUsuario ===
              user.uid
            ) {
              userOffers[contraofertaId] = {
                ...encargos[encargoId].contraofertas[contraofertaId],
                encargoId: encargoId,
              };
            }
          }
        }
      }

      setTusOfertas(userOffers);
    } catch (error) {
      console.error("Error al obtener las contraofertas:", error);
    }
  };

  useEffect(() => {
    fetchEncargos();
    fetchContraofertasByUser();
    return () => {
      const db = getDatabase();
      const encargosRef = ref(db, "encargos");
      off(encargosRef); // Apaga el listener
    };
  }, [user.uid]);
  useEffect(() => {
    if (userLocation && Encargos.length > 0) {
      filterEncargosByDistance(Encargos, distance);
    }
  }, [userLocation]);
  useEffect(() => {
    filterEncargosByDistance(Encargos, distance);
  }, [Encargos, distance, userLocation]);

  const filterEncargosByDistance = (encargos, maxDistance) => {
    if (!userLocation) return;

    const filtered = encargos.filter((encargo) => {
      if (!encargo.ubicacion) return false;
      const { latitude, longitude } = encargo.ubicacion;
      const distanceToEncargo = getDistanceFromLatLonInKm(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude
      );
      return distanceToEncargo <= maxDistance;
    });

    setFilteredEncargos(filtered);
  };
  useEffect(() => {
    Object.entries(tusOfertas).forEach(([key, oferta]) => {
      const fechaEncargo = new Date(oferta.fechaEncargo);
      const ahora = new Date();
      if (fechaEncargo <= ahora) {
        if(oferta.endColaborador !== true && oferta.estado === "aceptada") {
          console.log("valorando colaborador");
          setSelectedEncargoId(oferta.encargoId);
          setValoracionColaboradorModalVisible(true);
        } else {
          if(oferta.estado === "aceptada"){
            endEncargoColaborador(oferta.encargoId);
          }
        }
      }
    });
  }, [tusOfertas]);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleCreateButtonPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleViewOfertas = (contraofertas, key) => {
    const contraofertasArray = Object.entries(contraofertas || {}).map(
      ([id, data]) => ({ id, ...data })
    );
    setCurrentOfertas(contraofertasArray);
    setOfertaModalVisible(true);
  };

  const handleCloseOfertaModal = () => {
    setOfertaModalVisible(false);
  };

  const renderTusOfertas = () =>
    Object.entries(tusOfertas).map(([id, oferta]) => (
      <MamiMatchMiOfertaCard
        key={id}
        miOfertaObj={{
          status: oferta.estado,
          fechaEncargo: oferta.fechaEncargo,
          description: oferta.descripcion,
          oferta: oferta.oferta,
          chat: oferta.chat,
          user: oferta.uidUsuario,
          encargoId: oferta.encargoId,
          fechaEncargo: oferta.fechaEncargo,
        }}
        onOpenChat={() => handleOpenChat(oferta, id)}
        onViewOffers={() => handleViewOfertas(oferta.contraofertas, id)}
      />
    ));

  const renderEncargosDisponibles = () =>
    filteredEncargos.map((encargo) => (
      <MamiMatchColaboradoraCard
        key={encargo.encargoId}
        mamiMatch={{
          status: encargo.estado,
          date: encargo.fechaEncargo,
          description: encargo.descripcion,
          price: encargo.oferta,
          dispositivo: encargo.dispositivo,
          chat: encargo.chat,
          user: encargo.uidUsuario,
          encargoId: encargo.encargoId,
          fechaEncargo: encargo.fechaEncargo,
        }}
        onOpenChat={() => handleOpenChat(encargo, encargo.encargoId)}
        onViewOffers={() =>
          handleViewOfertas(encargo.contraofertas, encargo.encargoId)
        }
      />
    ));

  const handleOpenChat = (encargo, key) => {
    // ------------------------------
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const closeValoracionColaboradorModal = () => {
    setValoracionColaboradorModalVisible(false);
  };

  const updateDistanceInFirestore = async (newDistance) => {
    if (!user?.uid) return;

    const userDocRef = doc(db, "Users", user.uid);

    try {
      await updateDoc(userDocRef, {
        distancia: newDistance,
      });
      console.log("Distancia actualizada en Firestore");
      refreshDistance();
    } catch (error) {
      console.error("Error al actualizar la distancia:", error);
    }
  };

  const renderSwitchButtons = () => (
    <View style={styles.switchContainer}>
      <TouchableOpacity
        style={[styles.switchButton, isEncargos && styles.switchButtonActive]}
        onPress={() => setIsEncargos(true)}
      >
        <Text
          style={[
            styles.switchButtonText,
            isEncargos && styles.switchButtonTextActive,
          ]}
        >
          Disponibles
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.switchButton, !isEncargos && styles.switchButtonActive]}
        onPress={() => setIsEncargos(false)}
      >
        <Text
          style={[
            styles.switchButtonText,
            !isEncargos && styles.switchButtonTextActive,
          ]}
        >
          Ofertas
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <AntDesign name="left" size={24} color="#43A89B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mami Match</Text>
        </View>
        <Image
          source={require("../assets/LOGO_SIMBOLO_VERDE.png")}
          style={styles.logo}
        />
      </View>

      {renderSwitchButtons()}

      <ScrollView
        style={styles.mainContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isEncargos && (
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={distance}
              onValueChange={(value) => {
                setDistance(value);
                updateDistanceInFirestore(value);
              }}
              minimumTrackTintColor="#43A89B"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#43A89B"
            />
            <Text style={styles.sliderLabel}>{distance} km</Text>
          </View>
        )}

        {isEncargos ? renderEncargosDisponibles() : renderTusOfertas()}
      </ScrollView>

      <ValoracionColaboradorModal
        visible={isValoracionColaboradorModalVisible}
        onClose={closeValoracionColaboradorModal}
        encargoId={selectedEncargoId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "normal",
  },
  mainContent: {
    backgroundColor: "#F4F4F0",
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
    flex: 1,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 6,
  },
  switchButtonActive: {
    backgroundColor: "#43A89B",
  },
  switchButtonText: {
    fontSize: 16,
    color: "#1d1d1d",
  },
  switchButtonTextActive: {
    color: "white",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 0,
    width: "90%",
    alignSelf: "center",
  },
  sliderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,  // Reduce el margen vertical para ahorrar espacio
    paddingHorizontal: 20,  // Espacio horizontal para no estar tan pegado a los bordes
  },
  sliderLabel: {
    fontSize: 16,
    color: "#1d1d1d",
    marginLeft: 10,  // Espacio entre el slider y el texto para que no estén pegados
  },
  slider: {
    flex: 1,  // El slider utiliza todo el espacio disponible excepto el que ocupa el texto
    height: 40,  // Ajusta si necesitas menos altura
  },
});

export default MamiMatchColaboradoraScreen;
