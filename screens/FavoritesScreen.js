import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../firebaseconfig';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons';

const FavoriteScreen = () => {
  const [videos, setVideos] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const auth = getAuth();

  useEffect(() => {
    fetchFavoriteVideos();
  }, [auth.currentUser?.uid]);
  
  const fetchFavoriteVideos = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'videos'), where('userId', '==', userId), where('isFavorite', '==', true));
      const querySnapshot = await getDocs(q);
      const favoriteList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(favoriteList);
    }
  };

  const handleToggleFavorite = async (id, isFavorite) => {
    try {
      const videoRef = doc(db, 'videos', id);
      await updateDoc(videoRef, { isFavorite: !isFavorite });
      fetchFavoriteVideos();
    } catch (error) {
      console.error('Error al actualizar el video como favorito: ', error.message);
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
  
      // Actualiza el estado local en `FavoritesScreen` después de la eliminación en Firestore
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
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

  return (
    <View style={styles.container}>
      {isFullScreen ? (
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseFullScreen}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fefae0',
    flex: 1,
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
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
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
    borderColor: '#ffffff',
    borderWidth: 1,
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

export default FavoriteScreen;
