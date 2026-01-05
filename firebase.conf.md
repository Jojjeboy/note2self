Firebase conf





// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries



// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

&nbsp; apiKey: "AIzaSyD26uS2Q5y8QutKntqP-KOWXf5Yyx8JTYw",

&nbsp; authDomain: "note-2-self-4cc7e.firebaseapp.com",

&nbsp; projectId: "note-2-self-4cc7e",

&nbsp; storageBucket: "note-2-self-4cc7e.firebasestorage.app",

&nbsp; messagingSenderId: "392837058938",

&nbsp; appId: "1:392837058938:web:c902bf0b3e38a8824b06c3",

&nbsp; measurementId: "G-NTSF8FKWG2"

};



// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

