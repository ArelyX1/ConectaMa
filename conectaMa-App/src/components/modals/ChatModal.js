import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sendMessage } from '../../services/ChatService';
import { ref, onValue } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { useUser } from '../../context/UserContext';

const ChatModal = ({ visible, onClose, chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const db = getDatabase();
  const { user } = useUser();
  const flatListRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      const chatRef = ref(db, `chats/${chatId}/messages`);
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const fetchedMessages = snapshot.val();
        const messagesArray = Object.entries(fetchedMessages || {}).map(([id, message]) => ({
          id,
          ...message
        }));
        console.log(messagesArray);
        setMessages(messagesArray);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    }
  }, [chatId]);

  useEffect(() => {
    // Scroll to the end of the list when messages change
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await sendMessage(chatId, newMessage);
      setNewMessage('');
    }
  };

  const renderChatMessages = () => (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={[
            styles.messageItem,
            item.senderId === user.uid ? styles.sentMessage : styles.receivedMessage
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.senderId === user.uid ? styles.sentMessageText : styles.receivedMessageText
            ]}
          >
            {item.text}
          </Text>
        </View>
      )}
    />
  );

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} onBackButtonPress={onClose}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        {renderChatMessages()}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Icon name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    maxHeight: "80%",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    alignItems: 'flex-end',
  },
  messageItem: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
    maxWidth: '75%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0084ff',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessageText: {
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
});

export default ChatModal;
