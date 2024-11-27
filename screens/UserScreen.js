import React from 'react';
import { View, Text } from 'react-native';
import { getAuth } from 'firebase/auth';

const UserScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <View>
      <Text>Email: {user?.email}</Text>
      <Text>Password: {/* Aquí no se puede mostrar la contraseña por motivos de seguridad */}</Text>
    </View>
  );
};

export default UserScreen;
