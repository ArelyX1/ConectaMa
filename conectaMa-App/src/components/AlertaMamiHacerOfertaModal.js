import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useUser } from "../context/UserContext"; // Ensure this path is correct
import { makeContraoferta } from "../services/AlertaService";
import { Alert } from "react-native";

const AlertaMamiHacerOfertaModal = ({ visible, onClose, encargoId, fechaEncargo }) => {

  const [description, setDescription] = useState("");
  const [offer, setOffer] = useState("");
  const { user } = useUser();


  const handleOffer = async () => {
    if (!offer) {
      Alert.alert('Error', 'La oferta no puede estar vacía.');
      return;
    }

    const contraoferta = {
      uidUsuario: user.uid,
      nombreUsuario: (user.nombres + " " + user.apellidos) || 'Anónimo', // O ajusta según los datos de tu usuario
      oferta: offer,
      dispositivo:user.dispositivo,
      imgURL: user.profileImage,
      description,
      estado: 'pendiente',
      fechaEncargo: fechaEncargo,
    };

    try {
      await makeContraoferta(encargoId, contraoferta);
      Alert.alert('Éxito', 'Oferta enviada correctamente.');
      onClose();
    } catch (error) {
      console.error('Error haciendo contraoferta: ', error);
      Alert.alert('Error', 'Error al agregar la oferta. Inténtalo de nuevo.');
    }
  };

  const handleOfferChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setOffer(numericValue);
  };

  const canCreateEncargo = description && offer;



  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Oferta</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>



          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Ingresa una descripción aquí"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Oferta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu oferta aquí"
              value={offer}
              onChangeText={handleOfferChange}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              !canCreateEncargo && { backgroundColor: "#ccc" },
            ]}
            disabled={!canCreateEncargo}
            onPress={handleOffer}
          >
            <Text style={styles.createButtonText}>Crear Oferta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Signika Negative",
  },
  inputGroup: {
    width: "100%",
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: "Signika Negative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    fontFamily: "Signika Negative",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  dateTimeText: {
    fontFamily: "Signika Negative",
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#43A89B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Signika Negative",
  },
});

export default AlertaMamiHacerOfertaModal;
