// Importamos axios para hacer peticiones HTTP
import axios from 'axios';

// URL del servidor de notificaciones push de Expo
const PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

/**
 * Envía una notificación push a un dispositivo específico.
 * @param {string} token - Token del dispositivo al que se enviará la notificación.
 * @param {string} title - Título de la notificación.
 * @param {string} message - Mensaje de la notificación.
 */
async function sendPushNotification(token, title, message) {
  console.log(token);
  const notification = {
    to: token,
    sound: 'default', // Use "default" para el sonido por defecto o null para sin sonido.
    title: title,
    body: message,
    data: { message }, // Datos adicionales que desees enviar con la notificación.
    _displayInForeground: true, // Indica si la notificación debe mostrarse cuando la app está en primer plano.
  };

  try {
    // Realiza la petición POST al servidor de Expo
    const response = await axios.post(PUSH_ENDPOINT, notification, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    console.log('Notificación enviada con éxito:', response.data);
  } catch (error) {
    console.error('Error al enviar la notificación push:', error);
  }
}

export default sendPushNotification;