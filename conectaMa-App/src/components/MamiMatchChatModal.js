import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { sendMessage } from '../services/ChatService'; // Importa la función de envío de mensajes
import { ref, onValue } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { useUser } from '../context/UserContext'; // Importa el contexto del usuario

const MamiMatchChatModal = ({ visible, onClose, chatId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const db = getDatabase(); // Obtiene la instancia de la base de datos
  const { user } = useUser(); // Obtiene los datos del usuario actual
  const flatListRef = useRef(null);

  useEffect(() => {
    // Escucha los cambios en los mensajes del chat en tiempo real

    if (chatId) {
      const chatRef = ref(db, `chats/${chatId}/messages`);
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const fetchedMessages = snapshot.val();
        const messagesArray = Object.entries(fetchedMessages || {}).map(([id, message]) => ({
          id,
          ...message
        }));
        setMessages(messagesArray);
      });

      // Limpia el listener al desmontar el componente
      return () => unsubscribe();
    }
  }, [chatId]);

  useEffect(() => {
    // Desplaza al final de la lista cuando los mensajes cambian
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      // Envía el mensaje utilizando la función de ChatService
      await sendMessage(chatId, inputMessage);
      setInputMessage('');
      Keyboard.dismiss(); // Oculta el teclado después de enviar un mensaje
    }
  };
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === user.uid ? styles.myMessage : styles.otherMessage
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{formatTimestamp(item.timestamp)}</Text>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chat</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.messageList}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje aquí"
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <AntDesign name="arrowright" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    height: '80%',
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Signika Negative',
  },
  messageList: {
    flex: 1,
    marginBottom: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: '70%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#43A89B',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#C499E0',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Signika Negative',
  },
  messageTime: {
    fontSize: 10,
    color: '#777',
    textAlign: 'right',
    fontFamily: 'Signika Negative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: 'Signika Negative',
  },
  sendButton: {
    backgroundColor: '#43A89B',
    padding: 10,
    borderRadius: 50,
  },
});

export default MamiMatchChatModal;
