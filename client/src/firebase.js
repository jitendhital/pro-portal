// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "jiten-portal.firebaseapp.com",
  projectId: "jiten-portal",
  storageBucket: "jiten-portal.firebasestorage.app",
  messagingSenderId: "321414199240",
  appId: "1:321414199240:web:f7e3a943c6bacdad3072fd"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);