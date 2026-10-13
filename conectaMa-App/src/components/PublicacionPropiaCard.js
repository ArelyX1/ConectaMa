// src/components/PublicacionPropiaCard.js

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const PublicacionPropiaCard = ({ publicacion, onViewComments }) => {
  const {
    nombreUsuario,
    imgUrlUsuario,
    fechaCreacion,
    imagenUrl,
    descripcion,
    precio,
    likes = 0, // Asumimos que 'likes' es un número, con 0 por defecto
  } = publicacion;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    return timestamp.toDate().toLocaleDateString('es-PE');
  };

  const formatPrice = (price) => {
    const number = parseFloat(price);
    if (isNaN(number)) return 'Precio no válido';
    return `S/ ${number.toFixed(2)}`;
  };

  // La función onViewComments se pasará como prop desde FeedScreen
  const handleViewComments = () => {
    if (onViewComments) {
      onViewComments(publicacion.id); // Pasamos el ID de la publicación
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* --- ENCABEZADO --- */}
      <View style={styles.headerContainer}>
        <Image
          source={imgUrlUsuario ? { uri: imgUrlUsuario } : require('../assets/LOGO_SIMBOLO_VERDE.png')}
          style={styles.userImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{nombreUsuario || 'Usuario Anónimo'}</Text>
          <Text style={styles.dateText}>{formatDate(fechaCreacion)}</Text>
        </View>
      </View>

      {/* --- IMAGEN PRINCIPAL --- */}
      <Image source={{ uri: imagenUrl }} style={styles.postImage} />

      {/* --- INFO Y ACCIONES --- */}
      <View style={styles.infoContainer}>
        <View style={styles.topInfoRow}>
            <Text style={styles.priceText}>{formatPrice(precio)}</Text>
            {/* --- CONTADOR DE LIKES --- */}
            <View style={styles.likesContainer}>
                <Ionicons name="heart" size={22} color="#C499E0" />
                <Text style={styles.likesCount}>{likes}</Text>
            </View>
        </View>

        <Text style={styles.descriptionText} numberOfLines={3} ellipsizeMode="tail">
          {descripcion}
        </Text>

        {/* --- BOTÓN DE COMENTARIOS --- */}
        <TouchableOpacity style={styles.actionButton} onPress={handleViewComments}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Ver Comentarios</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        elevation: 5,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    dateText: {
        fontSize: 12,
        color: '#888',
    },
    postImage: {
        width: '100%',
        aspectRatio: 16 / 9,
    },
    infoContainer: {
        padding: 12,
    },
    topInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#43A89B',
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCCEF0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
    },
    likesCount: {
        marginLeft: 5,
        fontWeight: 'bold',
        color: '#C499E0',
    },
    descriptionText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 12,
    },
    actionButton: {
        backgroundColor: '#C499E0', // Un color diferente para la acción interna
        borderRadius: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default PublicacionPropiaCard;