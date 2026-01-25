import { initializeApp } from 'firebase/app';
import { get, getDatabase } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyDDf56pyWMYoAALD-K9zKrxh0oCsxaOCHo',
    authDomain: 'despensero-e5e41.firebaseapp.com',
    databaseURL: 'https://despensero-e5e41-default-rtdb.firebaseio.com',
    projectId: 'despensero-e5e41',
    storageBucket: 'despensero-e5e41.firebasestorage.app',
    messagingSenderId: '582160033762',
    appId: '1:582160033762:android:06f9f864ee88432ccefbbb',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth=getAuth(app);

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};