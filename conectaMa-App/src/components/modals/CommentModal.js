// src/components/modals/CommentModal.js

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

// --- Sub-componente para mostrar un item de comentario ---
// Lo mantenemos aquí porque solo se usa dentro de este modal.
const CommentItem = ({ comment }) => (
    <View style={styles.commentItemContainer}>
        <Image 
            source={comment.userImage ? { uri: comment.userImage } : require('../../assets/LOGO_SIMBOLO_VERDE.png')} 
            style={styles.commentUserImage}
        />
        <View style={styles.commentTextContainer}>
            <Text style={styles.commentUserName}>{comment.userName || 'Usuario'}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
        </View>
    </View>
);

// --- Componente principal del Modal de Comentarios ---
const CommentModal = ({ 
    isVisible, 
    onClose, 
    onCommentSubmit, 
    commentText, 
    setCommentText, 
    comments, 
    isSubmitting, 
    loadingComments 
}) => {
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            style={styles.modal}
            avoidKeyboard // Es importante para que el teclado no tape el input
        >
            <View style={[styles.modalContainer, styles.commentModalContainer]}>
                <Text style={styles.modalTitle}>Comentarios</Text>
                
                {/* Muestra un indicador de carga mientras se obtienen los comentarios */}
                {loadingComments ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#43A89B" />
                        <Text style={styles.loadingText}>Cargando comentarios...</Text>
                    </View>
                ) : (
                    // Muestra la lista de comentarios
                    <FlatList
                        data={comments}
                        renderItem={({ item }) => <CommentItem comment={item} />}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        style={styles.commentList}
                        ListEmptyComponent={<Text style={styles.emptyListText}>Aún no hay comentarios. ¡Sé el primero!</Text>}
                    />
                )}

                {/* Área para escribir y enviar un nuevo comentario */}
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
                        disabled={isSubmitting} // Deshabilita el botón durante el envío
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

// Estilos específicos para este componente
const styles = StyleSheet.create({
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
        marginBottom: 15,
        alignSelf: 'flex-start' // Alinear a la izquierda
    },
    commentModalContainer: {
        height: '80%', // Ocupa una buena parte de la pantalla
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
        backgroundColor: '#a9d4cf' // Color más claro cuando está deshabilitado
    }
});

export default CommentModal;