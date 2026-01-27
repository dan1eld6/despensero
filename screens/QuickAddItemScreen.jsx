import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { fetchCategories, insertItem } from '../db/database';
import { useNavigation } from '@react-navigation/native';

export default function QuickAddItemScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
    if (data.length > 0) setCategoryId(data[0].id);
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Ingresá el nombre del producto.');
      return;
    }

    if (!categoryId) {
      Alert.alert('Sin categoría', 'Primero creá una categoría.');
      return;
    }

    await insertItem({
      name: name.trim(),
      quantity: Number(quantity) || 1,
      categoryId,
    });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nuevo producto</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Arroz"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Cantidad</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Text style={styles.label}>Categoría</Text>
      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryBtn,
            categoryId === cat.id && styles.categorySelected,
          ]}
          onPress={() => setCategoryId(cat.id)}
        >
          <Text
            style={[
              styles.categoryText,
              categoryId === cat.id && styles.categoryTextSelected,
            ]}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>Guardar producto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  categoryBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginTop: 6,
  },
  categorySelected: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: 'white',
  },
  saveBtn: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 12,
    marginTop: 30,
  },
  saveText: {
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
});
