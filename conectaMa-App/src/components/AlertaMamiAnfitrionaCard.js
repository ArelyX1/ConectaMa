import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AlertaMamiOfertaModal from "./AlertaMamiOfertaModal";
import AlertaMamiChatModal from "./AlertaMamiChatModal";

const AlertaMamiAnfitrionaCard = ({ alertaMami, onViewOffers }) => {
  if (!alertaMami) {
    return <Text></Text>;
  }

  const {
    status = "pendiente",
    date,
    description = "",
    price = "N/A",
  } = alertaMami;
  console.log(alertaMami);
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return "#43A89B";
      case "en curso":
        return "#C499E0";
      default:
        return "#43A89B";
    }
  };

  const getCardStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return styles.cardContainerPending;
      case "en curso":
        return styles.cardContainerInProgress;
      default:
        return styles.cardContainerPending;
    }
  };
  const formatDate = (dateString) => {
    const options = {
      hour: '2-digit', // Hora
      minute: '2-digit', // Minutos
      hour12: true // Usar formato de 12 horas
    };
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", options); // Devuelve solo la hora y minutos
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const [isChatModalVisible, setChatModalVisible] = useState(false);

  const handleViewOffers = () => {
    onViewOffers();
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleOpenChat = () => {
    setChatModalVisible(true);
  };

  const handleCloseChat = () => {
    setChatModalVisible(false);
  };

  return (
    <View style={getCardStyle(status)}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>Hoy, {formatDate(date)}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
      <Text style={styles.descriptionText}>{description}</Text>
      <View style={styles.buttonContainer}>
        {status.toLowerCase() === "pendiente" ? (
          <>
            <TouchableOpacity
              style={styles.offerButton}
              onPress={handleViewOffers}
            >
              <Text style={styles.offerButtonText}>Ver ofertas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
            <Text style={styles.chatButtonText}>Iniciar Chat</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.priceText}>{price}</Text>
      </View>
      <AlertaMamiOfertaModal
        visible={isModalVisible}
        onClose={handleCloseModal}
      />
      <AlertaMamiChatModal
        visible={isChatModalVisible}
        onClose={handleCloseChat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainerPending: {
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
  cardContainerInProgress: {
    backgroundColor: "#F6F6F6",
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
  dateText: {
    fontSize: 16,
    fontFamily: 'Signika Negative',
    fontWeight: 'bold',
},
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    fontFamily: "Signika Negative",
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: "Signika Negative",
    color: "#777",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offerButton: {
    backgroundColor: "#04352C",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  offerButtonText: {
    color: "#fff",
    fontFamily: "Signika Negative",
    fontWeight: "bold",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#B7EAE0",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 15,
  },
  deleteButtonText: {
    color: "#04352C",
    fontFamily: "Signika Negative",
    fontWeight: "bold",
    fontSize: 14,
  },
  chatButton: {
    backgroundColor: "#04352C",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  chatButtonText: {
    color: "#fff",
    fontFamily: "Signika Negative",
    fontWeight: "bold",
    fontSize: 14,
  },
  priceText: {
    fontSize: 16,
    fontFamily: "Signika Negative",
    fontWeight: "bold",
    marginLeft: 30,
  },
});

export default AlertaMamiAnfitrionaCard;
