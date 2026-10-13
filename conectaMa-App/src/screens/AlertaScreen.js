// AlertaScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const AlertaScreen = () => {
  const [alertas, setAlertas] = useState([]);
  const [nuevaAlerta, setNuevaAlerta] = useState('');

  const enviarAlerta = () => {
    if (nuevaAlerta.trim() !== '') {
      setAlertas([...alertas, { id: Date.now(), texto: nuevaAlerta, esUsuario: true }]);
      setNuevaAlerta('');
      // Simular una respuesta del sistema
      setTimeout(() => {
        setAlertas(prevAlertas => [...prevAlertas, { id: Date.now(), texto: "Alerta recibida. Procesando...", esUsuario: false }]);
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alertas Chat</Text>
      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.alerta, item.esUsuario ? styles.usuario : styles.sistema]}>
            <Text>{item.texto}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={nuevaAlerta}
          onChangeText={setNuevaAlerta}
          placeholder="Escribe una alerta..."
        />
        <TouchableOpacity style={styles.button} onPress={enviarAlerta}>
          <Text style={styles.buttonText}>Enviar Alerta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alerta: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  usuario: {
    backgroundColor: '#e6f2ff',
    alignSelf: 'flex-end',
  },
  sistema: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
  },
});

export default AlertaScreen;