import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddVideoScreen from '../screens/AddVideoScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ListsScreen from '../screens/ListsScreen';
import UserScreen from '../screens/UserScreen';

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Add Video" component={AddVideoScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Lists" component={ListsScreen} />
      <Tab.Screen name="User" component={UserScreen} />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
