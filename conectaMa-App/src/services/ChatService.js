import { getDatabase, ref, set, push, update, get, child, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import sendPushNotification from './PushNotificationService';


// Inicializa la referencia a la base de datos
const db = getDatabase();
const auth = getAuth();

// Función para crear un nuevo chat
export const createChat = async (
  encargoId,
  contraofertaId,
  dispositivoAnfitrion,
  dispositivoColaborador,
  uidAnfitrion,
  uidColaborador
) => {
  try {
    const chatRef = ref(db, 'chats');
    const newChatRef = push(chatRef);
    const chatId = newChatRef.key;
    const chatData = {
      encargoId,
      contraofertaId,
      dispositivoAnfitrion,
      dispositivoColaborador,
      uidAnfitrion,
      uidColaborador,
      messages: {},
    };

    await set(newChatRef, chatData);
    console.log('Chat creado con ID:', chatId);
    return chatId;
  } catch (error) {
    console.error('Error creando chat: ', error);
    throw error;
  }
};

export const sendMessage = async (chatId, text) => {
  try {
    const userId = auth.currentUser.uid;
    const messageRef = ref(db, `chats/${chatId}/messages`);
    const newMessageRef = push(messageRef);
    const timestamp = Date.now();
    const messageData = {
      senderId: userId,
      text,
      timestamp,
    };

    await set(newMessageRef, messageData);
    console.log('Mensaje enviado correctamente');

    // Obtener los datos del chat
    const chatRef = ref(db, `chats/${chatId}`);
    const chatSnapshot = await get(chatRef);
    const chatData = chatSnapshot.val();

    // Determinar el receptor y su token de dispositivo
    let recipientToken;
    let recipientUid;
    if (userId === chatData.uidAnfitrion) {
      recipientToken = chatData.dispositivoColaborador;
      recipientUid = chatData.uidColaborador;
    } else if (userId === chatData.uidColaborador) {
      recipientToken = chatData.dispositivoAnfitrion;
      recipientUid = chatData.uidAnfitrion;
    } else {
      console.error('El usuario no forma parte de este chat.');
      return;
    }

    // Enviar notificación push al receptor
    const title = 'Nuevo Mensaje';
    const message = text; // Puedes personalizar el mensaje
    await sendPushNotification(recipientToken, title, message);
  } catch (error) {
    console.error('Error enviando mensaje: ', error);
    throw error;
  }
};

// Función para obtener todos los mensajes de un chat
export const getChatMessages = async (chatId) => {
  try {
    const chatRef = ref(db, `chats/${chatId}/messages`);
    const snapshot = await get(chatRef);
    return snapshot.val();
  } catch (error) {
    console.error('Error obteniendo mensajes del chat: ', error);
    throw error;
  }
};

// Función para obtener un chat por encargoId y contraofertaId
export const getChatByEncargoAndContraoferta = async (encargoId, contraofertaId) => {
  try {
    const chatRef = ref(db, 'chats');
    const snapshot = await get(chatRef);
    const chats = snapshot.val();
    
    for (const chatId in chats) {
      if (chats[chatId].encargoId === encargoId && chats[chatId].contraofertaId === contraofertaId) {
        return { chatId, ...chats[chatId] };
      }
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo chat: ', error);
    throw error;
  }
};

// Función para actualizar el chatId en el encargo
export const updateEncargoWithChatId = async (encargoId, chatId) => {
  try {
    const encargoRef = ref(db, `encargos/${encargoId}`);
    await update(encargoRef, { chat: chatId });
  } catch (error) {
    console.error('Error actualizando encargo con chatId: ', error);
    throw error;
  }
};
const eliminarDato = (reference) => {
  return new Promise((resolve, reject) => {
    remove(ref(db, reference))
      .then(() => {
        console.log('Dato eliminado correctamente');
        resolve();
      })
      .catch((error) => {
        console.error('Error al eliminar el dato:', error);
        reject(error);
      });
  });
};

// Función para eliminar un chat
export const deleteChat = async (chatId) => {
  try {
    await eliminarDato(`chats/${chatId}`);
    console.log(`Chat ${chatId} eliminado correctamente`);
  } catch (error) {
    console.error('Error eliminando chat:', error);
    throw error;
  }
};


export default {
  createChat,
  sendMessage,
  getChatMessages,
  getChatByEncargoAndContraoferta,
  updateEncargoWithChatId,
  deleteChat,
};
