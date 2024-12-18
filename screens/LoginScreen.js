import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../firebaseconfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Toast from 'react-native-toast-message'; // Importar Toast

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginOrRegister = async () => {
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigation.navigate('AddVideoScreen');
    } catch (error) {
      const errorMessage = error.message;

      // Manejar error de contraseña débil
      if (errorMessage.includes('auth/weak-password')) {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Weak password',
          text2: 'Password should be at least 6 characters long.',
          visibilityTime: 4000,
        });
      } 
      // Manejar error de email inválido
      else if (errorMessage.includes('auth/invalid-email')) {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Invalid email',
          text2: 'Please enter a valid email address.',
          visibilityTime: 4000,
        });
      }
      // Manejar otros errores genéricos
      else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: errorMessage,
          visibilityTime: 4000,
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegistering ? 'Register' : 'Login'}</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLoginOrRegister}>
        <Text style={styles.buttonText}>{isRegistering ? 'Register' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchText}>
          {isRegistering ? 'Switch to Login' : 'Switch to Register'}
        </Text>
      </TouchableOpacity>

      {/* Agregar el Toast aquí */}
      <Toast />
    </View>
  );
}

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
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#003049', // Título en color oscuro
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4a373', // Borde de los inputs con color más cálido
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fcbf49', // Botón de color amarillo cálido
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#003049', // Texto del botón en color oscuro
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#003049', // Texto para el cambio entre login y registro en color oscuro
    fontSize: 16,
    marginTop: 10,
  },
});
