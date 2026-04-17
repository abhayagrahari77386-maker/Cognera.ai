import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaLW3mlMpj-dQeuZHzpPfM1Np5Puow1Tg",
  authDomain: "cognera-ai.firebaseapp.com",
  projectId: "cognera-ai",
  storageBucket: "cognera-ai.firebasestorage.app",
  messagingSenderId: "637069135003",
  appId: "1:637069135003:web:b7ee35ed595399349c4a3e",
  measurementId: "G-7G4ZTFK0VS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Analytics (safely, as it might fail in some environments)
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(console.error);

export { app, analytics };
