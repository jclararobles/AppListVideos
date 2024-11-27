import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Button } from 'react-native';
import { db } from '../firebaseconfig';
import { collection, query, where, getDocs, addDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FavoritesScreen = () => {
  const [videos, setVideos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const auth = getAuth();

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

  const handleAddToFavorites = async (video) => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        await addDoc(collection(db, 'favorites'), {
          userId,
          videoId: video.id,
        });
        setFavorites([...favorites, video]);
      }
    } catch (error) {
      console.error('Error adding to favorites: ', error.message);
    }
  };

  return (
    <View>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Button title="Add to Favorites" onPress={() => handleAddToFavorites(item)} />
          </View>
        )}
      />
    </View>
  );
};

export default FavoritesScreen;
