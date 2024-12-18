import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';

const UserScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Details </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Email: {user ? user.email : 'No disponible'}</Text>
        <Text style={styles.infoText}>Password: {'******'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fefae0', // Fondo claro
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003049', // Título en color oscuro
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    borderColor: '#d4a373',
    borderWidth: 1,
  },
  infoText: {
    fontSize: 18,
    color: '#003049', // Texto de la cuenta en color oscuro
    marginBottom: 10,
  },
  logoutButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fcbf49', // Botón de color amarillo cálido
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#003049', // Texto del botón de logout en color oscuro
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserScreen;
