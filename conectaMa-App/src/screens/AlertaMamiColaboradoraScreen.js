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
import AlertaValoracionColaboradorModal from "../components/modals/AlertaValoracionColaboradorModal";
import { endAlertaColaborador } from "../services/AlertaService";
import { getDatabase, ref, get, off, onValue } from "firebase/database";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider"; 
import AlertaMamiMiOfertaCard from "../components/AlertaMamiMiOfertaCard";
import AlertaMamiColaboradoraCard from "../components/AlertaMamiColaboradoraCard";
import * as Location from 'expo-location'; 


const AlertaMamiColaboradoraScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [Alertas, setAlertas] = useState([]);
  const [filteredAlertas, setFilteredAlertas] = useState([]); 
  const [tusOfertas, setTusOfertas] = useState({});
  const [selectedAlertaId, setSelectedAlertaId] = useState(null);
  const [isOfertaModalVisible, setOfertaModalVisible] = useState(false);
  const [currentOfertas, setCurrentOfertas] = useState([]);
  const { user, refreshDistance } = useUser();
  const navigation = useNavigation();
  const [isAlerta, setIsAlerta] = useState(true);
  const [isValoracionColaboradorModalVisible, setValoracionColaboradorModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [distance, setDistance] = useState(user.distancia); 
  const [userLocation, setUserLocation] = useState(null); 
  const db = getFirestore();

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permiso de localización denegado');
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error al obtener la ubicación', error);
      }
    };

    getUserLocation();
  }, []);

  const fetchAlertas = () => {
    const db = getDatabase();
    const alertasRef = ref(db, "alertas");
  
    onValue(alertasRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const alertasConId = Object.entries(data).filter(([id, value]) => value.uidUsuario !== user.uid)
          .map(([id, value]) => ({
            alertaId: id,
            ...value,
          }));
        console.log("Alertas filtradas (excluyendo propias):", alertasConId);
        setAlertas(alertasConId);
        filterAlertasByDistance(alertasConId, distance);
      } else {
        console.log("No hay alertas disponibles.");
        setAlertas([]);
      }
    }, {
      onlyOnce: false
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlertas(); 
    setRefreshing(false);
  };
  useEffect(() => {
    Object.entries(tusOfertas).forEach(([key, oferta]) => {
      const fechaEncargo = new Date(oferta.fechaEncargo);
      const ahora = new Date();
      if (fechaEncargo <= ahora) {
        if(oferta.endColaborador !== true && oferta.estado === "aceptada") {
          console.log("valorando colaborador");
          setSelectedAlertaId(oferta.alertaId);
        } else {
          if(oferta.estado === "aceptada"){
            endAlertaColaborador(oferta.alertaId);
          }
        }
      }
    });
  }, [tusOfertas]);
  useEffect(() => {
    if (selectedAlertaId != null) { // Asegúrate de que el ID no sea null
      setValoracionColaboradorModalVisible(true);

    }
  }, [selectedAlertaId]);

  const fetchContraofertasByUser = async () => {
    const db = getDatabase();
    const alertasRef = ref(db, "alertas");

    try {
      const snapshot = await get(alertasRef);
      const alertas = snapshot.val() || {};
      const userOffers = {};

      for (const alertaId in alertas) {
        if (alertas[alertaId].contraofertas) {
          for (const contraofertaId in alertas[alertaId].contraofertas) {
            if (
              alertas[alertaId].contraofertas[contraofertaId].uidUsuario ===
              user.uid
            ) {
              userOffers[contraofertaId] = {
                ...alertas[alertaId].contraofertas[contraofertaId],
                alertaId: alertaId,
              };
            }
          }
        }
      }
      console.log("Contraofertas del usuario ",userOffers);
      setTusOfertas(userOffers);
    } catch (error) {
      console.error("Error al obtener las contraofertas:", error);
    }
  };

  useEffect(() => {
    fetchAlertas();
    fetchContraofertasByUser();
    return () => {
      const db = getDatabase();
      const alertasRef = ref(db, "alertas");
      off(alertasRef); // Desconectar el listener cuando el componente se desmonte
    };
  }, [user.uid]);
  useEffect(() => {
    if (userLocation && Alertas.length > 0) {
      filterAlertasByDistance(Alertas, distance);
    }
  }, [userLocation]);
  useEffect(() => {
    filterAlertasByDistance(Alertas, distance);
  }, [Alertas, distance, userLocation]);

  const filterAlertasByDistance = (alertas, maxDistance) => {
    if (!userLocation) return; 

    const filtered = alertas.filter((alerta) => {
      if (!alerta.ubicacion) return false;  
      const { latitude, longitude } = alerta.ubicacion;
      const distanceToAlerta = getDistanceFromLatLonInKm(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude
      );
      return distanceToAlerta <= maxDistance;
    });
    setFilteredAlertas(filtered);  
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
          <AlertaMamiMiOfertaCard
            key={id}
            miOfertaObj={{
              status: oferta.estado,
              description: oferta.descripcion,
              oferta: oferta.oferta,
              chat: oferta.chat,
              user: oferta.uidUsuario,
              fechaEncargo: oferta.fechaEncargo,
              nombreUsuario: oferta.nombreUsuario,
              alertaId: oferta.alertaId,
            }}
            onOpenChat={() => handleOpenChat(oferta, id)}
            onViewOffers={() => handleViewOfertas(oferta.contraofertas, id)}
          />
        ));

  const renderAlertasDisponibles = () =>
    filteredAlertas.map((alerta) => (
      <AlertaMamiColaboradoraCard
        key={alerta.alertaId}
        mamiMatch={{
          status: alerta.estado,
          description: alerta.descripcion,
          dispositivo: alerta.dispositivo,
          price: alerta.oferta,
          chat: alerta.chat,
          user: alerta.uidUsuario,
          alertaId: alerta.alertaId,
          date: alerta.fechaEncargo,
        }}
        onOpenChat={() => handleOpenChat(alerta, alerta.alertaId)}
        onViewOffers={() => handleViewOfertas(alerta.contraofertas, alerta.alertaId)}
      />
    ));

  const handleOpenChat = (oferta, key) => {
    // Maneja la apertura del chat aquí.
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
    } catch (error) {
      console.error("Error al actualizar la distancia:", error);
    }
  };

  const renderSwitchButtons = () => (
    <View style={styles.switchContainer}>
      <TouchableOpacity
        style={[styles.switchButton, isAlerta && styles.switchButtonActive]}
        onPress={() => setIsAlerta(true)}
      >
        <Text
          style={[
            styles.switchButtonText,
            isAlerta && styles.switchButtonTextActive,
          ]}
        >
          Disponibles
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.switchButton, !isAlerta && styles.switchButtonActive]}
        onPress={() => setIsAlerta(false)}
      >
        <Text
          style={[
            styles.switchButtonText,
            !isAlerta && styles.switchButtonTextActive,
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
          <Text style={styles.headerTitle}>Alerta Mami</Text>
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
        {isAlerta && (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Distancia: {distance} km</Text>
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
          </View>
        )}

        {isAlerta ? renderAlertasDisponibles() : renderTusOfertas()}
      </ScrollView>

      <AlertaValoracionColaboradorModal
        visible={isValoracionColaboradorModalVisible}
        onClose={closeValoracionColaboradorModal}
        encargoId={selectedAlertaId}
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
    marginVertical: 20,
    marginHorizontal: 30,
    alignItems: "center",
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#1d1d1d",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

export default AlertaMamiColaboradoraScreen;
