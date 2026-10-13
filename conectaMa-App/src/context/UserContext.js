import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../../firebaseConfig';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as Device from 'expo-device'; // Importar Device

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Configurando onAuthStateChanged');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('onAuthStateChanged llamado', firebaseUser);
      if (firebaseUser) {
        console.log('Intentando obtener datos del usuario', firebaseUser.uid);
        try {
          const userData = await getUserData(firebaseUser.uid);
          console.log('Datos del usuario obtenidos', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error al obtener datos del usuario', error);
        }
      } else {
        console.log("Usuario desconectado");
        setUser(null);
      }
    });
    return () => {
      console.log('Limpiando onAuthStateChanged');
      unsubscribe();
    };
  }, []);

  const getUserData = async (uid) => {
    const userDoc = await getDoc(doc(db, 'Users', uid));
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() };
    }
    return null;
  };

  const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const pushToken = await registerForPushNotificationsAsync(); // Obtener token
      const location = await getCurrentLocation(); // Obtener ubicación

      if (pushToken || location) { // Solo guarda si existe un token o ubicación
        await setDoc(doc(db, 'Users', userCredential.user.uid), { 
          dispositivo: pushToken || null,
          ubicacion: location || null
        }, { merge: true });
      }
      const userData = await getUserData(userCredential.user.uid);
      setUser({ ...userData, dispositivo: pushToken, ubicacion: location });
      return { ...userData, dispositivo: pushToken, ubicacion: location };
    } catch (error) {
      console.error('Error en loginUser:', error);
      throw error;
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permiso de localización denegado');
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      return { latitude, longitude };
    } catch (error) {
      console.error('Error al obtener la ubicación', error);
      return null;
    }
  };

  const registerUser = async (email, password, additionalData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const pushToken = await registerForPushNotificationsAsync(); // Obtener token
      const location = await getCurrentLocation(); // Obtener ubicación

      const dataToSave = {
        email: userCredential.user.email,
        ...additionalData,
        ...(pushToken ? { dispositivo: pushToken } : {}),
        ...(location ? { ubicacion: location } : {})
      };
      
      await setDoc(doc(db, 'Users', userCredential.user.uid), dataToSave);

      const userData = await getUserData(userCredential.user.uid);
      setUser({ ...userData, dispositivo: pushToken, ubicacion: location });
      return { ...userData, dispositivo: pushToken, ubicacion: location };
    } catch (error) {
      console.error('Error en registerUser:', error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      console.log('Intentando cerrar sesión');
      await signOut(auth);
      console.log('Sesión cerrada exitosamente');
      setUser(null);
    } catch (error) {
      console.error('Error en logoutUser:', error);
      throw error;
    }
  };

  // Función para actualizar el estado del contexto con los datos actuales del usuario desde Firestore
  const refreshUser = async () => {
    try {
      if (!user || !user.uid) throw new Error('No hay un usuario autenticado.');

      console.log('Actualizando datos del usuario en el contexto...');
      const userData = await getUserData(user.uid);
      setUser(userData);
      console.log('Datos del usuario actualizados en el contexto:', userData);
      return userData;
    } catch (error) {
      console.error('Error en refreshUser:', error);
      throw error;
    }
  };
  const refreshDistance = async () => {
    if (!user || !user.uid) {
        console.error('No hay un usuario autenticado para actualizar la distancia.');
        return;
    }

    try {
        const userDocRef = doc(db, 'Users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().distancia !== undefined) {
            const newDistance = userDoc.data().distancia;
            setUser(prevUser => ({ ...prevUser, distancia: newDistance }));
            console.log('Distancia actualizada: ', newDistance);
        } else {
            console.log('El documento no contiene el campo distancia o el documento no existe.');
        }
    } catch (error) {
        console.error('Error al actualizar la distancia del usuario:', error);
    }
};

  useEffect(() => {
    console.log('Estado del usuario ha cambiado:', user);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loginUser, registerUser, logoutUser, refreshUser, refreshDistance }}>
      {children}
    </UserContext.Provider>
  );
};

async function registerForPushNotificationsAsync() {
  let token;
  console.log('Device.isDevice:', Device.isDevice);

  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Permission not granted for push notification!');
  }

  const { data } = await Notifications.getExpoPushTokenAsync({
    projectId: '00acd416-7bd8-42c6-853a-7a7281e76f89',
  });
  token = data;

  
  console.log("Token modificado: ", token);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};

export const useUser = () => useContext(UserContext);