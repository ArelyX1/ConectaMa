import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    Alert.alert('Reset Password', `Password reset link sent to: ${email}`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
    >
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <SafeAreaView style={styles.headerTextContainer}>
                <Text style={styles.headerText}>Recuperar Contraseña</Text>
                <View style={styles.underline} />
              </SafeAreaView>
            </View>
            <View style={styles.content}>
              <SafeAreaView style={styles.imageTextContainer}>
                <Image
                  source={require('../assets/LOGO_SIMBOLO_VERDE.png')} 
                  style={styles.image}
                />
                <Text style={styles.imageText}>Ingresa tu correo para recibir el enlace de recuperación.</Text>
              </SafeAreaView>

              <View style={styles.stepContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.buttonWrapper}>
                <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                  <Text style={styles.buttonText}>Enviar enlace</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F0', 
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '100%', 
    paddingHorizontal: 10,
    marginTop: -20,  
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
    width: 328,
    backgroundColor: '#04352C', 
    alignSelf: 'flex-start',
    marginTop: 8, 
  },
  content: {
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center', 
    alignItems: 'center',
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
  buttonWrapper: {
    alignItems: 'center',
    marginTop: 390,
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
});

export default ForgotPasswordScreen;
