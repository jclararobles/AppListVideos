import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Button, TextInput } from 'react-native';
import { db } from '../firebaseconfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ListsScreen = () => {
  const [videos, setVideos] = useState([]);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const auth = getAuth();

  // Fetch videos from the database
  useEffect(() => {
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
    fetchVideos();
  }, [auth.currentUser?.uid]);

  // Handle adding a new list
  const handleCreateList = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId && newListName) {
        const listRef = await addDoc(collection(db, 'lists'), {
          userId,
          name: newListName,
          videos: selectedVideos,
        });
        setLists([...lists, { id: listRef.id, name: newListName, videos: selectedVideos }]);
        setNewListName('');
        setSelectedVideos([]);
      }
    } catch (error) {
      console.error('Error creating list: ', error.message);
    }
  };

  // Handle selecting a video
  const handleSelectVideo = (video) => {
    if (selectedVideos.some((item) => item.id === video.id)) {
      setSelectedVideos(selectedVideos.filter((item) => item.id !== video.id));
    } else {
      setSelectedVideos([...selectedVideos, video]);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="New List Name"
        value={newListName}
        onChangeText={setNewListName}
        style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <Button title="Create List" onPress={handleCreateList} />

      <Text style={{ marginVertical: 10 }}>Select videos to add to the list:</Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text>{item.title}</Text>
            <Button
              title={selectedVideos.some((video) => video.id === item.id) ? 'Deselect' : 'Select'}
              onPress={() => handleSelectVideo(item)}
            />
          </View>
        )}
      />
      <Text style={{ marginVertical: 10 }}>Your Lists:</Text>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 5, borderBottomWidth: 1 }}>
            <Text>{item.name}</Text>
            <FlatList
              data={item.videos}
              keyExtractor={(video) => video.id}
              renderItem={({ item: video }) => <Text>- {video.title}</Text>}
            />
          </View>
        )}
      />
    </View>
  );
};

export default ListsScreen;
