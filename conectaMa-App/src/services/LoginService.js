import { auth, db } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const loginUser = async (email, password) => {
  try {
    // Iniciar sesión con correo y contraseña
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Obtener datos adicionales del usuario de Firestore
    const userDoc = await getDoc(doc(db, 'Users', user.uid));

    // Obtener el token de notificaciones push
    const pushToken = await registerForPushNotificationsAsync();
    console.log("Notificacion Token: ", pushToken);
    // Si el usuario tiene un documento en Firestore, actualiza el token del dispositivo
    if (userDoc.exists()) {
      console.log('Datos adicionales del usuario desde Firestore:', userDoc.data());
      
      // Actualiza el token del dispositivo en Firestore
      await setDoc(doc(db, 'Users', user.uid), { dispositivo: pushToken }, { merge: true });
      
      return { uid: user.uid, dispositivo: pushToken, ...userDoc.data() };
    } else {
      throw new Error('No se encontraron datos del usuario');
    }
  } catch (error) {
    console.error('Error en loginUser:', error);
    throw new Error(error.message);
  }
};

