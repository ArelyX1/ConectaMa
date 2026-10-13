// src/components/PublicacionFeedCard.js

import React, { useState, useMemo, useEffect } from 'react';
import { 
    View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput, Platform, 
    FlatList, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import Modal from 'react-native-modal';
import * as Clipboard from 'expo-clipboard';
import { useUser } from '../context/UserContext';
import { toggleLikePublicacion, addCommentToPublicacion, reportPublicacion, getCommentsListener } from '../services/FeedService';

// --- Sub-componente para el Modal de Contacto Personalizado ---
const ContactModal = ({ isVisible, onClose, contacto }) => {
    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(contacto);
        Alert.alert("¡Copiado!", "El contacto ha sido copiado al portapapeles.");
    };

    return (
        <Modal isVisible={isVisible} onBackdropPress={onClose} onBackButtonPress={onClose} style={styles.modal}>
            <View style={styles.modalContainer}>
                <Ionicons name="logo-whatsapp" size={50} color="#25D366" />
                <Text style={styles.modalTitle}>Información de Contacto</Text>
                <Text style={styles.modalContactText}>{contacto}</Text>
                <View style={styles.modalButtonRow}>
                    <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                        <Ionicons name="copy-outline" size={20} color="#fff" />
                        <Text style={styles.modalButtonText}>Copiar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={[styles.modalButtonText, { color: '#555' }]}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// --- Sub-componente para mostrar un item de comentario ---
const CommentItem = ({ comment }) => (
    <View style={styles.commentItemContainer}>
        <Image 
            source={comment.userImage ? { uri: comment.userImage } : require('../assets/LOGO_SIMBOLO_VERDE.png')} 
            style={styles.commentUserImage}
        />
        <View style={styles.commentTextContainer}>
            <Text style={styles.commentUserName}>{comment.userName || 'Usuario'}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
        </View>
    </View>
);

// --- Sub-componente para el Modal de Comentarios ---
const CommentModal = ({ isVisible, onClose, onCommentSubmit, commentText, setCommentText, comments, isSubmitting, loadingComments }) => {
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            style={styles.modal}
            avoidKeyboard
        >
            <View style={[styles.modalContainer, styles.commentModalContainer]}>
                <Text style={styles.modalTitle}>Comentarios</Text>
                
                {/* Lista de Comentarios */}
                {loadingComments ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#43A89B" />
                        <Text style={styles.loadingText}>Cargando comentarios...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={comments}
                        renderItem={({ item }) => <CommentItem comment={item} />}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        style={styles.commentList}
                        ListEmptyComponent={<Text style={styles.emptyListText}>Aún no hay comentarios. ¡Sé el primero!</Text>}
                    />
                )}

                {/* Área para escribir un nuevo comentario */}
                <View style={styles.commentInputContainer}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Escribe tu comentario aquí..."
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                    />
                    <TouchableOpacity 
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
                        onPress={onCommentSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const PublicacionFeedCard = ({ publicacion }) => {
  const { user } = useUser();
  const [isContactModalVisible, setContactModalVisible] = useState(false);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const isLiked = useMemo(() =>
    publicacion.likedBy?.includes(user.uid),
    [publicacion.likedBy, user.uid]
  );

  // Efecto para escuchar comentarios cuando se abre el modal
  useEffect(() => {
    if (isCommentModalVisible) {
      setLoadingComments(true);
      const unsubscribe = getCommentsListener(publicacion.id, (commentsData) => {
        setComments(commentsData);
        setLoadingComments(false);
      });
      
      // Cleanup: desuscribirse cuando se cierra el modal o se desmonta el componente
      return () => unsubscribe();
    } else {
      // Limpiamos los comentarios cuando se cierra el modal
      setComments([]);
    }
  }, [isCommentModalVisible, publicacion.id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    return timestamp.toDate().toLocaleDateString('es-PE');
  };

  const formatPrice = (price) => {
    const number = parseFloat(price);
    if (isNaN(number)) return 'Precio no válido';
    return `S/ ${number.toFixed(2)}`;
  };

  const handleLikePress = async () => {
    try {
        await toggleLikePublicacion(publicacion.id, user.uid, isLiked);
    } catch (error) {
        Alert.alert("Error", "No se pudo procesar la reacción.");
    }
  };

  const handleCommentPress = () => {
    setCommentModalVisible(true);
  };

  const handleCommentSubmit = async () => {
    if (!commentText || commentText.trim().length === 0) {
      Alert.alert("Atención", "El comentario no puede estar vacío.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const commentData = {
        userId: user.uid,
        userName: user.nombres + ' ' + user.apellidos,
        userImage: user.profileImage || '',
        text: commentText.trim(),
      };
      await addCommentToPublicacion(publicacion.id, commentData);
      setCommentText('');
    } catch (error) {
      Alert.alert("Error", "No se pudo publicar tu comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportPress = () => {
    Alert.alert(
      "Opciones", "¿Qué deseas hacer?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reportar Publicación", style: "destructive",
          onPress: () => {
            if (Platform.OS === 'ios') {
                Alert.prompt( "Reportar", "Por favor, indica el motivo del reporte:",
                    async (reason) => {
                        if (reason && reason.trim().length > 0) {
                        try {
                            await reportPublicacion(publicacion.id, user.uid, reason.trim());
                            Alert.alert("Gracias", "Hemos recibido tu reporte y lo revisaremos pronto.");
                        } catch (error) { 
                            Alert.alert("Error", "No se pudo enviar tu reporte."); 
                        }
                        }
                    }
                );
            } else {
                Alert.alert("Reportar", "Funcionalidad de reporte no disponible en este dispositivo. Por favor, contacta a soporte.");
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <Image
            source={publicacion.imgUrlUsuario ? { uri: publicacion.imgUrlUsuario } : require('../assets/LOGO_SIMBOLO_VERDE.png')}
            style={styles.userImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{publicacion.nombreUsuario || 'Usuario Anónimo'}</Text>
            <Text style={styles.dateText}>{formatDate(publicacion.fechaCreacion)}</Text>
          </View>
          <TouchableOpacity style={styles.reportButton} onPress={handleReportPress}>
              <Ionicons name="ellipsis-vertical" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: publicacion.imagenUrl }} style={styles.postImage} />

        <View style={styles.infoContainer}>
          <Text style={styles.priceText}>{formatPrice(publicacion.precio)}</Text>
          <Text style={styles.descriptionText} numberOfLines={3} ellipsizeMode="tail">
            {publicacion.descripcion}
          </Text>

          <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionIcon} onPress={handleLikePress}>
                  <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? "#E91E63" : "#555"} />
                  <Text style={styles.actionText}>{publicacion.likes || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={handleCommentPress}>
                  <Ionicons name="chatbubble-outline" size={26} color="#555" />
              </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.contactButton} onPress={() => setContactModalVisible(true)}>
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contactar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ContactModal
        isVisible={isContactModalVisible}
        onClose={() => setContactModalVisible(false)}
        contacto={publicacion.contacto}
      />

      <CommentModal
        isVisible={isCommentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        onCommentSubmit={handleCommentSubmit}
        commentText={commentText}
        setCommentText={setCommentText}
        comments={comments}
        isSubmitting={isSubmitting}
        loadingComments={loadingComments}
      />
    </>
  );
};

const styles = StyleSheet.create({
    cardContainer: { 
        backgroundColor: '#fff', 
        borderRadius: 12, 
        marginVertical: 8, 
        marginHorizontal: 16, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 3.84, 
        elevation: 5 
    },
    headerContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 12, 
        paddingVertical: 10 
    },
    userImage: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        marginRight: 10 
    },
    userInfo: { 
        flex: 1 
    },
    userName: { 
        fontWeight: 'bold', 
        fontSize: 16, 
        color: '#333' 
    },
    dateText: { 
        fontSize: 12, 
        color: '#888' 
    },
    reportButton: { 
        padding: 5 
    },
    postImage: { 
        width: '100%', 
        aspectRatio: 16 / 9 
    },
    infoContainer: { 
        padding: 12 
    },
    priceText: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#43A89B', 
        marginBottom: 8 
    },
    descriptionText: { 
        fontSize: 14, 
        color: '#555', 
        lineHeight: 20, 
        marginBottom: 12 
    },
    actionsRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingBottom: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f0f0f0', 
        marginBottom: 12 
    },
    actionIcon: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginRight: 16 
    },
    actionText: { 
        marginLeft: 6, 
        fontSize: 16, 
        color: '#555' 
    },
    contactButton: { 
        backgroundColor: '#43A89B', 
        borderRadius: 8, 
        paddingVertical: 12, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    contactButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginLeft: 8 
    },
    modal: { 
        justifyContent: 'flex-end', 
        margin: 0 
    },
    modalContainer: { 
        backgroundColor: 'white', 
        padding: 22, 
        borderTopRightRadius: 20, 
        borderTopLeftRadius: 20, 
        alignItems: 'center' 
    },
    modalTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginTop: 10, 
        marginBottom: 15 
    },
    modalContactText: { 
        fontSize: 18, 
        color: '#555', 
        marginBottom: 20, 
        backgroundColor: '#f0f0f0', 
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        borderRadius: 8 
    },
    modalButtonRow: { 
        flexDirection: 'row', 
        width: '100%', 
        justifyContent: 'space-around' 
    },
    copyButton: { 
        backgroundColor: '#43A89B', 
        paddingVertical: 12, 
        paddingHorizontal: 25, 
        borderRadius: 8, 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    closeButton: { 
        backgroundColor: '#e0e0e0', 
        paddingVertical: 12, 
        paddingHorizontal: 25, 
        borderRadius: 8 
    },
    modalButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginLeft: 5 
    },
    commentModalContainer: {
        height: '80%'
    },
    commentList: {
        width: '100%',
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40
    },
    loadingText: {
        marginTop: 10,
        color: '#888',
        fontSize: 14
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888'
    },
    commentItemContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    commentUserImage: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        marginRight: 10
    },
    commentTextContainer: {
        flex: 1
    },
    commentUserName: {
        fontWeight: 'bold',
        color: '#333'
    },
    commentText: {
        color: '#555'
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    commentInput: {
        flex: 1,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100
    },
    submitButton: {
        backgroundColor: '#43A89B',
        borderRadius: 25,
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitButtonDisabled: {
        backgroundColor: '#a9d4cf'
    }
});

export default PublicacionFeedCard;