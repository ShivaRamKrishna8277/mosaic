import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, get, set, ref, update, remove, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2ZFBpqY_Ig_bPOOHYdeIQAZ2pgZUwbXw",
    authDomain: "mosaiq-97fd8.firebaseapp.com",
    databaseURL: "https://mosaiq-97fd8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mosaiq-97fd8",
    storageBucket: "mosaiq-97fd8.appspot.com",
    messagingSenderId: "47599950440",
    appId: "1:47599950440:web:150bfa5aa5a1704d8c79dd",
    measurementId: "G-Z6WSV6NZJZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth();


async function updateUserdata(userId){
    try {
        const snapshot = await get(ref(db, 'users/' + userId));
        if (snapshot.exists()) {
            const userData = snapshot.val();
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            alert("Something Went Wrong!");
        }
    } catch (error) {
        console.error(error);
        alert("Something Went Wrong!");
    }
}

export { db, get, set, ref, auth, update, push, remove, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, storage, sref, uploadBytes, getDownloadURL,updateUserdata };