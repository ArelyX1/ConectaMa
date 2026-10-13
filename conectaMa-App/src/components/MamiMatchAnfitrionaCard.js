import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MamiMatchOfertaModal from './MamiMatchOfertaModal';
import MamiMatchChatModal from './MamiMatchChatModal';
import { getDatabase, ref, query, orderByChild, equalTo, get, remove } from 'firebase/database'; 
import { getAuth } from 'firebase/auth';
import { Alert } from 'react-native';


const auth = getAuth();
const uidUsuario = auth.currentUser?.uid;

const MamiMatchAnfitrionaCard = ({ mamiMatch, onViewOffers }) => {
    console.log(mamiMatch);

    const { status = 'pendiente', date, description, price } = mamiMatch;
    const [loading, setLoading] = useState(false);
    
    const formatDate = (dateString) => {
        const options = { 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', options);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pendiente':
                return '#43A89B';
            case 'en curso':
                return '#C499E0';
            default:
                return '#43A89B';
        }
    };

    const getCardStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'pendiente':
                return styles.cardContainerPending;
            case 'en curso':
                return styles.cardContainerInProgress;
            default:
                return styles.cardContainerPending;
        }
    };

    const [isModalVisible, setModalVisible] = useState(false);
    const [isChatModalVisible, setChatModalVisible] = useState(false);

    const handleViewOffers = () => {
        onViewOffers();
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleOpenChat = () => {
        setChatModalVisible(true); 
    };

    const handleCloseChat = () => {
        setChatModalVisible(false);
    };

    const handleDelete = async () => {
        try {
            const db = getDatabase();
            
            const auth = getAuth();
            const uidUsuario = auth.currentUser?.uid;
    
            if (!uidUsuario) {
                console.error('Error: uidUsuario is undefined.');
                Alert.alert('Error', 'No se pudo obtener el ID de usuario. Inténtalo de nuevo.');
                return;
            }
    
            const q = query(ref(db, 'encargos'), orderByChild('uidUsuario'), equalTo(uidUsuario));
    
            const snapshot = await get(q);
    
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const encargoId = childSnapshot.key;
    
                    remove(ref(db, `encargos/${encargoId}`))
                        .then(() => {
                            Alert.alert('Eliminado', 'El encargo ha sido eliminado correctamente.');
                        })
                        .catch((error) => {
                            console.error('Error al eliminar el encargo: ', error);
                            Alert.alert('Error', 'No se pudo eliminar el encargo. Inténtalo de nuevo.');
                        });
                });
            } else {
                Alert.alert('Error', 'No se encontró ningún encargo para este usuario.');
            }
        } catch (error) {
            console.error('Error al eliminar el encargo: ', error);
            Alert.alert('Error', 'No se pudo eliminar el encargo. Inténtalo de nuevo.');
        }
    };    
    
    return (
        <View style={getCardStyle(status)}>
            <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
            </View>
            <Text style={styles.descriptionText}>{description}</Text>
            <View style={styles.buttonContainer}>
                {status.toLowerCase() === 'pendiente' ? (
                    <>
                        <TouchableOpacity style={styles.offerButton} onPress={handleViewOffers}>
                            <Text style={styles.offerButtonText}>Ver ofertas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Text style={styles.deleteButtonText}>Eliminar</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
                        <Text style={styles.chatButtonText}>Iniciar Chat</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.priceText}>{price}</Text>
            </View>
            <MamiMatchOfertaModal visible={isModalVisible} onClose={handleCloseModal} />
            <MamiMatchChatModal visible={isChatModalVisible} chatId={mamiMatch.chat} onClose={handleCloseChat} />
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainerPending: {
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
    cardContainerInProgress: {
        backgroundColor: '#F6F6F6',
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 16,
        fontFamily: 'Signika Negative',
        fontWeight: 'bold',
    },
    statusText: {
        fontSize: 16,
        fontFamily: 'Signika Negative',
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: 'Signika Negative',
        color: '#777',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    offerButton: {
        backgroundColor: '#04352C',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    offerButtonText: {
        color: '#fff',
        fontFamily: 'Signika Negative',
        fontWeight: 'bold',
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: '#B7EAE0',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 15,
    },
    deleteButtonText: {
        color: '#04352C',
        fontFamily: 'Signika Negative',
        fontWeight: 'bold',
        fontSize: 14,
    },
    chatButton: {
        backgroundColor: '#04352C',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    chatButtonText: {
        color: '#fff',
        fontFamily: 'Signika Negative',
        fontWeight: 'bold',
        fontSize: 14,
    },
    priceText: {
        fontSize: 16,
        fontFamily: 'Signika Negative',
        fontWeight: 'bold',
        marginLeft: 30,
    },
});

export default MamiMatchAnfitrionaCard;