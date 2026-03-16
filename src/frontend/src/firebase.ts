import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7ML837L4wlPcBy65JRAr1UHnvyR2E3es",
  authDomain: "file-market-e9c39.firebaseapp.com",
  databaseURL: "https://file-market-e9c39-default-rtdb.firebaseio.com",
  projectId: "file-market-e9c39",
  storageBucket: "file-market-e9c39.firebasestorage.app",
  messagingSenderId: "355537437035",
  appId: "1:355537437035:web:e3fb8d9151ea1584328c2e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
