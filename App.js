import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import BottomTabNavigator from './components/BottomTabNavigator';
import ListsScreen from './screens/ListsScreen'; // Importar ListsScreen
import ListDetailScreen from './screens/ListDetailScreen'; // Importar ListDetailScreen
import AddVideoScreen from './screens/AddVideoScreen';
import { AuthProvider } from './context/AuthContext';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {!user ? (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen
                name="Main"
                component={BottomTabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ListsScreen"
                component={ListsScreen}
                options={{ title: 'Lists' }}
              />
              <Stack.Screen
                name="ListDetailScreen"
                component={ListDetailScreen}
                options={{ title: 'List Details' }}
              />
              <Stack.Screen
                name="AddVideoScreen"
                component={AddVideoScreen}
                options={{ title: 'Add Video' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
