// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import { collection, getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb6wDe1y1VR0mPonPXUV48XKNaMEIDWo4",
  authDomain: "disclone-73247.firebaseapp.com",
  projectId: "disclone-73247",
  storageBucket: "disclone-73247.appspot.com",
  messagingSenderId: "334201914719",
  appId: "1:334201914719:web:2c428c989ae05af4ea62ea",
  measurementId: "G-2H1JN7DZF8",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }

const db = getFirestore(app);

console.log(collection(db, "calls"));

export { db };
