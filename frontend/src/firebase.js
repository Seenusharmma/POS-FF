import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAKWtp1-MG9G3aclNOTo4t4xCMOslOvazk",
  authDomain: "food-fantasy-26e65.firebaseapp.com",
  projectId: "food-fantasy-26e65",
  storageBucket: "food-fantasy-26e65.firebasestorage.app",
  messagingSenderId: "141220621227",
  appId: "1:141220621227:web:72222a545d0dc4c20300ee"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
