import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { createAlerta } from "../services/AlertaService"; 
import { useUser } from "../context/UserContext"; 
import * as Location from 'expo-location'; 


const CrearAlertaAnfitrionaModal = ({ visible, onClose }) => {
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [offer, setOffer] = useState("");
  const { user } = useUser();

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitas permitir el acceso a la ubicación para crear un encargo');
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude
    });
  };

  // Maneja la selección de la hora y combina con la fecha actual
  const handleConfirmTime = (time) => {
    setSelectedTime(time);
    hideTimePicker();
  };

  const handleOfferChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setOffer(numericValue);
  };

  const canCreateEncargo = selectedTime && description && offer;

  const handleCreateEncargo = async () => {
    if (!canCreateEncargo) return;

    await requestLocationPermission();
    if (!location) return; // Re-check after permission

    // Obtener la fecha de hoy
    const today = new Date();
    
    // Combinar la fecha de hoy con la hora seleccionada por el usuario
    const combinedDateTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    const encargo = {
      uidUsuario: user.uid,
      ubicacion: location, 
      estado: "pendiente",
      dispositivo: user.dispositivo ||"", 
      fechaEncargo: combinedDateTime.toISOString(), // Fecha y hora combinadas
      nombreUsuario: `${user.nombres} ${user.apellidos}`,
      imgUrlUsuario: user.photoURL || "",
      descripcion: description,
      oferta: offer,
      contraofertas: {},
    };

    try {
      console.log(encargo);
      await createAlerta(encargo);
      onClose();
    } catch (error) {
      console.error("Error al crear el encargo:", error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Alerta</Text>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hora</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={showTimePicker}
              >
                <Text style={styles.dateTimeText}>Seleccionar Hora</Text>
              </TouchableOpacity>

              {/* Mostrar la hora seleccionada */}
              {selectedTime && (
                <Text style={styles.selectedTimeText}>
                  Hora seleccionada: {selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
            </View>

            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={handleConfirmTime}
              onCancel={hideTimePicker}
              is24Hour={false} // Cambia a true si prefieres formato 24 horas
            />

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
              style={[styles.createButton, !canCreateEncargo && { backgroundColor: "#ccc" }]}
              disabled={!canCreateEncargo}
              onPress={handleCreateEncargo}
            >
              <Text style={styles.createButtonText}>Crear Alerta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
  selectedTimeText: {
    fontSize: 16,
    fontFamily: "Signika Negative",
    marginTop: 10,
    color: "#43A89B",
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
    textAlign: "center",
  },
});

export default CrearAlertaAnfitrionaModal;
