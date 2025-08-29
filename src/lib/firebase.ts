// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "konvele-connect",
  "appId": "1:192005480765:web:ad2d7757473b6d828aa554",
  "storageBucket": "konvele-connect.firebasestorage.app",
  "apiKey": "AIzaSyAVxsqHbb5Ie6xlDaLz9ahXZxY96ys2Np4",
  "authDomain": "konvele-connect.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "192005480765"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
