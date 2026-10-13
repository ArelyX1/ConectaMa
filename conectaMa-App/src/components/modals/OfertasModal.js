import React from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import Modal from 'react-native-modal';
import { acceptContraoferta } from '../../services/EncargoService'; // Importar la función

const OfertasModal = ({ visible, onClose, contraofertas, encargoId }) => {
  const handleAccept = async (contraofertaId) => {
    try {
        console.log(encargoId, contraofertaId);
      await acceptContraoferta(encargoId, contraofertaId);
      onClose(); // Cerrar el modal después de aceptar
    } catch (error) {
      console.error("Error aceptando contraoferta: ", error);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text>Usuario: {item.nombreUsuario}</Text>
        <Text>Oferta: {item.oferta}</Text>
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item.id)}>
          <Text style={styles.acceptButtonText}>Aceptar</Text>
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} onBackButtonPress={onClose}>
      <View style={styles.modalContent}>
        <Button title="Cerrar" onPress={onClose} />
        <FlatList
          data={contraofertas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  card: {
    marginBottom: 10,
  },
  acceptButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 5,
  },
  acceptButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default OfertasModal;
