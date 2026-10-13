// RegisterService.js
import {  db } from '../../firebaseConfig'

import { doc, setDoc } from 'firebase/firestore';

export const registerUserData = async (nombres, apellidos, correo, direccion, pais, ciudad, user) => {
  try {
    // Guardar datos adicionales del usuario en Firestore
    await setDoc(doc(db, 'Users', user.uid), {
      nombres: nombres || '',
      apellidos: apellidos || '',
      correo: correo || '',
      direccion: direccion || '',
      pais: pais || '',
      ciudad: ciudad || '',
      dispositivos: [],
      profileImage: '',
      ubicacion: '',
      distancia: 20,
      serviciosAnfitrion: [],
      serviciosColaborador:[],
      valoracionAnfitrion: '',
      valoracionColaborador: '',
      enServicio: false,
      nroValoracionesAnfitrion:0,
      nroValoracionesColaborador:0,
    });

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};