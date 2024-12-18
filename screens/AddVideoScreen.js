import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, Modal, TouchableOpacity, Image, Switch, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../firebaseconfig';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';


const AddVideoScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isInstagram, setIsInstagram] = useState(false);
  const [videos, setVideos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const auth = getAuth();
  const [date, setDate] = useState(new Date().toLocaleString());

  // Formatear la fecha para mostrarla de forma legible
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString('es-ES', options);
    return formattedDate;
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchVideos();
    }, [])
  );

  const fetchVideos = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'videos'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(videoList);
    }
  };

  const handleAddVideo = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId && title && description && url) {
        const thumbnailUrl = isInstagram ? getInstagramThumbnail() : getYouTubeThumbnail(url);

        if (thumbnailUrl) {
          const currentDate = new Date();
          console.log("Fecha actual: ", currentDate); 

          await addDoc(collection(db, 'videos'), {
            userId,
            title,
            description,
            url,
            platform: isInstagram ? 'Instagram' : 'YouTube',
            thumbnail: thumbnailUrl,
            date: currentDate.toISOString(), 
          });

          setTitle('');
          setDescription('');
          setUrl('');
          setIsInstagram(false);
          setIsModalVisible(false);
          fetchVideos();
        } else {
          alert('Error al generar la miniatura');
        }
      } else {
        alert('Por favor, completa todos los campos');
      }
    } catch (error) {
      console.error('Error añadiendo el video: ', error.message);
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
      fetchVideos();
    } catch (error) {
      console.error('Error eliminando el video: ', error.message);
    }
  };

  const handlePlayVideo = (url) => {
    setSelectedUrl(url);
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setSelectedUrl('');
  };

  const getYouTubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : null;
  };

  const getInstagramThumbnail = () => {
    return Image.resolveAssetSource(require('../assets/instagram_thumbnail.jpg')).uri;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {isFullScreen ? (
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseFullScreen}>
            <Text style={styles.closeButtonText}>GoBack</Text>
          </TouchableOpacity>
          <WebView source={{ uri: selectedUrl }} style={styles.fullScreenWebView} />
        </View>
      ) : (
        <>
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.videoItem}>
                <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
                <Text style={styles.videoTitle}>{item.title}</Text>
                <Text style={styles.descriptionText}>{item.description}</Text>
                <Text style={styles.platformText}>Plataforma: {item.platform}</Text>
                {/* Aquí se formatea la fecha */}
                            <Text style={styles.videoItem}>
              <Text style={styles.dateContainer}>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              </Text>
            </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.button, styles.playButton]} onPress={() => handlePlayVideo(item.url)}>
                    <Text style={styles.buttonText}>Play</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeleteVideo(item.id)}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <TouchableOpacity style={styles.fabButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
          <Modal visible={isModalVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButtonModal} onPress={() => setIsModalVisible(false)} />
                <TextInput
                  placeholder="Título"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  placeholderTextColor="#003049"
                />
                <TextInput
                  placeholder="Descripción"
                  value={description}
                  onChangeText={setDescription}
                  style={styles.input}
                  placeholderTextColor="#003049"
                />
                <TextInput
                  placeholder="URL"
                  value={url}
                  onChangeText={setUrl}
                  style={styles.input}
                  placeholderTextColor="#003049"
                />
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Select YouTube or Instagram</Text>
                  <Switch
                    value={isInstagram}
                    onValueChange={setIsInstagram}
                    trackColor={{ true: '#fcbf49', false: '#eae2b7' }}
                    thumbColor="#003049"
                  />
                  <Text style={styles.switchLabel}>{isInstagram ? "Instagram" : "YouTube"}</Text>
                </View>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddVideo}>
                    <Text style={styles.buttonText}>Añadir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fefae0',
    flex: 1,
    position: 'relative',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#d4a373',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
  },
  fabText: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 48, 73, 0.8)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#faedcd',
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccd5ae',
    marginBottom: 10,
    padding: 10,
    fontSize: 16,
    color: '#003049',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    marginRight: 10,
    color: '#003049',
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    backgroundColor: '#d4a373',
  },
  cancelButton: {
    backgroundColor: '#e9edc9',
  },
  playButton: {
    backgroundColor: '#ccd5ae',
  },
  deleteButton: {
    backgroundColor: '#d62828',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoItem: {
    marginBottom: 20,
    backgroundColor: '#e9edc9',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
  platformText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#003049',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-start',  // Alineación a la izquierda
    marginBottom: 10,
    marginLeft:0 // Ajuste el margen izquierdo si necesitas más espacio
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
 
  fullScreenWebView: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    bottom: -20,
    left: 0, // Asegura que el botón esté alineado al borde izquierdo
    width: '100%', // Ocupa todo el ancho de la pantalla
    backgroundColor: '#fcbf49',
    paddingVertical: 10, // Ajusta el padding para un mejor aspecto
    paddingHorizontal: 20, // Ajusta el padding horizontal si es necesario
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Asegúrate de que el botón esté por encima de otros elementos
  },
  
  closeButtonText: {
    color: '#fefae0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',  // Alinea a la derecha
    marginTop: 10,
  },
  
  dateText: {
    fontSize: 14,
    color: '#003049',
    fontStyle: 'italic',
    padding: 5,
    borderRadius: 5,  // Bordes redondeados
    marginRight: 10,  // Margen derecho
  },
  
  
});

export default AddVideoScreen;

