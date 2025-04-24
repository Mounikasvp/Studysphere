import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";


const config = {
  apiKey: "AIzaSyDfyMPdcT4v6fgGbX8YVBHjSqsTvZyn9z0",
  authDomain: "studysphere-5b220.firebaseapp.com",
  projectId: "studysphere-5b220",
  storageBucket: "studysphere-5b220.appspot.com",
  messagingSenderId: "1069045292091",
  appId: "1:1069045292091:web:361d42e03ee5bf1382501e",
  measurementId: "G-8593EP44EP",
  databaseURL: "https://studysphere-5b220-default-rtdb.firebaseio.com/",
};

const app = initializeApp(config);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Realtime Database
const database = getDatabase(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

// Export the Firebase services
export { auth, database, storage, analytics };
