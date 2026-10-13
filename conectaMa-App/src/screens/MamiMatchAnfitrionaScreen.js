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
import MamiMatchAnfitrionaCard from "../components/MamiMatchAnfitrionaCard";
import CrearEncargoAnfitrionaModal from "../components/CrearEncargoAnfitrionaModal";
import MamiMatchOfertaModal from "../components/MamiMatchOfertaModal";
import ValoracionAnfitrionModal from "../components/modals/ValoracionAnfitrionModal";
import {
  getEncargosByUser,
  terminarEncargoAnfitrion,
} from "../services/EncargoService";
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

const MamiMatchAnfitrionaScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [tusEncargos, setTusEncargos] = useState([]);
  const [valoracionAnfitrionModalVisible, setValoracionAnfitrionModalVisible] =
    useState(false);
  const [selectedEncargoId, setSelectedEncargoId] = useState(null);
  const [isOfertaModalVisible, setOfertaModalVisible] = useState(false);
  const [currentOfertas, setCurrentOfertas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const encargosRef = query(
      ref(db, "encargos"),
      orderByChild("uidUsuario"),
      equalTo(user.uid)
    );
  
    const onDataChange = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTusEncargos(Object.entries(data));
      } else {
        setTusEncargos([]);
      }
    };
  
    onValue(encargosRef, onDataChange);
  
    return () => off(encargosRef, 'value', onDataChange);
  }, [user.uid]);

  useEffect(() => {
    tusEncargos.forEach(([key, encargo]) => {
      const fechaEncargo = new Date(encargo.fechaEncargo);
      const ahora = new Date();
      if (fechaEncargo <= ahora) {
        if (encargo.endAnfitrion !== true && encargo.estado === 'en curso') {
          console.log("valorando anfitrion");
          setSelectedEncargoId(key);
          setValoracionAnfitrionModalVisible(true);
        } else {
          if(encargo.estado === 'en curso'){
            terminarEncargoAnfitrion(key);
          }

        }
      }
    });
  }, [tusEncargos]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTusEncargos(); 
    setRefreshing(false); 
  };

  const fetchTusEncargos = async () => {
    const data = await getEncargosByUser(user.uid);
    setTusEncargos(Object.entries(data));
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

  const renderTusEncargos = () =>
    tusEncargos.map(([key, encargo]) => (
      <MamiMatchAnfitrionaCard
        key={key}
        mamiMatch={{
          status: encargo.estado,
          date: encargo.fechaEncargo,
          description: encargo.descripcion,
          price: encargo.oferta,
          chat: encargo.chat,
          user:encargo.uidUsuario
        }}
        onOpenChat={() => handleOpenChat(encargo, key)}
        onViewOffers={() => handleViewOfertas(encargo.contraofertas, key)}
      />
    ));

  const handleOpenChat = (encargo, key) => {
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
          <Text style={styles.headerTitle}>Mami Match</Text>
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
        {renderTusEncargos()}
      </ScrollView>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateButtonPress}
      >
        <Text style={styles.createButtonText}>Crear Encargo</Text>
      </TouchableOpacity>

      <CrearEncargoAnfitrionaModal
        visible={isModalVisible}
        onClose={handleCloseModal}
      />

      <MamiMatchOfertaModal
        visible={isOfertaModalVisible}
        ofertas={currentOfertas}
        onClose={handleCloseOfertaModal}
      />
            <ValoracionAnfitrionModal visible={valoracionAnfitrionModalVisible} onClose={closeValoracionAnfitrionModal} encargoId={selectedEncargoId} />
      
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

export default MamiMatchAnfitrionaScreen;
