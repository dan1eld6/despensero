import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Navigator from './navigation/Navigator.jsx';
import { initDB, syncFromFirebase } from './db/database.js';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase.js';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      await initDB();

      const unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // 🔥 Importa Firebase → SQLite al login
          await syncFromFirebase(user.uid);
        }

        if (mounted) setReady(true);
      });

      return unsub;
    };

    const unsubPromise = bootstrap();

    return () => {
      mounted = false;
      unsubPromise?.then((unsub) => unsub && unsub());
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  );
}
