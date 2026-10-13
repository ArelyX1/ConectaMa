import React, { useState } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { makeContraoferta } from '../../services/EncargoService';
import { useUser } from '../../context/UserContext'; // Suponiendo que tienes un contexto de autenticación

const OfertaEncargoModal = ({ visible, onClose, encargoId, fechaEncargo }) => {
  const [oferta, setOferta] = useState('');
  const { user } = useUser(); // Obtiene el usuario autenticado

  const handleOffer = async () => {
    if (!oferta) {
      Alert.alert('Error', 'La oferta no puede estar vacía.');
      return;
    }

    const contraoferta = {
      uidUsuario: user.uid,
      nombreUsuario: user.displayName || 'Anónimo', // O ajusta según los datos de tu usuario
      oferta,
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

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>Hacer una Oferta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu oferta"
          value={oferta}
          onChangeText={setOferta}
          keyboardType="numeric"
        />
        <Button title="Enviar Oferta" onPress={handleOffer} />
        <Button title="Cancelar" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default OfertaEncargoModal;
