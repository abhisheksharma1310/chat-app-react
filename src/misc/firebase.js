import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: "AIzaSyCcauhF0dbhUF-QPnO7Uaj5IOdoX5_ZJcw",
    authDomain: "chatwebreactapp.firebaseapp.com",
    databaseURL: "https://chatwebreactapp-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chatwebreactapp",
    storageBucket: "chatwebreactapp.appspot.com",
    messagingSenderId: "484899358944",
    appId: "1:484899358944:web:6b216c7a407f9dfbc96885"
};

const app = firebase.initializeApp(config);
export const auth = app.auth();
export const database = app.database();
