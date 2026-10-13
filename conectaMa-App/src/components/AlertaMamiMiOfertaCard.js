import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React, { useState } from "react";
import AlertaMamiChatModal from "./AlertaMamiChatModal";

const AlertaMamiMiOfertaCard = ({ miOfertaObj, onClose }) => {
  // Desestructuramos los datos de la oferta
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  console.log("Mi oferta Obj",miOfertaObj);
  const {
    nombreUsuario,
    oferta,
    description,
    status,
    fechaEncargo,
  } = miOfertaObj;
  const formatDate = (dateString) => {
    const options = {
      hour: '2-digit', // Hora
      minute: '2-digit', // Minutos
      hour12: true // Usar formato de 12 horas
    };
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", options); // Devuelve solo la hora y minutos
  };

  const renderButton = () => {
    switch (status) {
      case "pendiente":
        return <Text style={styles.pendingText}>Pendiente</Text>;
      case "aceptada":
        return (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleOpenChat}
          >
            <Text style={styles.acceptButtonText}>Iniciar chat</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const handleOpenChat = () => {
    setChatModalVisible(true);
  };

  const handleCloseChat = () => {
    setChatModalVisible(false);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{formatDate(fechaEncargo)}</Text>
        </View>
      </View>
      <Text style={styles.offerDescription}>{description}</Text>
      <View style={styles.buttonContainer}>
        {renderButton()}
        <Text style={styles.offerAmount}>Tu Oferta: {oferta}</Text>
      </View>
      <AlertaMamiChatModal
        visible={isChatModalVisible}
        chatId={miOfertaObj.chat}
        onClose={handleCloseChat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flexDirection: "column",
  },
  userName: {
    fontSize: 16,
    fontFamily: "Signika Negative",
    fontWeight: "bold",
    color: "#43A89B",
  },
  offerAmount: {
    fontSize: 15,
    fontFamily: "Signika Negative",
    color: "#04352C",
  },
  offerDescription: {
    fontSize: 14,
    fontFamily: "Signika Negative",
    color: "#04352C",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rejectButton: {
    backgroundColor: "#B7EAE0",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  rejectButtonText: {
    color: "#04352C",
    fontFamily: "Signika Negative",
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: "#04352C",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  acceptButtonText: {
    color: "#fff",
    fontFamily: "Signika Negative",
    fontSize: 14,
  },
  pendingText: {
    color: "#04352C",
    fontFamily: "Signika Negative",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default AlertaMamiMiOfertaCard;
