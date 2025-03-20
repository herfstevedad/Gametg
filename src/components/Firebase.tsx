import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyACol9LCc7_pl4dW7QRZfJYZv0asm9LCgs",
    authDomain: "test-db-6800e.firebaseapp.com",
    databaseURL: "https://test-db-6800e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "test-db-6800e",
    storageBucket: "test-db-6800e.firebasestorage.app",
    messagingSenderId: "836798784511",
    appId: "1:836798784511:web:108bf0f82a5760cb4e7dca"
};  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };