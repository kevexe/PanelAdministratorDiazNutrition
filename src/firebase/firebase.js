import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // IMPORTANTE: Agregamos esto
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqCdzyTXBHm8azN4vzeWyTPxFse04UQ64",
  authDomain: "teamdiaz-e2b1a.firebaseapp.com",
  projectId: "teamdiaz-e2b1a",
  storageBucket: "teamdiaz-e2b1a.firebasestorage.app",
  messagingSenderId: "857317153709",
  appId: "1:857317153709:web:44375fb8469f6af3a49f24",
  measurementId: "G-GWHX1J7S0X"
};

// Inicializamos la App
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// EXPORTAMOS LA BASE DE DATOS (Sin esto, la app desaparece)
export const db = getFirestore(app);
export const auth = getAuth(app);