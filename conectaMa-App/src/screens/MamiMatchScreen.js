import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAllEncargos, getEncargosByUser, getContraofertasByUser, terminarEncargoAnfitrion, endEncargoColaborador } from '../services/EncargoService';
import { useUser } from '../context/UserContext';
import CreateEncargoModal from '../components/modals/CreateEncargoModal';
import OfertaEncargoModal from '../components/modals/OfertaEncargoModal';
import OfertasModal from '../components/modals/OfertasModal';
import ChatModal from '../components/modals/ChatModal';
import ValoracionAnfitrionModal from '../components/modals/ValoracionAnfitrionModal';
import ValoracionColaboradorModal from '../components/modals/ValoracionColaboradorModal';
import { getDatabase, ref, get } from "firebase/database";

const MamiMatchScreen = () => {
  const [activeTab, setActiveTab] = useState('encargosDisponibles');
  const [encargos, setEncargos] = useState([]);
  const [tusEncargos, setTusEncargos] = useState([]);
  const [tusOfertas, setTusOfertas] = useState([]);
  const [isCreateEncargoModalVisible, setCreateEncargoModalVisible] = useState(false);
  const [isOfertaEncargoModalVisible, setOfertaEncargoModalVisible] = useState(false);
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  const [isOfertasModalVisible, setOfertasModalVisible] = useState(false);
  const [isValoracionAnfitrionModalVisible, setValoracionAnfitrionModalVisible] = useState(false);
  const [isValoracionColaboradorModalVisible, setValoracionColaboradorModalVisible] = useState(false);
  const [selectedEncargoId, setSelectedEncargoId] = useState(null);
  const [selectedContraofertas, setSelectedContraofertas] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedFechaEncargo, setSelectedFechaEncargo] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'tusEncargos') {
      tusEncargos.forEach(([key, encargo]) => {
        const fechaEncargo = new Date(encargo.fechaEncargo);
        const ahora = new Date();
        if (fechaEncargo <= ahora) {
          if(encargo.endAnfitrion !== true) {
            console.log("valorando anfitrion");
            setSelectedEncargoId(key);
            setValoracionAnfitrionModalVisible(true);
          } else {
            terminarEncargoAnfitrion(key);
          }
        }
      });
    } else if (activeTab === 'tusOfertas') {
      tusOfertas.forEach(([key, oferta]) => {
        const fechaEncargo = new Date(oferta.fechaEncargo);
        const ahora = new Date();
        if (fechaEncargo <= ahora) {
          if(oferta.endColaborador !== true && oferta.estado === "aceptada") {
            console.log("valorando colaborador");
            setSelectedEncargoId(oferta.encargoId);
            setValoracionColaboradorModalVisible(true);
          } else {
            endEncargoColaborador(oferta.encargoId);
          }
        }
      });
    }
  }, [activeTab, tusEncargos, tusOfertas]);

  const fetchData = async () => {
    if (activeTab === 'encargosDisponibles') {
      const data = await getAllEncargos();
      console.log(Object.entries(data));
      setEncargos(Object.entries(data));
    } else if (activeTab === 'tusEncargos') {
      const data = await getEncargosByUser(user.uid);

      setTusEncargos(Object.entries(data));
   
    } else if (activeTab === 'tusOfertas') {
      const data = await getContraofertasByUser(user.uid);
      setTusOfertas(Object.entries(data));
    }
  };

  const renderEncargos = (encargos) => (
    encargos.map(([key, encargo]) => (
      <Card key={key} style={styles.card}>
        <Card.Content>
          <Text>{encargo.descripcion}</Text>
          <Text>{encargo.ubicacion}</Text>
          <Text>{encargo.oferta}</Text>
          {activeTab === 'encargosDisponibles' && (
            <Button title="Realizar Oferta" onPress={() => handleOffer(encargo, key)} />
          )}
          {activeTab === 'tusEncargos' && (
            <>
              <Button title="Ver Ofertas" onPress={() => handleViewOfertas(encargo.contraofertas, key, encargo.fechaEncargo)} />
              {encargo.estado === 'en curso' && (
                <TouchableOpacity style={styles.chatIcon} onPress={() => handleOpenChat(encargo, key)}>
                  <Icon name="chat" size={24} color="#000" />
                </TouchableOpacity>
              )}
            </>
          )}
          {activeTab === 'tusOfertas' && encargo.estado === 'aceptada' && (
            <TouchableOpacity style={styles.chatIcon} onPress={() => handleOpenChat(encargo, key)}>
              <Icon name="chat" size={24} color="#000" />
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    ))
  );

  const handleOffer = (encargo, encargoId) => {
    setSelectedEncargoId(encargoId);
    setSelectedFechaEncargo(encargo.fechaEncargo);
    setOfertaEncargoModalVisible(true);
  };

  const handleViewOfertas = (contraofertas, encargoId, fechaEncargo) => {
    const contraofertasArray = Object.entries(contraofertas || {}).map(([id, data]) => ({ id, ...data }));
    setSelectedContraofertas(contraofertasArray);
    setSelectedEncargoId(encargoId);
    setSelectedFechaEncargo(fechaEncargo);
    setOfertasModalVisible(true);
  };

  const handleCreateEncargo = () => {
    setCreateEncargoModalVisible(true);
  };

  const closeCreateEncargoModal = () => {
    setCreateEncargoModalVisible(false);
    fetchData();
  };

  const closeOfertaEncargoModal = () => {
    setOfertaEncargoModalVisible(false);
  };

  const closeOfertasModal = () => {
    setOfertasModalVisible(false);
  };

  const closeValoracionAnfitrionModal = () => {
    setValoracionAnfitrionModalVisible(false);
  };

  const closeValoracionColaboradorModal = () => {
    setValoracionColaboradorModalVisible(false);
  };

  const handleOpenChat = (encargo, encargoId) => {
    setSelectedEncargoId(encargoId);
    setSelectedChatId(encargo.chat);
    setChatModalVisible(true);
  };

  const closeChatModal = () => {
    setChatModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setActiveTab('encargosDisponibles')} style={styles.headerButton}>
          <Text style={styles.headerText}>Encargos disponibles</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('tusEncargos')} style={styles.headerButton}>
          <Text style={styles.headerText}>Tus encargos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('tusOfertas')} style={styles.headerButton}>
          <Text style={styles.headerText}>Tus ofertas</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {activeTab === 'encargosDisponibles' && renderEncargos(encargos)}
        {activeTab === 'tusEncargos' && (
          <>
            {renderEncargos(tusEncargos)}
            <Button title="Crear Nuevo Encargo" onPress={handleCreateEncargo} />
          </>
        )}
        {activeTab === 'tusOfertas' && renderEncargos(tusOfertas)}
      </ScrollView>
      <CreateEncargoModal isVisible={isCreateEncargoModalVisible} onClose={closeCreateEncargoModal} />
      <OfertaEncargoModal
        visible={isOfertaEncargoModalVisible}
        onClose={closeOfertaEncargoModal}
        encargoId={selectedEncargoId}
        fechaEncargo={selectedFechaEncargo}
      />
      <OfertasModal
        visible={isOfertasModalVisible}
        onClose={closeOfertasModal}
        contraofertas={selectedContraofertas}
        encargoId={selectedEncargoId}
        fechaEncargo={selectedFechaEncargo}
      />
      <ChatModal visible={isChatModalVisible} onClose={closeChatModal} chatId={selectedChatId} />
      <ValoracionAnfitrionModal visible={isValoracionAnfitrionModalVisible} onClose={closeValoracionAnfitrionModal} encargoId={selectedEncargoId} />
      <ValoracionColaboradorModal visible={isValoracionColaboradorModalVisible} onClose={closeValoracionColaboradorModal} encargoId={selectedEncargoId} />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#f8f8f8',
      paddingVertical: 10,
    },
    headerButton: {
      flex: 1,
      alignItems: 'center',
    },
    headerText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      padding: 10,
    },
    card: {
      marginVertical: 5,
      padding: 10,
    },
    chatIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
  });
  
  export default MamiMatchScreen;
  