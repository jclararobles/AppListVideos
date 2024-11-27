import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, Modal, TouchableOpacity, Image, Switch, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../firebaseconfig';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const AddVideoScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isInstagram, setIsInstagram] = useState(false);
  const [videos, setVideos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'videos'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const videoList = [];
      querySnapshot.forEach((doc) => {
        videoList.push({ id: doc.id, ...doc.data() });
      });
      setVideos(videoList);
    }
  };

  const handleAddVideo = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId && title && description && url) {
        let thumbnailUrl = null;

        if (!isInstagram) {
          thumbnailUrl = getYouTubeThumbnail(url);
        } else {
          thumbnailUrl = getInstagramThumbnail(url);
        }

        if (thumbnailUrl) {
          await addDoc(collection(db, 'videos'), {
            userId,
            title,
            description,
            url,
            platform: isInstagram ? 'Instagram' : 'YouTube',
            thumbnail: thumbnailUrl,
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
        alert('Please fill in all fields');
      }
    } catch (error) {
      console.error('Error adding video: ', error.message);
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video: ', error.message);
    }
  };

  const handlePlayVideo = (url) => {
    setSelectedUrl(url);
    setIsWebViewVisible(true);
  };

  const handleCloseWebView = () => {
    setIsWebViewVisible(false);
    setSelectedUrl('');
  };

  const getYouTubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    if (match && match[1]) {
      const videoId = match[1];
      return `https://img.youtube.com/vi/${videoId}/0.jpg`;
    }
    return null;
  };

  const getInstagramThumbnail = (url) => {
    return 'https://via.placeholder.com/200';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor="#003049" />
            <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} placeholderTextColor="#003049" />
            <TextInput placeholder="URL" value={url} onChangeText={setUrl} style={styles.input} placeholderTextColor="#003049" />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Is it from Instagram?</Text>
              <Switch value={isInstagram} onValueChange={setIsInstagram} trackColor={{ true: '#fcbf49', false: '#eae2b7' }} thumbColor="#003049" />
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddVideo}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isWebViewVisible && (
        <View style={styles.webViewContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseWebView}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <WebView source={{ uri: selectedUrl }} style={styles.webView} />
        </View>
      )}

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const thumbnailUrl = item.platform === 'YouTube' ? getYouTubeThumbnail(item.url) : getInstagramThumbnail(item.url);
          return (
            <View style={styles.videoItem}>
              {thumbnailUrl && <Image source={{ uri: thumbnailUrl }} style={styles.videoThumbnail} />}
              <Text style={styles.videoTitle}>{item.title}</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
              <Text style={styles.platformText}>Platform: {item.platform}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.playButton]} onPress={() => handlePlayVideo(item.url)}>
                  <Text style={styles.buttonText}>Play</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeleteVideo(item.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#eae2b7',
    flex: 1,
  },
  addButton: {
    width: 60,
    height: 60,
    backgroundColor: '#f77f00',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003049',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  addButtonText: {
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
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#003049',
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
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#f77f00',
  },
  cancelButton: {
    backgroundColor: '#003049',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 3,
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003049',
  },
  descriptionText: {
    fontSize: 14,
    color: '#003049',
    marginBottom: 5,
  },
  platformText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playButton: {
    backgroundColor: '#003049',
  },
  deleteButton: {
    backgroundColor: '#e63946',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  closeButton: {
    backgroundColor: '#f77f00',
    padding: 10,
    alignSelf: 'flex-end',
    borderRadius: 5,
    margin: 15,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  webView: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default AddVideoScreen;