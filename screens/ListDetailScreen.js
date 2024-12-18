import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../firebaseconfig';
import { collection, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';  // Importar useFocusEffect

const ListDetailScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const auth = getAuth();

  useFocusEffect(
    React.useCallback(() => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const q = query(collection(db, 'videos'), where('userId', '==', userId));

        // Usamos onSnapshot para recibir actualizaciones en tiempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setVideos(videoList);
        });

        // Limpiar el listener cuando el componente se desmonte o cuando se pierda el foco
        return () => unsubscribe();
      }
    }, [auth.currentUser?.uid])
  );

  const handlePlayVideo = (url) => {
    setSelectedUrl(url);
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setSelectedUrl('');
  };

  const handleDeleteVideo = (id) => {
    Alert.alert(
      "Eliminar Video",
      "¿Estás seguro de que deseas eliminar este video?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'videos', id));
            } catch (error) {
              console.error('Error eliminando el video: ', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
  {isFullScreen ? (
    <View style={styles.fullScreenContainer}>
      <WebView source={{ uri: selectedUrl }} style={styles.fullScreenWebView} />
    </View>
  ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.videoItem}>
              <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
              <Text style={styles.videoTitle}>{item.title}</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
              <TouchableOpacity style={styles.playButton} onPress={() => handlePlayVideo(item.url)}>
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteVideo(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {/* Botón para regresar a la pantalla anterior */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>GoBack </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fefae0',
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 40,  // Aumentar el tamaño de la cruz
    color: '#fff',  // Mantener el color blanco para alto contraste
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 1)',  // Fondo oscuro para que resalte
    borderRadius: 15,  // Bordes redondeados para darle un toque más suave
    padding: 10,  // Un poco de espacio alrededor de la cruz
  },
  closeButtonModal: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 30,
    color: '#003049',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 40,  // Aumentar el tamaño de la cruz
    color: '#fff',  // Mantener blanco para alto contraste
  },
  fullScreenWebView: {
    flex: 1,
  },
  videoItem: {
    marginBottom: 20,
    backgroundColor: '#e9edc9',
    borderRadius: 8,
    padding: 10,
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#003049', // Color más oscuro para el título
    textAlign: 'center', // Centrar el título
    backgroundColor: '#fcbf49', // Fondo dorado para el título
    paddingVertical: 5,
    borderRadius: 5, // Bordes redondeados
  },
  descriptionText: {
    fontSize: 16,  // Mantener un tamaño de fuente adecuado para leer fácilmente
    color: '#333',  // Color de texto más suave (gris oscuro) para evitar el contraste demasiado fuerte
    marginBottom: 15,  // Margen inferior para separar de otros elementos
    lineHeight: 22,  // Mejorar el espaciado entre las líneas
    textAlign: 'justify',  // Justificar el texto para darle un aspecto más ordenado
    padding: 15,  // Añadir padding para no pegar el texto a los bordes
    backgroundColor: '#fafafa',  // Fondo muy suave (blanco roto) para resaltar sin ser agresivo
    borderRadius: 8,  // Bordes redondeados para suavizar la apariencia
    shadowColor: '#000',  // Color de la sombra (ligera)
    shadowOpacity: 0.05,  // Opacidad baja para una sombra sutil
    shadowRadius: 4,  // Radio de la sombra
    shadowOffset: { width: 0, height: 2 },  // Desplazamiento de la sombra
    elevation: 2,  // Elevación para crear una pequeña sensación de profundidad
  },
  playButton: {
    backgroundColor: '#ccd5ae',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#fcbf49',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fefae0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListDetailScreen;
