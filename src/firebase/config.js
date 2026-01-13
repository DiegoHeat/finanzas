// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3ua-82QAogjG7H145mCZ7mDi78MdeenI",
  authDomain: "finanzas-74d5a.firebaseapp.com",
  projectId: "finanzas-74d5a",
  storageBucket: "finanzas-74d5a.firebasestorage.app",
  messagingSenderId: "65101496406",
  appId: "1:65101496406:web:38541a6d5dd7da3d417bf7",
  measurementId: "G-R9JE9P1NFB"
};

// Initialize Firebase
let app
let auth
let db

try {
  app = initializeApp(firebaseConfig);
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase inicializado correctamente');
} catch (error) {
  console.error('Error inicializando Firebase:', error);
  // Crear objetos dummy para que la app no se rompa
  app = null;
  auth = null;
  db = null;
}

export { auth, db };
export default app;
