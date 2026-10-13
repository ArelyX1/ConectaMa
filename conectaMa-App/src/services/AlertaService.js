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
    updateDoc,
    arrayUnion,
  } from "firebase/firestore";
  import { db } from "../../firebaseConfig";
  import { createChat, deleteChat } from "./ChatService";
  
  // Crear un nuevo alerta
  export const createAlerta = async (alerta) => {
    try {
      const db = getDatabase();
      const alertaRef = ref(db, "alertas");
      const newalertaRef = push(alertaRef);
      console.log(alerta);
      await set(newalertaRef, {
        uidUsuario: alerta.uidUsuario,
        ubicacion: alerta.ubicacion,
        estado: "pendiente",
        dispositivo: alerta.dispositivo,
        fechaEncargo: alerta.fechaEncargo,
        nombreUsuario: alerta.nombreUsuario,
        endAnfitrion: false,
        imgUrlUsuario: alerta.imgUrlUsuario,
        descripcion: alerta.descripcion,
        oferta: alerta.oferta,
        contraofertas: {},
      });
      return newalertaRef.key;
    } catch (error) {
      console.error("Error creando alerta: ", error);
    }
  };
  
  // Hacer una contraoferta
  export const makeContraoferta = async (alertaId, contraoferta) => {
    try {
      console.log("La nueva contraoferta es: ",contraoferta);
      const db = getDatabase();
      const contraofertaRef = ref(db, `alertas/${alertaId}/contraofertas`);
      const newContraofertaRef = push(contraofertaRef);
      await set(newContraofertaRef, {
        uidUsuario: contraoferta.uidUsuario,
        nombreUsuario: contraoferta.nombreUsuario,
        dispositivo: contraoferta.dispositivo,
        oferta: contraoferta.oferta,
        imgUrl: contraoferta.imgURL,
        estado: "pendiente",
        descripcion: contraoferta.description,
        fechaEncargo: contraoferta.fechaEncargo,
        endColaborador: false,
        alertaId: alertaId,
      });
      return newContraofertaRef.key;
    } catch (error) {
      console.error("Error haciendo contraoferta: ", error);
    }
  };
  
  // Aceptar una contraoferta
  export const acceptContraoferta = async (alertaId, contraofertaId) => {
    try {
      const db = getDatabase();
      const alertaRef = ref(db, `alertas/${alertaId}`);
      const contraofertaRef = ref(
        db,
        `alertas/${alertaId}/contraofertas/${contraofertaId}`
      );
  
      // Obtener los datos del alerta
      const alertaSnapshot = await get(alertaRef);
      const alertaData = alertaSnapshot.val();
  
      // Obtener los datos de la contraoferta
      const contraofertaSnapshot = await get(contraofertaRef);
      const contraofertaData = contraofertaSnapshot.val();
  
      // Obtener dispositivoAnfitrion y uidAnfitrion del alerta
      const dispositivoAnfitrion = alertaData.dispositivo;
      const uidAnfitrion = alertaData.uidUsuario;
  
      // Obtener dispositivoColaborador y uidColaborador de la contraoferta
      const dispositivoColaborador = contraofertaData.dispositivo;
      const uidColaborador = contraofertaData.uidUsuario;
  
      // Actualizar el estado de la contraoferta a 'aceptada'
      await update(contraofertaRef, { estado: 'aceptada' });
  
      // Actualizar el estado del alerta a 'en curso'
      await update(alertaRef, { estado: 'en curso' });
  
      // Crear un nuevo chat y obtener su referencia
      const chatId = await createChat(
        alertaId,
        contraofertaId,
        dispositivoAnfitrion,
        dispositivoColaborador,
        uidAnfitrion,
        uidColaborador
      );
  
    // Actualizar el alerta y la contraoferta con el ID del chat
    await update(alertaRef, { chat: chatId });
    await update(contraofertaRef, { chat: chatId });
    } catch (error) {
      console.error("Error aceptando contraoferta: ", error);
    }
  };
  
  // Cancelar un alerta
  export const cancelAlerta = async (alertaId) => {
    try {
      const db = getDatabase();
      const alertaRef = ref(db, `alertas/${alertaId}`);
      await update(alertaRef, { estado: "cancelado" });
    } catch (error) {
      console.error("Error cancelando alerta: ", error);
    }
  };
  
  // Cancelar una contraoferta
  export const cancelContraoferta = async (alertaId, contraofertaId) => {
    try {
      const db = getDatabase();
      const contraofertaRef = ref(
        db,
        `alertas/${alertaId}/contraofertas/${contraofertaId}`
      );
      await update(contraofertaRef, { estado: "cancelado" });
    } catch (error) {
      console.error("Error cancelando contraoferta: ", error);
    }
  };
  
  // Obtener todos los alertas disponibles
  export const getAllAlertas = async () => {
    try {
      const db = getDatabase();
      const alertasRef = ref(db, "alertas");
      const snapshot = await get(alertasRef);
  
      return snapshot.val();
    } catch (error) {
      console.error("Error obteniendo alertas: ", error);
    }
  };
  
  // Obtener todos los alertas creados por un usuario específico
  export const getAlertasByUser = async (uidUsuario) => {
    try {
      const db = getDatabase();
      const alertasRef = query(
        ref(db, "alertas"),
        orderByChild("uidUsuario"),
        equalTo(uidUsuario)
      );
      const snapshot = await get(alertasRef);
      return snapshot.val();
    } catch (error) {
      console.error("Error obteniendo alertas por usuario: ", error);
    }
  };
  
  // Obtener todas las ofertas hechas por un usuario específico
  export const getContraofertasByUser = async (uidUsuario) => {
    try {
      const db = getDatabase();
      const alertasRef = ref(db, "alertas");
      const snapshot = await get(alertasRef);
      const alertas = snapshot.val();
  
      const userOffers = {};
  
      for (const alertaId in alertas) {
        if (alertas[alertaId].contraofertas) {
          for (const contraofertaId in alertas[alertaId].contraofertas) {
            if (
              alertas[alertaId].contraofertas[contraofertaId].uidUsuario ===
              uidUsuario
            ) {
              userOffers[contraofertaId] =
                alertas[alertaId].contraofertas[contraofertaId];
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
  export const valorarColaborador = async (alertaId, valoracion) => {
    try {
      const dbRealtime = getDatabase();
      const alertaRef = ref(dbRealtime, `alertas/${alertaId}`);
      const alertaSnapshot = await get(alertaRef);
      const alertaData = alertaSnapshot.val();
  
      let contraofertaAceptada = null;
      for (const contraofertaId in alertaData.contraofertas) {
        if (alertaData.contraofertas[contraofertaId].estado === "aceptada") {
          contraofertaAceptada = alertaData.contraofertas[contraofertaId];
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
  export const valorarAnfitrion = async (alertaId, valoracion) => {
    try {
      console.log(alertaId,valoracion);
      const dbRealtime = getDatabase();
      const alertaRef = ref(dbRealtime, `alertas/${alertaId}`);
      const alertaSnapshot = await get(alertaRef);
      const alertaData = alertaSnapshot.val();

      const anfitrionDocRef = doc(db, `Users/${alertaData.uidUsuario}`);
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
  
  export const terminarAlertaAnfitrion = async (alertaId) => {
    try {
      const dbRealtime = getDatabase();
      const alertaRef = ref(dbRealtime, `alertas/${alertaId}`);
      const alertaSnapshot = await get(alertaRef);
      const alertaData = alertaSnapshot.val();
  
      if (!alertaData) {
        throw new Error("El alerta no existe.");
      }
  
      if (alertaData.estado !== "en curso") {
        throw new Error("El alerta no está en curso.");
      }
  
      let contraofertaAceptada = null;
      for (const contraofertaId in alertaData.contraofertas) {
        if (alertaData.contraofertas[contraofertaId].estado === "aceptada") {
          contraofertaAceptada = alertaData.contraofertas[contraofertaId];
          contraofertaAceptada.id = contraofertaId;
          break;
        }
      }
  
      if (!contraofertaAceptada) {
        throw new Error("No hay ninguna contraoferta aceptada.");
      }
  
      // Marcar endAnfitrion como true
      if (alertaData.endAnfitrion !== true) {
        await update(alertaRef, { endAnfitrion: true });
      } else {
        console.log("El alerta ya fue terminado por el anfitrión.");
      }
  
      // Verificar si ambos extremos han terminado
      if (contraofertaAceptada.endColaborador === true) {
        // Mover el alerta a Firestore
        const serviceDocRef = doc(db, `Services/${alertaId}`);
        await setDoc(serviceDocRef, {
          ...alertaData,
          contraofertaAceptada,
        });
  
        // Asignar el ID del servicio al usuario anfitrión
        const userDocRef = doc(db, `Users/${alertaData.uidUsuario}`);
        await updateDoc(userDocRef, {
          serviciosAnfitrion: arrayUnion(alertaId),
        });
  
        // Eliminar el alerta de la Realtime Database
        if (alertaData.chat) {
          await deleteChat(alertaData.chat);
        }
        await eliminarDato(`alertas/${alertaId}`);
      }
    } catch (error) {
      console.error("Error terminando alerta por anfitrión: ", error);
      throw error;
    }
  };
  
  export const endAlertaColaborador = async (alertaId) => {
    try {
      const dbRealtime = getDatabase();
      const alertaRef = ref(dbRealtime, `alertas/${alertaId}`);
      const alertaSnapshot = await get(alertaRef);
      const alertaData = alertaSnapshot.val();
  
      if (!alertaData) {
        throw new Error("El alerta no existe.");
      }
  
      if (alertaData.estado !== "en curso") {
        throw new Error("El alerta no está en curso.");
      }
  
      let contraofertaAceptada = null;
      for (const contraofertaId in alertaData.contraofertas) {
        if (alertaData.contraofertas[contraofertaId].estado === "aceptada") {
          contraofertaAceptada = alertaData.contraofertas[contraofertaId];
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
          ref(dbRealtime, `alertas/${alertaId}/contraofertas/${contraofertaAceptada.id}`),
          { endColaborador: true }
        );
      } else {
        console.log("El alerta ya fue terminado por el colaborador.");
      }
  
      // Verificar si ambos extremos han terminado
      if (alertaData.endAnfitrion === true) {
        // Mover el alerta a Firestore
        const serviceDocRef = doc(db, `Services/${alertaId}`);
        await setDoc(serviceDocRef, {
          ...alertaData,
          contraofertaAceptada,
        });
  
        // Asignar el ID del servicio al usuario anfitrión
        const userDocRef = doc(db, `Users/${alertaData.uidUsuario}`);
        await updateDoc(userDocRef, {
          serviciosAnfitrion: arrayUnion(alertaId),
        });
  
        // Eliminar el alerta de la Realtime Database
        if (alertaData.chat) {
          await deleteChat(alertaData.chat);
        }
        await eliminarDato(`alertas/${alertaId}`);
      }
    } catch (error) {
      console.error("Error terminando alerta por colaborador: ", error);
      throw error;
    }
  };