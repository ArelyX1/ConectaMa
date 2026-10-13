// ProfileService.js

import { db } from '../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';



// Función para actualizar los datos del usuario
export const updateProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
  } catch (error) {
    throw new Error('Error updating profile: ' + error.message);
  }
};

// Función para obtener los datos del usuario
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    throw new Error('Error fetching profile: ' + error.message);
  }
  
};
export const cambiarRol = async (userId, nuevoEstado) => {
  try {
    const userRef = doc(db, `Users/${userId}`);
    await updateDoc(userRef, {
      enServicio: nuevoEstado
    });
    return true;
  } catch (error) {
    console.error('Error al cambiar el rol:', error);
    throw error;
  }
};