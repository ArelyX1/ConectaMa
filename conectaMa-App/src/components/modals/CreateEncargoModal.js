import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEncargo } from '../../services/EncargoService'; // Asegúrate de que la ruta es correcta
import { useUser } from '../../context/UserContext';

const CreateEncargoModal = ({ isVisible, onClose }) => {
  const [fechaEncargo, setFechaEncargo] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [oferta, setOferta] = useState('');
  const { user } = useUser();

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaEncargo;
    setShowDatePicker(false);
    setFechaEncargo(currentDate);
  };

  const handleCreateEncargo = async () => {
    const encargo = {
      uidUsuario: user.uid,
      ubicacion: '', // Aquí puedes agregar la lógica para obtener la ubicación
      estado: 'pendiente',
      dispositivos: '', // Aquí puedes agregar la lógica para obtener los dispositivos
      fechaEncargo: fechaEncargo.toISOString(),
      nombreUsuario: user.nombre + user.apellidos,
      imgUrlUsuario: user.photoURL || '',
      descripcion,
      oferta,
      contraofertas: {}
    };
    console.log(encargo);
    await createEncargo(encargo);
    onClose();
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Crear Nuevo Encargo</Text>
        
        <Text>Fecha y Hora del Encargo:</Text>
        <View>
          <Button onPress={() => setShowDatePicker(true)} title="Seleccionar Fecha y Hora" />
          {showDatePicker && (
            <DateTimePicker
              value={fechaEncargo}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <Text>Descripción:</Text>
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text>Oferta:</Text>
        <TextInput
          style={styles.input}
          placeholder="Oferta"
          value={oferta}
          onChangeText={setOferta}
          keyboardType="numeric"
        />

        <Button title="Crear Encargo" onPress={handleCreateEncargo} />
        <Button title="Cancelar" onPress={onClose} color="red" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5
  }
});

export default CreateEncargoModal;
