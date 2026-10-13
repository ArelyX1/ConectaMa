import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import AlertaMamiOfertaCard from './AlertaMamiOfertaCard';
import AntDesign from '@expo/vector-icons/AntDesign';

const AlertaMamiOfertaModal = ({ visible, onClose, ofertas }) => {
    // Asegúrate de que ofertas sea un array válido
    const ofertaList = Array.isArray(ofertas) ? ofertas : [];

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Ofertas</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <AntDesign name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.offerList}>
                        {ofertaList.length > 0 ? (
                            ofertaList.map((oferta) => (
                                <AlertaMamiOfertaCard 
                                    key={oferta.id} 
                                    ofertaObj={oferta} 
                                    onClose={onClose}
                                />
                            ))
                        ) : (
                            <Text>No hay ofertas disponibles.</Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'Signika Negative',
        fontWeight: 'bold',
    },
    offerList: {
        width: '100%',
        height: 450,

    },
    closeButton: {
        padding: 5,
    },
});

export default AlertaMamiOfertaModal;