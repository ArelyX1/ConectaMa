import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { acceptContraoferta } from '../services/AlertaService';

const AlertaMamiOfertaCard = ({ ofertaObj, onClose }) => {
    // Desestructuramos los datos de la oferta

    const { nombreUsuario, oferta, descripcion = 'No hay descripción disponible', imgUrl } = ofertaObj;
    const handleAccept = async () => {
        try {
            console.log(ofertaObj.encargoId, ofertaObj.id);
          await acceptContraoferta(ofertaObj.alertaId, ofertaObj.id);
          onClose(); // Cerrar el modal después de aceptar
        } catch (error) {
          console.error("Error aceptando contraoferta: ", error);
        }
      };
    return (
        <View style={styles.cardContainer}>
            <View style={styles.header}>
                <Image 
                    source={imgUrl ? { uri: imgUrl } : require('../assets/LOGO_SIMBOLO_VERDE.png')}
                    style={styles.userImage}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{nombreUsuario || 'Anónimo'}</Text>
                    <Text style={styles.offerAmount}>Oferta: {oferta}</Text>
                </View>
            </View>
            <Text style={styles.offerDescription}>{descripcion}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.rejectButton}>
                    <Text style={styles.rejectButtonText}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton}>
                    <Text style={styles.acceptButtonText} onPress={handleAccept}>Aceptar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10, 
    },
    userInfo: {
        flexDirection: 'column',
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Signika Negative',
        fontWeight: 'bold',
        color: '#43A89B',
    },
    offerAmount: {
        fontSize: 15,
        fontFamily: 'Signika Negative',
        color: '#04352C',
    },
    offerDescription: {
        fontSize: 14,
        fontFamily: 'Signika Negative',
        color: '#04352C',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rejectButton: {
        backgroundColor: '#B7EAE0',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    rejectButtonText: {
        color: '#04352C',
        fontFamily: 'Signika Negative',
        fontSize: 14,
    },
    acceptButton: {
        backgroundColor: '#04352C',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    acceptButtonText: {
        color: '#fff',
        fontFamily: 'Signika Negative',
        fontSize: 14,
    },
});

export default AlertaMamiOfertaCard;