import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signInUser, signUpUser } from '../app/authSlice';
import { loginWithEmail } from '../firebase/firebase';

const handleLogin = async () => {
  try {
    const user = await loginWithEmail(email, password);
    console.log('Usuario logueado', user.uid);
  } catch (e) {
    console.error(e.message);
  }
};

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);

  const handleSignIn = async () => {
    const result = await dispatch(signInUser({ email, password }));
    if (result.error) Alert.alert('Error', result.error.message || result.error);
  };

  const handleSignUp = async () => {
    const result = await dispatch(signUpUser({ email, password }));
    if (result.error) Alert.alert('Error', result.error.message || result.error);
  };

  if (user) {
    // Si el usuario está logueado, navegar a Home
    navigation.replace('Home');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión / Registrarse</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title={loading ? 'Cargando...' : 'Iniciar sesión'} onPress={handleSignIn} />
      <View style={{ height: 10 }} />
      <Button title="Registrarse" onPress={handleSignUp} />
      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
});
