import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { insertItem, updateItem } from '../db/database';

const AddEditItemScreen = ({ route, navigation }) => {
  const { item, barcode, apiProduct, category } = route.params || {};
  const isEdit = !!item;

  const [name, setName] = useState(item?.name || apiProduct?.name || '');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [minStock, setMinStock] = useState(String(item?.minStock ?? 1));
  const [code, setCode] = useState(item?.barcode || barcode || '');
  const [expirationDate, setExpirationDate] = useState(
    item?.expirationDate ? new Date(item.expirationDate) : null
  );
  const [showPicker, setShowPicker] = useState(false);

  const categoryId = item?.categoryId ?? category?.id;

  const handleSave = async () => {
    if (!name || !categoryId) {
      Alert.alert('Error', 'Faltan datos obligatorios');
      return;
    }

    const payload = {
      name,
      quantity: Number(quantity),
      minStock: Number(minStock),
      barcode: code,
      expirationDate: expirationDate ? expirationDate.toISOString() : null,
      categoryId: Number(categoryId),
    };

    try {
      if (isEdit) {
        await updateItem({ ...payload, id: item.id });
      } else {
        await insertItem(payload);
      }

      navigation.goBack();
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  if (!categoryId && !isEdit) {
    return (
      <View style={styles.container}>
        <Text>Error: categoría no recibida.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Editar producto' : 'Nuevo producto'}</Text>

      <Text style={styles.label}>Producto</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Cantidad</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

      <Text style={styles.label}>Stock mínimo</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={minStock} onChangeText={setMinStock} />

      <Text style={styles.label}>Código de barras</Text>
      <TextInput style={styles.input} value={code} editable={!item} />

      <Text style={styles.label}>Fecha de vencimiento</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
        <Text>
          {expirationDate
            ? expirationDate.toLocaleDateString()
            : 'Seleccionar fecha'}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={expirationDate || new Date()}
          mode="date"
          display="calendar"
          onChange={(e, date) => {
            setShowPicker(false);
            if (date) setExpirationDate(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddEditItemScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  label: { marginBottom: 4, color: '#555', fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#1e90ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
});
