// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAIxRDsAQNG_IymHSR3O6YNBWxjwKYtUq0",
    authDomain: "hotel-management-a16f9.firebaseapp.com",
    projectId: "hotel-management-a16f9",
    storageBucket: "hotel-management-a16f9.firebasestorage.app",
    messagingSenderId: "282779117762",
    appId: "1:282779117762:web:9105acada88149bc50735b",
    measurementId: "G-C6KB9923DG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
// Export the initialized Firebase app, analytics, and Firestore database
export { app, analytics, db, auth };
// Export the initialized Firebase app, analytics, and Firestore database