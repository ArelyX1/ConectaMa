import {
  getDatabase,
  ref,
  push,
  update,
  get,
  query,
  orderByChild,
  equalTo,
  set,
  remove,
} from "firebase/database";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { createChat, deleteChat } from "./ChatService";

// Crear un nuevo encargo
export const createEncargo = async (encargo) => {
  try {
    const db = getDatabase();
    const encargoRef = ref(db, "encargos");
    const newEncargoRef = push(encargoRef);
    await set(newEncargoRef, {
      uidUsuario: encargo.uidUsuario,
      ubicacion: encargo.ubicacion,
      estado: "pendiente",
      dispositivo: encargo.dispositivo,
      fechaEncargo: encargo.fechaEncargo,
      nombreUsuario: encargo.nombreUsuario,
      endAnfitrion: false,
      imgUrlUsuario: encargo.imgUrlUsuario,
      descripcion: encargo.descripcion,
      oferta: encargo.oferta,
      contraofertas: {},
    });
    return newEncargoRef.key;
  } catch (error) {
    console.error("Error creando encargo: ", error);
  }
};

// Hacer una contraoferta
export const makeContraoferta = async (encargoId, contraoferta) => {
  try {
    const db = getDatabase();
    const contraofertaRef = ref(db, `encargos/${encargoId}/contraofertas`);
    const newContraofertaRef = push(contraofertaRef);
    console.log(contraoferta);
    await set(newContraofertaRef, {
      uidUsuario: contraoferta.uidUsuario,
      nombreUsuario: contraoferta.nombreUsuario,
      oferta: contraoferta.oferta,
      dispositivo: contraoferta.dispositivo,
      estado: "pendiente",
      descripcion: contraoferta.description,
      fechaEncargo: contraoferta.fechaEncargo,
      endColaborador: false,
      encargoId: encargoId,
    });
    return newContraofertaRef.key;
  } catch (error) {
    console.error("Error haciendo contraoferta: ", error);
  }
};

export const acceptContraoferta = async (encargoId, contraofertaId) => {
  try {
    const db = getDatabase();
    const encargoRef = ref(db, `encargos/${encargoId}`);
    const contraofertaRef = ref(db, `encargos/${encargoId}/contraofertas/${contraofertaId}`);

    // Obtener los datos del encargo
    const encargoSnapshot = await get(encargoRef);
    const encargoData = encargoSnapshot.val();

    // Obtener los datos de la contraoferta
    const contraofertaSnapshot = await get(contraofertaRef);
    const contraofertaData = contraofertaSnapshot.val();

    // Obtener dispositivoAnfitrion y uidAnfitrion del encargo
    const dispositivoAnfitrion = encargoData.dispositivo;
    const uidAnfitrion = encargoData.uidUsuario;

    // Obtener dispositivoColaborador y uidColaborador de la contraoferta
    const dispositivoColaborador = contraofertaData.dispositivo;
    const uidColaborador = contraofertaData.uidUsuario;

    // Actualizar el estado de la contraoferta a 'aceptada'
    await update(contraofertaRef, { estado: 'aceptada' });

    // Actualizar el estado del encargo a 'en curso'
    await update(encargoRef, { estado: 'en curso' });

    // Crear un nuevo chat y obtener su ID
    const chatId = await createChat(
      encargoId,
      contraofertaId,
      dispositivoAnfitrion,
      dispositivoColaborador,
      uidAnfitrion,
      uidColaborador
    );

    // Actualizar el encargo y la contraoferta con el ID del chat
    await update(encargoRef, { chat: chatId });
    await update(contraofertaRef, { chat: chatId });
  } catch (error) {
    console.error('Error aceptando contraoferta: ', error);
  }
};

// Cancelar un encargo
export const cancelEncargo = async (encargoId) => {
  try {
    const db = getDatabase();
    const encargoRef = ref(db, `encargos/${encargoId}`);
    await update(encargoRef, { estado: "cancelado" });
  } catch (error) {
    console.error("Error cancelando encargo: ", error);
  }
};

// Cancelar una contraoferta
export const cancelContraoferta = async (encargoId, contraofertaId) => {
  try {
    const db = getDatabase();
    const contraofertaRef = ref(
      db,
      `encargos/${encargoId}/contraofertas/${contraofertaId}`
    );
    await update(contraofertaRef, { estado: "cancelado" });
  } catch (error) {
    console.error("Error cancelando contraoferta: ", error);
  }
};

// Obtener todos los encargos disponibles
export const getAllEncargos = async () => {
  try {
    const db = getDatabase();
    const encargosRef = ref(db, "encargos");
    const snapshot = await get(encargosRef);

    return snapshot.val();
  } catch (error) {
    console.error("Error obteniendo encargos: ", error);
  }
};

// Obtener todos los encargos creados por un usuario específico
export const getEncargosByUser = async (uidUsuario) => {
  try {
    const db = getDatabase();
    const encargosRef = query(
      ref(db, "encargos"),
      orderByChild("uidUsuario"),
      equalTo(uidUsuario)
    );
    const snapshot = await get(encargosRef);
    return snapshot.val();
  } catch (error) {
    console.error("Error obteniendo encargos por usuario: ", error);
  }
};

// Obtener todas las ofertas hechas por un usuario específico
export const getContraofertasByUser = async (uidUsuario) => {
  try {
    const db = getDatabase();
    const encargosRef = ref(db, "encargos");
    const snapshot = await get(encargosRef);
    const encargos = snapshot.val();

    const userOffers = {};

    for (const encargoId in encargos) {
      if (encargos[encargoId].contraofertas) {
        for (const contraofertaId in encargos[encargoId].contraofertas) {
          if (
            encargos[encargoId].contraofertas[contraofertaId].uidUsuario ===
            uidUsuario
          ) {
            userOffers[contraofertaId] =
              encargos[encargoId].contraofertas[contraofertaId];
          }
        }
      }
    }

    return userOffers;
  } catch (error) {
    console.error("Error obteniendo contraofertas por usuario: ", error);
  }
};

// Añadir valoración al colaborador
export const valorarColaborador = async (encargoId, valoracion) => {
  try {
    const dbRealtime = getDatabase();
    const encargoRef = ref(dbRealtime, `encargos/${encargoId}`);
    const encargoSnapshot = await get(encargoRef);
    const encargoData = encargoSnapshot.val();

    let contraofertaAceptada = null;
    for (const contraofertaId in encargoData.contraofertas) {
      if (encargoData.contraofertas[contraofertaId].estado === "aceptada") {
        contraofertaAceptada = encargoData.contraofertas[contraofertaId];
        break;
      }
    }

    if (!contraofertaAceptada) {
      throw new Error("No hay ninguna contraoferta aceptada.");
    }

    const colaboradorDocRef = doc(db, `Users/${contraofertaAceptada.uidUsuario}`);

    // Obtener los datos actuales del colaborador
    const colaboradorSnapshot = await getDoc(colaboradorDocRef);
    const colaboradorData = colaboradorSnapshot.data();

    // Obtener valores actuales
    const cantidadValoraciones = colaboradorData.cantidadValoracionesColaborador || 0;
    const promedioActual = colaboradorData.promedioValoracionColaborador || 0;

    // Calcular nuevo promedio
    const nuevaCantidadValoraciones = cantidadValoraciones + 1;
    const nuevoPromedio = ((promedioActual * cantidadValoraciones) + valoracion) / nuevaCantidadValoraciones;

    // Actualizar el documento del colaborador
    await updateDoc(colaboradorDocRef, {
      promedioValoracionColaborador: parseFloat(nuevoPromedio.toFixed(1)),
      cantidadValoracionesColaborador: nuevaCantidadValoraciones,
    });
  } catch (error) {
    console.error("Error valorando al colaborador: ", error);
  }
};

// Añadir valoración al anfitrión
export const valorarAnfitrion = async (encargoId, valoracion) => {
  try {
    const dbRealtime = getDatabase();
    const encargoRef = ref(dbRealtime, `encargos/${encargoId}`);
    const encargoSnapshot = await get(encargoRef);
    const encargoData = encargoSnapshot.val();

    const anfitrionDocRef = doc(db, `Users/${encargoData.uidUsuario}`);

    // Obtener los datos actuales del anfitrión
    const anfitrionSnapshot = await getDoc(anfitrionDocRef);
    const anfitrionData = anfitrionSnapshot.data();

    // Obtener valores actuales
    const cantidadValoraciones = anfitrionData.cantidadValoracionesAnfitrion || 0;
    const promedioActual = anfitrionData.promedioValoracionAnfitrion || 0;

    // Calcular nuevo promedio
    const nuevaCantidadValoraciones = cantidadValoraciones + 1;
    const nuevoPromedio = ((promedioActual * cantidadValoraciones) + valoracion) / nuevaCantidadValoraciones;

    // Actualizar el documento del anfitrión
    await updateDoc(anfitrionDocRef, {
      promedioValoracionAnfitrion: parseFloat(nuevoPromedio.toFixed(1)),
      cantidadValoracionesAnfitrion: nuevaCantidadValoraciones,
    });
  } catch (error) {
    console.error("Error valorando al anfitrión: ", error);
  }
};

const eliminarDato = (reference) => {
  return new Promise((resolve, reject) => {
    remove(ref(getDatabase(), reference))
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

export const terminarEncargoAnfitrion = async (encargoId) => {
  try {
    const dbRealtime = getDatabase();
    const encargoRef = ref(dbRealtime, `encargos/${encargoId}`);
    const encargoSnapshot = await get(encargoRef);
    const encargoData = encargoSnapshot.val();

    if (!encargoData) {
      throw new Error("El encargo no existe.");
    }

    if (encargoData.estado !== "en curso") {
      throw new Error("El encargo no está en curso.");
    }

    let contraofertaAceptada = null;
    for (const contraofertaId in encargoData.contraofertas) {
      if (encargoData.contraofertas[contraofertaId].estado === "aceptada") {
        contraofertaAceptada = encargoData.contraofertas[contraofertaId];
        contraofertaAceptada.id = contraofertaId;
        break;
      }
    }

    if (!contraofertaAceptada) {
      throw new Error("No hay ninguna contraoferta aceptada.");
    }

    // Marcar endAnfitrion como true
    if (encargoData.endAnfitrion !== true) {
      await update(encargoRef, { endAnfitrion: true });
    } else {
      console.log("El encargo ya fue terminado por el anfitrión.");
    }

    // Verificar si ambos extremos han terminado
    if (contraofertaAceptada.endColaborador === true) {
      // Mover el encargo a Firestore
      const serviceDocRef = doc(db, `Services/${encargoId}`);
      await setDoc(serviceDocRef, {
        ...encargoData,
        contraofertaAceptada,
      });

      // Asignar el ID del servicio al usuario anfitrión
      const userDocRef = doc(db, `Users/${encargoData.uidUsuario}`);
      await updateDoc(userDocRef, {
        serviciosAnfitrion: arrayUnion(encargoId),
      });

      // Eliminar el encargo de la Realtime Database
      if (encargoData.chat) {
        await deleteChat(encargoData.chat);
      }
      await eliminarDato(`encargos/${encargoId}`);
    }
  } catch (error) {
    console.error("Error terminando encargo por anfitrión: ", error);
    throw error;
  }
};

export const endEncargoColaborador = async (encargoId) => {
  try {
    const dbRealtime = getDatabase();
    const encargoRef = ref(dbRealtime, `encargos/${encargoId}`);
    const encargoSnapshot = await get(encargoRef);
    const encargoData = encargoSnapshot.val();

    if (!encargoData) {
      throw new Error("El encargo no existe.");
    }

    if (encargoData.estado !== "en curso") {
      throw new Error("El encargo no está en curso.");
    }

    let contraofertaAceptada = null;
    for (const contraofertaId in encargoData.contraofertas) {
      if (encargoData.contraofertas[contraofertaId].estado === "aceptada") {
        contraofertaAceptada = encargoData.contraofertas[contraofertaId];
        contraofertaAceptada.id = contraofertaId;
        break;
      }
    }

    if (!contraofertaAceptada) {
      throw new Error("No hay ninguna contraoferta aceptada.");
    }

    // Marcar endColaborador como true en la contraoferta aceptada
    if (contraofertaAceptada.endColaborador !== true) {
      await update(
        ref(dbRealtime, `encargos/${encargoId}/contraofertas/${contraofertaAceptada.id}`),
        { endColaborador: true }
      );
    } else {
      console.log("El encargo ya fue terminado por el colaborador.");
    }

    // Verificar si ambos extremos han terminado
    if (encargoData.endAnfitrion === true) {
      // Mover el encargo a Firestore
      const serviceDocRef = doc(db, `Services/${encargoId}`);
      await setDoc(serviceDocRef, {
        ...encargoData,
        contraofertaAceptada,
      });

      // Asignar el ID del servicio al usuario anfitrión
      const userDocRef = doc(db, `Users/${encargoData.uidUsuario}`);
      await updateDoc(userDocRef, {
        serviciosAnfitrion: arrayUnion(encargoId),
      });

      // Eliminar el encargo de la Realtime Database
      if (encargoData.chat) {
        await deleteChat(encargoData.chat);
      }
      await eliminarDato(`encargos/${encargoId}`);
    }
  } catch (error) {
    console.error("Error terminando encargo por colaborador: ", error);
    throw error;
  }
};