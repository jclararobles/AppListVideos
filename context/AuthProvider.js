import React, { createContext, useContext, useState, useEffect } from 'react';
import { Text } from 'react-native'; // Importa el componente Text si es necesario

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      setUserId('12345'); // Simulación de la obtención del userId
    };
    fetchUserId();
  }, []);

  if (userId === null) {
    return <Text>Cargando...</Text>; // Usa <Text> para mostrar el mensaje de carga
  }

  return (
    <AuthContext.Provider value={{ userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
