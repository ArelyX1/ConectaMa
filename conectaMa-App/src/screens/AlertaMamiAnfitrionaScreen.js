import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  RefreshControl
} from "react-native";
import React, { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import AlertaMamiAnfitrionaCard from "../components/AlertaMamiAnfitrionaCard";
import CrearAlertaAnfitrionaModal from "../components/CrearAlertaAnfitrionaModal";
import AlertaMamiOfertaModal from "../components/AlertaMamiOfertaModal";
import AlertaValoracionAnfitrionModal from "../components/modals/AlertaValoracionAnfitrionModal";
import {
  getAlertasByUser,
  terminarAlertaAnfitrion,
} from "../services/AlertaService";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  off
} from "firebase/database";
import { useUser } from "../context/UserContext";
import { useNavigation } from "@react-navigation/native";

const AlertaMamiAnfitrionaScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [tusAlertas, setTusAlertas] = useState([]);
  const [valoracionAnfitrionModalVisible, setValoracionAnfitrionModalVisible] =
    useState(false);
  const [selectedAlertaId, setSelectedAlertaId] = useState(null);
  const [isOfertaModalVisible, setOfertaModalVisible] = useState(false);
  const [currentOfertas, setCurrentOfertas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const alertasRef = query(
      ref(db, "alertas"),
      orderByChild("uidUsuario"),
      equalTo(user.uid)
    );
  
    const onDataChange = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTusAlertas(Object.entries(data));
        console.log(Object.entries(data));
      } else {
        setTusAlertas([]);
      }
    };
  
    onValue(alertasRef, onDataChange);

    return () => off(alertasRef, 'value', onDataChange);
  }, [user.uid]);

  useEffect(() => {
    tusAlertas.forEach(([key, alerta]) => {
      const ahora = new Date();
      if (alerta.endAnfitrion !== true && alerta.estado === 'en curso') {
        console.log("valorando anfitrion");
        setSelectedAlertaId(key);
      } else {
        if (alerta.estado === 'en curso') {
          terminarAlertaAnfitrion(key);
        }
      }
    });
  }, [tusAlertas]);

  useEffect(() => {
    if (selectedAlertaId != null) { 
      console.log(selectedAlertaId);
      setValoracionAnfitrionModalVisible(true);
    }
  }, [selectedAlertaId]);

  const fetchTusAlertas = async () => {
    const data = await getAlertasByUser(user.uid);
    setTusAlertas(Object.entries(data));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTusAlertas(); 
    setRefreshing(false);
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
    console.log(contraofertasArray);
    setCurrentOfertas(contraofertasArray);
    setOfertaModalVisible(true);
  };

  const handleCloseOfertaModal = () => {
    setOfertaModalVisible(false);
  };
  const closeValoracionAnfitrionModal = () => {
    setValoracionAnfitrionModalVisible(false);
  };

  const renderTusAlertas = () =>
    tusAlertas.map(([key, alerta]) => (
      <AlertaMamiAnfitrionaCard
        key={key}
        alertaMami={{
          status: alerta.estado,
          description: alerta.descripcion,
          date: alerta.fechaEncargo,
          price: alerta.oferta,
          chat: alerta.chat,
          user: alerta.uidUsuario
        }}
        onOpenChat={() => handleOpenChat(alerta, key)}
        onViewOffers={() => handleViewOfertas(alerta.contraofertas, key)}
      />
    ));

  const handleOpenChat = (alerta, key) => {
    // ----------------------
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

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

      <ScrollView 
        style={styles.mainContent} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTusAlertas()}
      </ScrollView>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateButtonPress}
      >
        <Text style={styles.createButtonText}>Crear Alertas</Text>
      </TouchableOpacity>

      <CrearAlertaAnfitrionaModal 
        visible={isModalVisible}
        onClose={handleCloseModal}
      />

      <AlertaMamiOfertaModal
        visible={isOfertaModalVisible}
        ofertas={currentOfertas}
        onClose={handleCloseOfertaModal}
      />
      <AlertaValoracionAnfitrionModal 
        visible={valoracionAnfitrionModalVisible} 
        onClose={closeValoracionAnfitrionModal} 
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
  createButton: {
    backgroundColor: "#43A89B",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Signika Negative",
    fontWeight: "normal",
  },
});

export default AlertaMamiAnfitrionaScreen;
