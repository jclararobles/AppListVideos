// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Text } from 'react-native'; // Importa el componente Text si necesitas mostrar texto

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
    return <Text>Cargando...</Text>; // Muestra un texto de carga si es necesario
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
