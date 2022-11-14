import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyDFGiabw3T5F3tPw3dYBw7QZ2Y0YXe21oM",
    authDomain: "careerlaunch-4-aabf9.firebaseapp.com",
    databaseURL: "https://careerlaunch-4-aabf9-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "careerlaunch-4-aabf9",
    storageBucket: "careerlaunch-4-aabf9.appspot.com",
    messagingSenderId: "654422240311",
    appId: "1:654422240311:web:c829281cdccbe3795623b2"
};

if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
}

