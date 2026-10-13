import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { valorarAnfitrion, terminarEncargoAnfitrion, valorarColaborador } from '../../services/EncargoService';

const ValoracionAnfitrionModal = ({ visible, onClose, encargoId }) => {
  const [valoracion, setValoracion] = useState(0);

  const handleStarPress = (index) => {
    setValoracion(index + 1);
  };
  const handleSubmit = async () => {
    try {
      await valorarColaborador(encargoId, valoracion);
      onClose();
      await terminarEncargoAnfitrion(encargoId);
    } catch (error) {
      console.error('Error valorando al colaborador: ', error);
    }
  };

  return (
<Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Valorar Colaborador:</Text>
          <View style={styles.starsContainer}>
            {[0, 1, 2, 3, 4].map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleStarPress(index)}
                style={styles.star}
              >
                <Text style={[styles.starText, valoracion > index && styles.starFilled]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 5,
  },
  starText: {
    fontSize: 30,
    color: 'gray',
  },
  starFilled: {
    color: '#FFD700', // Color dorado para estrellas llenas
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#43A89B',
  },
  cancelButton: {
    backgroundColor: 'lightgray',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ValoracionAnfitrionModal;