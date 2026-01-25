// screens/LoginScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, loadUserFromStorage } from '../app/authSlice';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Alternar login/registro

  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);

  // Cargar usuario desde AsyncStorage al iniciar la app
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Si ya hay usuario logueado, podés redirigir a otra pantalla
  useEffect(() => {
    if (user) {
      console.log('Usuario logueado:', user);
      // Aquí podés navegar a otra pantalla, ej:
      // navigation.replace('HomeScreen');
    }
  }, [user]);

  const handleSubmit = () => {
    if (isRegisterMode) {
      dispatch(register({ email, password }));
    } else {
      dispatch(login({ email, password }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Despensero</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isRegisterMode ? 'Registrarse' : 'Iniciar sesión'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsRegisterMode(!isRegisterMode)}
        style={{ marginTop: 15 }}
      >
        <Text style={styles.toggleText}>
          {isRegisterMode
            ? '¿Ya tenés cuenta? Inicia sesión'
            : '¿No tenés cuenta? Registrate'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f4f6fa' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#1e90ff', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
  toggleText: { color: '#1e90ff', textAlign: 'center', marginTop: 10, fontWeight: '600' },
});
