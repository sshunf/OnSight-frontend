import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAC8ayNfoVsw8PBbvfZuCM_Aj-WhBaAnvg",
  authDomain: "onsight-6299c.firebaseapp.com",
  projectId: "onsight-6299c",
  storageBucket: "onsight-6299c.firebasestorage.app",
  messagingSenderId: "230196079759",
  appId: "1:230196079759:web:0021f458169fbfedbf14fa",
  measurementId: "G-S1M29TSPET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);