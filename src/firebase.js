import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVB3syXyUi-i4nOwfLPmy5EXZx0ab6YDc",
  authDomain: "grocery-e2819.firebaseapp.com",
  projectId: "grocery-e2819",
  storageBucket: "grocery-e2819.firebasestorage.app",
  messagingSenderId: "793211084634",
  appId: "1:793211084634:web:cc13c7a1bdf7967cafdd63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

