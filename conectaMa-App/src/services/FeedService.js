// src/services/FeedService.js

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc, // Necesario para referenciar un documento específico
  updateDoc, // Para actualizar un documento
  arrayUnion, // Para añadir un elemento a un array
  arrayRemove, // Para quitar un elemento de un array
  increment, // Para incrementar o decrementar un valor numérico
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebaseConfig'; // Asegúrate que la ruta a tu config de Firebase sea correcta

const db = getFirestore(app);
const storage = getStorage(app);

// --- FUNCIONES EXISTENTES (SIN CAMBIOS) ---

export const uploadImageAndGetURL = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `feed/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir la imagen: ", error);
    throw error;
  }
};

export const createPublicacion = async (publicacionData) => {
  try {
    const docRef = await addDoc(collection(db, 'Feed'), {
      ...publicacionData,
      likes: 0, // Inicializamos los likes en 0
      likedBy: [], // Inicializamos el array de usuarios que dieron like
      fechaCreacion: serverTimestamp(),
    });
    console.log("Publicación creada con ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear la publicación: ", error);
    throw error;
  }
};

export const getPublicacionesListener = (callback) => {
  const q = query(collection(db, "Feed"), orderBy("fechaCreacion", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const publicaciones = [];
    querySnapshot.forEach((doc) => {
      publicaciones.push({ id: doc.id, ...doc.data() });
    });
    callback(publicaciones);
  }, (error) => {
    console.error("Error al obtener publicaciones: ", error);
  });
  return unsubscribe;
};


// --- NUEVOS SERVICIOS AÑADIDOS ---

/**
 * Agrega o quita un "like" de una publicación.
 * @param {string} publicacionId - El ID de la publicación.
 * @param {string} userId - El ID del usuario que da/quita el like.
 * @param {boolean} isCurrentlyLiked - true si el usuario ya le había dado like, false si no.
 */
export const toggleLikePublicacion = async (publicacionId, userId, isCurrentlyLiked) => {
  const publicacionRef = doc(db, 'Feed', publicacionId);
  try {
    if (isCurrentlyLiked) {
      // Si ya le gusta, quitamos el like
      await updateDoc(publicacionRef, {
        likedBy: arrayRemove(userId),
        likes: increment(-1), // Decrementamos el contador
      });
    } else {
      // Si no le gusta, agregamos el like
      await updateDoc(publicacionRef, {
        likedBy: arrayUnion(userId),
        likes: increment(1), // Incrementamos el contador
      });
    }
  } catch (error) {
    console.error("Error al actualizar la reacción: ", error);
    throw error;
  }
};

/**
 * Agrega un comentario a una publicación.
 * @param {string} publicacionId - El ID de la publicación a comentar.
 * @param {object} commentData - Un objeto con los datos del comentario (ej: { userId, userName, text }).
 */
export const addCommentToPublicacion = async (publicacionId, commentData) => {
  try {
    // Referencia a la subcolección 'comments' del documento de la publicación
    const commentsCollectionRef = collection(db, 'Feed', publicacionId, 'comments');
    await addDoc(commentsCollectionRef, {
      ...commentData,
      fechaCreacion: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al agregar el comentario: ", error);
    throw error;
  }
};

/**
 * Agrega un reporte a una publicación.
 * @param {string} publicacionId - El ID de la publicación.
 * @param {string} reporterId - El ID del usuario que reporta.
 * @param {string} reason - El motivo del reporte.
 */
export const reportPublicacion = async (publicacionId, reporterId, reason) => {
    const publicacionRef = doc(db, 'Feed', publicacionId);
    try {
        const reportData = {
            reporterId,
            reason,
            fechaReporte: serverTimestamp()
        };
        await updateDoc(publicacionRef, {
            reportes: arrayUnion(reportData)
        });
        console.log("Publicación reportada exitosamente.");
    } catch (error) {
        console.error("Error al reportar la publicación: ", error);
        throw error;
    }
};

/**
 * Escucha los comentarios de una publicación en tiempo real.
 * @param {string} publicacionId - El ID de la publicación.
 * @param {function} callback - Función que se ejecuta con los comentarios actualizados.
 * @returns {function} - Función para desuscribirse del listener.
 */
export const getCommentsListener = (publicacionId, callback) => {
  const commentsRef = collection(db, 'Feed', publicacionId, 'comments');
  const q = query(commentsRef, orderBy('fechaCreacion', 'asc')); // Orden cronológico
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    callback(comments);
  }, (error) => {
    console.error("Error al obtener comentarios: ", error);
  });
  
  return unsubscribe;
};