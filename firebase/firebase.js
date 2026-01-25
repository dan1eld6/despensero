// firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { 
    initializeAuth, 
    getReactNativePersistence 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: 'AIzaSyDDf56pyWMYoAALD-K9zKrxh0oCsxaOCHo',
    authDomain: 'despensero-e5e41.firebaseapp.com',
    databaseURL: 'https://despensero-e5e41-default-rtdb.firebaseio.com',
    projectId: 'despensero-e5e41',
    storageBucket: 'despensero-e5e41.appspot.com',
    messagingSenderId: '582160033762',
    appId: '1:582160033762:android:06f9f864ee88432ccefbbb',
};

const app = initializeApp(firebaseConfig);

// Base de datos
export const db = getDatabase(app);

// Auth con persistencia en AsyncStorage
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});
