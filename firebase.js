import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDp_tfDDL5weoyBcs3_OknW0wNLM8PVQrQ",
  authDomain: "ramesh-fun-hub.firebaseapp.com",
  projectId: "ramesh-fun-hub",
  storageBucket: "ramesh-fun-hub.firebasestorage.app",
  messagingSenderId: "670023868444",
  appId: "1:670023868444:web:7f1f2bc88408fb3ad53fd9"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
