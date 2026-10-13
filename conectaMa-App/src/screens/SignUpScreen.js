import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, Image, 
  SafeAreaView, Modal, Pressable, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { useUser } from '../context/UserContext';
import { registerUserData } from '../services/RegisterService';
import AntDesign from '@expo/vector-icons/AntDesign'; 
import countryCityData from '../utilities/countriesCities.json'; 

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    country: '',
    city: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [step, setStep] = useState(1);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  const { registerUser } = useUser();

  useEffect(() => {
    setFormData({ ...formData, city: '' });
  }, [formData.country]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (formData.nombres && formData.apellidos) {
        setStep(2);
      } else {
        alert('Por favor, completa todos los campos.');
      }
    } else if (step === 2) {
      if (formData.country && formData.city && formData.address) {
        setStep(3);
      } else {
        alert('Por favor, completa todos los campos.');
      }
    } else if (step === 3) {
      if (formData.email && formData.password && formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          alert('Las contraseñas no coinciden.');
          return;
        }
        try {
          const userAuth = await registerUser(formData.email, formData.password);
          await registerUserData(
            formData.nombres,
            formData.apellidos,
            formData.email,
            formData.address,
            formData.country,
            formData.city,
            userAuth
          );
          navigation.navigate('Login');
        } catch (error) {
          Alert.alert('Error de registro', error.message);
        } 
      } else {
        alert('Por favor, completa todos los campos.');
      }
    }
  };

  const countries = Object.keys(countryCityData);
  const cities = formData.country ? countryCityData[formData.country] : [];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
    >
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <View style={styles.header}>
                <SafeAreaView style={styles.headerTextContainer}>
                  <Text style={styles.headerText}>
                    Registrarse
                  </Text>
                  <View style={styles.underline} />
                </SafeAreaView>
                <SafeAreaView style={styles.imageTextContainer}>
                  <Image
                    source={require('../assets/LOGO_SIMBOLO_VERDE.png')} 
                    style={styles.image}
                  />
                  <Text style={styles.imageText}>
                    {step === 1 && 'Ingresa tus nombres y apellidos.'}
                    {step === 2 && 'Ingresa tu ubicación, necesitamos esta información para conectarte con nuestras colaboradoras.'}
                    {step === 3 && 'Ingresa tu correo y contraseña para crear tu cuenta.'}
                  </Text>
                </SafeAreaView>
                {step === 1 && (
                  <View style={styles.stepContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombres"
                      value={formData.nombres}
                      onChangeText={(text) => handleInputChange('nombres', text)}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Apellidos"
                      value={formData.apellidos}
                      onChangeText={(text) => handleInputChange('apellidos', text)}
                    />
                  </View>
                )}
                {step === 2 && (
                  <View style={styles.stepContainer}>
                    <TouchableOpacity style={styles.pickerWrapper} onPress={() => setShowCountryModal(true)}>
                      <TextInput
                        style={styles.pickerInput}
                        placeholder="Selecciona un país"
                        value={formData.country}
                        editable={false}
                      />
                      <AntDesign name="down" size={20} color="#04352C" style={styles.pickerIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pickerWrapper} onPress={() => setShowCityModal(true)}>
                      <TextInput
                        style={styles.pickerInput}
                        placeholder="Selecciona una ciudad"
                        value={formData.city}
                        editable={false}
                      />
                      <AntDesign name="down" size={20} color="#04352C" style={styles.pickerIcon} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.input}
                      placeholder="Dirección"
                      value={formData.address}
                      onChangeText={(text) => handleInputChange('address', text)}
                    />
                  </View>
                )}
                {step === 3 && (
                  <View style={styles.stepContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Correo electrónico"
                      value={formData.email}
                      onChangeText={(text) => handleInputChange('email', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Contraseña"
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                      secureTextEntry
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirmar contraseña"
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleInputChange('confirmPassword', text)}
                      secureTextEntry
                    />
                  </View>
                )}
              </View>
              <View style={styles.buttonWrapper}>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                  <Text style={styles.buttonText}>{step === 3 ? 'Enviar' : 'Siguiente'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <Modal
          transparent={true}
          visible={showCountryModal}
          animationType="slide"
          onRequestClose={() => setShowCountryModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={formData.country}
                onValueChange={(itemValue) => {
                  setFormData({ ...formData, country: itemValue });
                  setShowCountryModal(false);
                }}
              >
                {countries.map((country) => (
                  <Picker.Item key={country} label={country} value={country} />
                ))}
              </Picker>
              <Pressable onPress={() => setShowCountryModal(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          transparent={true}
          visible={showCityModal}
          animationType="slide"
          onRequestClose={() => setShowCityModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={formData.city}
                onValueChange={(itemValue) => {
                  setFormData({ ...formData, city: itemValue });
                  setShowCityModal(false);
                }}
              >
                {cities.map((city) => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
              <Pressable onPress={() => setShowCityModal(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F0', 
  },
  content: {
    flex: 1,
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
  },
  header: {
    alignItems: 'flex-start', 
    marginBottom: 20,
  },
  headerTextContainer: {
    marginBottom: 10,
  },
  headerText: {
    color: '#04352C',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Signika Negative', 
  },
  underline: {
    height: 2,
    width: 200, 
    backgroundColor: '#04352C', 
    alignSelf: 'flex-start', 
    marginTop: 8, 
  },
  imageTextContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: 20,
  },
  image: {
    width: 24,
    height: 35,
    marginRight: 10, 
  },
  imageText: {
    color: '#04352C', 
    fontSize: 15,
    fontFamily: 'Signika Negative', 
    fontWeight: 'bold',
  },
  stepContainer: {
    marginBottom: 20, 
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontFamily: 'Signika Negative', 
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  pickerInput: {
    flex: 1,
    fontFamily: 'Signika Negative',
    color: '#04352C',
    padding: 0,
  },
  pickerIcon: {
    marginLeft: 10,
  },
  buttonWrapper: {
    alignItems: 'center', 
    paddingBottom: 20, 
  },
  button: {
    backgroundColor: '#04352C',
    padding: 15,
    borderRadius: 10,
    width: 185,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Signika Negative', 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    padding: 20,
  },
  modalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#04352C',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
