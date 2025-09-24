// Import SDK
import {
    initializeApp
} from "firebase/app";
import {
    getFirestore
} from "firebase/firestore";
import {
    getAnalytics,
    isSupported
} from "firebase/analytics";

// 🔥 Config Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBiZtbeRa_ZMeoN_kKtRAOU_bBARxwT96k",
    authDomain: "storylab-d5577.firebaseapp.com",
    projectId: "storylab-d5577",
    storageBucket: "storylab-d5577.firebasestorage.app",
    messagingSenderId: "509673022736",
    appId: "1:509673022736:web:9a5177eed675dbf0cfb195",
    measurementId: "G-ZKT41C1GR8"
};

// 🔥 Init App
const app = initializeApp(firebaseConfig);

// 🔥 Firestore instance
const db = getFirestore(app);

// 🔥 Analytics (jalan kalau browser support)
let analytics = null;
if (typeof window !== "undefined") {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

// Export supaya bisa dipakai di file lain
export {
    app,
    db,
    analytics
};
