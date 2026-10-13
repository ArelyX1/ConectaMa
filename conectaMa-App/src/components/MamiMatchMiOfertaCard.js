import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import MamiMatchChatModal from './MamiMatchChatModal';

const MamiMatchMiOfertaCard = ({ miOfertaObj, onClose }) => {
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  const {
    oferta,
    description,
    status,
    fechaEncargo,
  } = miOfertaObj;

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

  const formatDate = (dateString) => {
    const options = {
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", options).replace(/:00(?=\s*[AP]M)/, '');
  };

  const handleOpenChat = () => {
    setChatModalVisible(true);
  };

  const handleCloseChat = () => {
    setChatModalVisible(false);
  };

  return (
    <View style={styles.cardContainer}>
      {status === 'aceptada' && (
        <Text style={styles.acceptedLabel}>Aceptada</Text>
      )}
      <View style={styles.header}>
        <Text style={styles.userName}>{formatDate(fechaEncargo)}</Text>
      </View>
      <Text style={styles.offerDescription}>{description}</Text>
      <View style={styles.buttonContainer}>
        {renderButton()}
        <Text style={styles.offerAmount}>Tu Oferta: {oferta}</Text>
      </View>
      <MamiMatchChatModal
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
    position: 'relative',  // Ensures that the "Aceptada" label can be positioned absolutely
  },
  acceptedLabel: {
    position: 'absolute',
    top: 15,
    right: 20,
    color: '#C499E0',
    fontFamily: "Signika Negative",
    fontSize: 15,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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

export default MamiMatchMiOfertaCard;