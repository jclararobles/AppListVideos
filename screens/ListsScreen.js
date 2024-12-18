import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseconfig'; // Asegúrate de importar tu configuración de Firebase.
import { useFocusEffect } from '@react-navigation/native';

const ListsScreen = ({ navigation }) => {
  const [lists, setLists] = useState([]); // Almacena las listas del usuario
  const [isModalVisible, setIsModalVisible] = useState(false); // Controla la visibilidad del modal
  const [title, setTitle] = useState(''); // Título de la lista a crear
  const [selectedVideos, setSelectedVideos] = useState([]); // Videos seleccionados para la lista
  const [allVideos, setAllVideos] = useState([]); // Todos los videos disponibles

  // Función para obtener las listas del usuario
  const fetchLists = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'lists'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const userLists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLists(userLists);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchLists(); // Actualiza las listas cada vez que la pantalla se enfoque
      fetchVideos(); // Actualiza los videos disponibles
    }, [])
  );

  useEffect(() => {
    fetchVideos();

    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'lists'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userLists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLists(userLists);
      });

      // Limpiar el listener cuando el componente se desmonte
      return () => unsubscribe();
    }
  }, []); // Fetch de listas y videos al iniciar la pantalla

  // Obtener los videos del usuario actual
  const fetchVideos = async () => {
    const userId = auth.currentUser?.uid;
    const q = query(collection(db, 'videos'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const userVideos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllVideos(userVideos);
  };

  // Crear una nueva lista en la base de datos
  const handleCreateList = async () => {
    const userId = auth.currentUser?.uid;
    if (userId && title && selectedVideos.length > 0) {
      await addDoc(collection(db, 'lists'), {
        userId,
        title,
        videos: selectedVideos,
      });
      setIsModalVisible(false); // Cierra el modal después de crear la lista
      setTitle('');  // Resetea el título
      setSelectedVideos([]);  // Resetea los videos seleccionados

      // Forzar la actualización de la lista de listas después de crear una nueva
      fetchLists();
    } else {
      alert('Completa todos los campos y selecciona al menos un video');
    }
  };

  // Eliminar una lista
  const handleDeleteList = async (listId) => {
    Alert.alert(
      'Eliminar lista',
      '¿Estás seguro de que deseas eliminar esta lista?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            const listRef = doc(db, 'lists', listId);
            await deleteDoc(listRef);
          },
        },
      ]
    );
  };

  // Eliminar un video de la lista de videos seleccionados
  const handleRemoveVideo = (videoId) => {
    setSelectedVideos(prevSelectedVideos =>
      prevSelectedVideos.filter(video => video.id !== videoId)
    );
  };

  // Cerrar el modal sin crear una lista
  const handleCloseModal = () => {
    setIsModalVisible(false);  // Cierra el modal cuando el usuario hace clic en "Cancelar"
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Create List</Text>
      </TouchableOpacity>

      <FlatList
        data={lists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ListDetailScreen', { list: item })}
            >
              <Text style={styles.listTitle}>{item.title}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteList(item.id)}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="List Title"
            value={title}
            onChangeText={setTitle}
          />
          <FlatList
            data={allVideos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity
                  style={[
                    styles.videoItem,
                    selectedVideos.some(video => video.id === item.id) && styles.selectedVideo,
                  ]}
                  onPress={() => {
                    setSelectedVideos(prev =>
                      prev.some(video => video.id === item.id)
                        ? prev.filter(video => video.id !== item.id)
                        : [...prev, item]
                    );
                  }}
                >
                  <Text>{item.title}</Text>
                </TouchableOpacity>

                {selectedVideos.some(video => video.id === item.id) && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveVideo(item.id)}
                  >
                    <Text></Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateList}>
            <Text style={styles.buttonText}>Save List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonCancel} onPress={handleCloseModal}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fefae0' },
  button: { backgroundColor: '#fcbf49', padding: 12, borderRadius: 8, marginVertical: 10 },
  buttonCancel: { backgroundColor: '#d4a373', padding: 12, borderRadius: 8, marginVertical: 10 },
  buttonText: { color: '#003049', textAlign: 'center', fontWeight: 'bold' },
  listItem: { padding: 16, borderBottomWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#003049' },
  deleteButton: { backgroundColor: '#fcbf49', padding: 8, borderRadius: 4 },
  deleteButtonText: { color: 'white' },
  modalContainer: { flex: 1, padding: 16, backgroundColor: '#fefae0' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 20, borderRadius: 4 },
  videoItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  selectedVideo: { backgroundColor: '#fcbf49' },
});

export default ListsScreen;
