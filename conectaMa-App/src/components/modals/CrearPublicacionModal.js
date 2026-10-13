import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';  // Importamos Ionicons
import { useUser } from '../../context/UserContext';
import { uploadImageAndGetURL, createPublicacion } from '../../services/FeedService';

const CrearPublicacionModal = ({ isVisible, onClose }) => {
  const { user } = useUser();
  const [descripcion, setDescripcion] = useState('');
  const [contacto, setContacto] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const handleSeleccionarImagen = async () => {
    let permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permiso.granted === false) {
      Alert.alert("Permiso necesario", "Necesitamos permiso para acceder a tus fotos.");
      return;
    }

    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Calidad reducida para subidas más rápidas
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  };

  const handleCrearPublicacion = async () => {
    if (!descripcion || !contacto || !precio || !imagen) {
      Alert.alert("Campos incompletos", "Por favor, completa todos los campos y selecciona una imagen.");
      return;
    }

    setSubiendo(true);
    try {
      const imagenUrl = await uploadImageAndGetURL(imagen);
      const publicacionData = {
        uidUsuario: user.uid,
        nombreUsuario: user.nombres + ' ' + user.apellidos,
        imgUrlUsuario: user.profileImage || '',
        descripcion,
        contacto,
        precio,
        imagenUrl,
        estado: true,
        reportes: [],
      };
      await createPublicacion(publicacionData);
      Alert.alert("¡Éxito!", "Tu publicación ha sido creada.");
      resetAndClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la publicación. Intenta de nuevo.");
      console.error(error);
    } finally {
      setSubiendo(false);
    }
  };

  const resetAndClose = () => {
    setDescripcion('');
    setContacto('');
    setPrecio('');
    setImagen(null);
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={resetAndClose}
      avoidKeyboard={Platform.OS === 'ios'}
      style={styles.modal}
    >
      <View style={styles.modalContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Crear Nueva Publicación</Text>

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Ej: Ropa para bebé casi nueva..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Contacto</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 987654321 (WhatsApp)"
            value={contacto}
            onChangeText={setContacto}
          />

          <Text style={styles.label}>Precio</Text>
          <TextInput
            style={styles.input}
            placeholder="S/ 50.00"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Imagen</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handleSeleccionarImagen}>
            {imagen ? (
              <Image source={{ uri: imagen }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={40} color="#888" />
                <Text style={styles.imagePlaceholderText}>Tocar para seleccionar</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCrearPublicacion}
            disabled={subiendo}
          >
            {subiendo ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Publicar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={resetAndClose}>
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  imagePicker: {
    width: '100%',
    height: 150,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#888',
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  primaryButton: {
    backgroundColor: '#43A89B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrearPublicacionModal;