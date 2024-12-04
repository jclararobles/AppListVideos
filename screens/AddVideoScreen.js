import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, Modal, TouchableOpacity, Image, Switch, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../firebaseconfig';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons';

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
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

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
          await addDoc(collection(db, 'videos'), {
            userId,
            title,
            description,
            url,
            platform: isInstagram ? 'Instagram' : 'YouTube',
            thumbnail: thumbnailUrl,
            isFavorite: false, // Por defecto, no es favorito.
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

  const handleToggleFavorite = async (id, currentIsFavorite) => {
    try {
      const videoRef = doc(db, 'videos', id);
      await updateDoc(videoRef, { isFavorite: !currentIsFavorite });

      // Actualizar el estado local para reflejar el cambio inmediatamente
      fetchVideos();
    } catch (error) {
      console.error('Error al actualizar el video como favorito: ', error.message);
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
      fetchVideos(); // Refrescar la lista de videos después de la eliminación.
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

  return (
    <View style={styles.container}>
      {isFullScreen ? (
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseFullScreen}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => setIsFullScreen(false)}>
            <Text style={styles.backButtonText}>Volver</Text>
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
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.button, styles.playButton]} onPress={() => handlePlayVideo(item.url)}>
                    <Text style={styles.buttonText}>Reproducir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeleteVideo(item.id)}>
                    <Text style={styles.buttonText}>Eliminar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleToggleFavorite(item.id, item.isFavorite)}>
                    <FontAwesome name={item.isFavorite ? 'heart' : 'heart-o'} size={24} color={item.isFavorite ? 'red' : 'black'} />
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
                  <Text style={styles.switchLabel}>¿Es de Instagram?</Text>
                  <Switch
                    value={isInstagram}
                    onValueChange={setIsInstagram}
                    trackColor={{ true: '#fcbf49', false: '#eae2b7' }}
                    thumbColor="#003049"
                  />
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
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#003049',
  },
  platformText: {
    fontSize: 14,
    color: '#003049',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#007BFF',
    borderRadius: 30,
    padding: 10,
    zIndex: 10,
    borderColor: '#ffffff', // Borde blanco para mejor visibilidad
    borderWidth: 1, // Borde para definir el botón
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullScreenWebView: {
    flex: 1,
  },
});

export default AddVideoScreen;

