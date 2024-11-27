import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCmLaPANFQHuofD4xMdx3TZb2euTB8LY5w",
  authDomain: "applistvideos.firebaseapp.com",
  projectId: "applistvideos",
  storageBucket: "applistvideos.firebasestorage.app",
  messagingSenderId: "138785709757",
  appId: "1:138785709757:web:30dbca8ac2bcd95a3b21d4",
  measurementId: "G-TM75PD198X"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportar la instancia de autenticación y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
