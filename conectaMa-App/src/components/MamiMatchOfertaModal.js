import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import MamiMatchOfertaCard from './MamiMatchOfertaCard';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

const MamiMatchOfertaModal = ({ visible, onClose, ofertas, onReload }) => {
    const [offerList, setOfferList] = useState(ofertas);

    const handleReload = async () => {
        if (typeof onReload === 'function') { 
            const updatedOffers = await onReload();
            setOfferList(updatedOffers);
        } else {
            console.warn("onReload no está definida como función");
        }
    };

    useEffect(() => {
        setOfferList(ofertas);
    }, [ofertas]);

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
                        <View style={styles.iconContainer}>
                            <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
                                <Ionicons name="reload" size={24} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <AntDesign name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView style={styles.offerList}>
                        {offerList && offerList.length > 0 ? (
                            offerList.map((oferta) => (
                                <MamiMatchOfertaCard 
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
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reloadButton: {
        paddingRight: 10,
    },
    closeButton: {
        padding: 5,
    },
});

export default MamiMatchOfertaModal;
