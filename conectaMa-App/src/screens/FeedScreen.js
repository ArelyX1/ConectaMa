// src/screens/FeedScreen.js

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { useUser } from '../context/UserContext';
// ✅ Se importan los servicios y componentes necesarios para el modal
import { getPublicacionesListener, getCommentsListener, addCommentToPublicacion } from '../services/FeedService'; 
import CrearPublicacionModal from '../components/modals/CrearPublicacionModal';
import PublicacionPropiaCard from '../components/PublicacionPropiaCard';
import PublicacionFeedCard from '../components/PublicacionFeedCard';
// ✅ Asumimos que CommentModal está en su propio archivo para ser reutilizable
import CommentModal from '../components/modals/CommentModal'; 

const FeedScreen = () => {
  const [activeTab, setActiveTab] = useState("publicaciones");
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publicaciones, setPublicaciones] = useState([]);
  
  const navigation = useNavigation();
  const { user } = useUser();

  // ✅ --- INICIO: LÓGICA DEL MODAL DE COMENTARIOS ---
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Efecto para escuchar comentarios de la publicación seleccionada
  useEffect(() => {
    if (selectedPublicacion) {
      setLoadingComments(true);
      const unsubscribe = getCommentsListener(selectedPublicacion.id, (commentsData) => {
        setComments(commentsData);
        setLoadingComments(false);
      });
      return () => unsubscribe(); // Limpieza al deseleccionar o desmontar
    }
  }, [selectedPublicacion]);

  // Handler para abrir el modal desde CUALQUIER tarjeta
  const handleOpenComments = (publicacion) => {
    setSelectedPublicacion(publicacion);
    setCommentModalVisible(true);
  };
  
  // Handler para cerrar el modal
  const handleCloseComments = () => {
    setCommentModalVisible(false);
    setSelectedPublicacion(null);
    setComments([]); // Limpiamos los comentarios
  };

  // Handler para enviar un nuevo comentario
  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !selectedPublicacion) return;
    
    setIsSubmitting(true);
    try {
      const commentData = {
        userId: user.uid,
        userName: user.nombres + ' ' + user.apellidos,
        userImage: user.profileImage || '',
        text: commentText.trim(),
      };
      await addCommentToPublicacion(selectedPublicacion.id, commentData);
      setCommentText('');
    } catch (error) {
      console.error("Error submitting comment: ", error);
      Alert.alert("Error", "No se pudo publicar tu comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // ✅ --- FIN: LÓGICA DEL MODAL DE COMENTARIOS ---


  // useEffect para cargar todas las publicaciones del feed
  useEffect(() => {
    const unsubscribe = getPublicacionesListener((data) => {
      setPublicaciones(data);
      if (loading) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filtros de publicaciones (sin cambios)
  const tusPublicaciones = useMemo(() => 
    publicaciones.filter(p => p.uidUsuario === user.uid),
    [publicaciones, user.uid]
  );

  const otrasPublicaciones = useMemo(() =>
    publicaciones.filter(p => p.uidUsuario !== user.uid),
    [publicaciones, user.uid]
  );

  const handleCreateButtonPress = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);
  const handleBackPress = () => navigation.goBack();

  const renderSwitchButtons = () => (
    <View style={styles.switchContainer}>
      <TouchableOpacity
        style={[styles.switchButton, activeTab === "publicaciones" && styles.switchButtonActive]}
        onPress={() => setActiveTab("publicaciones")}
      >
        <Text style={[styles.switchButtonText, activeTab === "publicaciones" && styles.switchButtonTextActive]}>
          Publicaciones
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.switchButton, activeTab === "tusPublicaciones" && styles.switchButtonActive]}
        onPress={() => setActiveTab("tusPublicaciones")}
      >
        <Text style={[styles.switchButtonText, activeTab === "tusPublicaciones" && styles.switchButtonTextActive]}>
          Tus Publicaciones
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = (message) => (
      <View style={styles.emptyContainer}>
          <Text style={styles.placeholderText}>{message}</Text>
      </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (sin cambios) */}
      <View style={styles.topSection}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <AntDesign name="left" size={24} color="#43A89B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mami Match</Text>
        </View>
        <Image source={require("../assets/LOGO_SIMBOLO_VERDE.png")} style={styles.logo}/>
      </View>

      {renderSwitchButtons()}

      <View style={styles.mainContent}>
        {loading ? (
            <ActivityIndicator size="large" color="#43A89B" style={{flex: 1}}/>
        ) : (
            activeTab === "publicaciones" ? (
              <FlatList
                data={otrasPublicaciones}
                // ✅ PublicacionFeedCard ya tiene su propia lógica interna para abrir el modal, la dejamos como está.
                renderItem={({ item }) => <PublicacionFeedCard publicacion={item} />}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={() => renderEmptyList("No hay publicaciones disponibles por ahora.")}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            ) : (
              <>
                <FlatList
                    data={tusPublicaciones}
                    // ✅ SOLUCIÓN: Pasamos la función `handleOpenComments` a la prop `onViewComments`.
                    renderItem={({ item }) => (
                      <PublicacionPropiaCard 
                        publicacion={item} 
                        onViewComments={() => handleOpenComments(item)} 
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={() => renderEmptyList("Aún no tienes publicaciones.")}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
                <TouchableOpacity style={styles.createButton} onPress={handleCreateButtonPress}>
                  <Text style={styles.createButtonText}>Crear Publicación</Text>
                </TouchableOpacity>
              </>
            )
        )}
      </View>

      <CrearPublicacionModal isVisible={isModalVisible} onClose={handleCloseModal} />
      
      {/* ✅ RENDERIZADO DEL MODAL DE COMENTARIOS */}
      {selectedPublicacion && (
        <CommentModal
          isVisible={isCommentModalVisible}
          onClose={handleCloseComments}
          onCommentSubmit={handleCommentSubmit}
          commentText={commentText}
          setCommentText={setCommentText}
          comments={comments}
          isSubmitting={isSubmitting}
          loadingComments={loadingComments}
        />
      )}
    </SafeAreaView>
  );
};

// ... (tus estilos sin cambios)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0", },
  topSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingVertical: 10, backgroundColor: "#fff", },
  headerLeft: { flexDirection: "row", alignItems: "center", },
  logo: { width: 40, height: 40, resizeMode: "contain", },
  backButton: { padding: 5, marginRight: 10, },
  headerTitle: { fontSize: 24, fontWeight: "normal", },
  mainContent: { backgroundColor: "#F4F4F0", margin: 10, borderRadius: 10, overflow: "hidden", flex: 1, },
  switchContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 10, backgroundColor: "white", borderRadius: 8, padding: 0, width: "90%", alignSelf: "center", },
  switchButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 16, alignItems: "center", borderRadius: 6, },
  switchButtonActive: { backgroundColor: "#43A89B", },
  switchButtonText: { fontSize: 16, color: "#1d1d1d", },
  switchButtonTextActive: { color: "white", },
  createButton: { backgroundColor: "#43A89B", margin: 15, padding: 15, borderRadius: 10, alignItems: "center", },
  createButtonText: { color: "#fff", fontSize: 24, fontWeight: "normal", },
  placeholderText: { textAlign: "center", fontSize: 16, color: "#888", },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, }
});

export default FeedScreen;