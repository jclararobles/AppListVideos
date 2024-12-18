import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddVideoScreen from '../screens/AddVideoScreen';
import ListsScreen from '../screens/ListsScreen';
import UserScreen from '../screens/UserScreen';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importar Iconos

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#fcbf49', // Color activo
        tabBarInactiveTintColor: '#d4a373', // Color inactivo
        tabBarStyle: {
          backgroundColor: '#003049', // Fondo del Tab Bar
        },
      }}
    >
      <Tab.Screen
        name="Favorites"
        component={AddVideoScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart" size={size} color={color} /> // Icono de corazón
          ),
        }}
      />
      <Tab.Screen
        name="Lists"
        component={ListsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" size={size} color={color} /> // Icono de lista
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} /> // Icono de usuario
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
