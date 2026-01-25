import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Navigator from './navigation/Navigator.jsx';
import { initDB } from './db/database';

export default function App() {
  useEffect(() => {
    initDB(); // SQLite offline
  }, []);

  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  );
}
