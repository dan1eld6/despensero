import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { fetchItemsByCategory, deleteItem, updateItemQuantity } from '../db/database';
import ItemCard from '../components/ItemCard';
import * as Haptics from 'expo-haptics';
import { usePushItemMutation, useDeleteItemRemoteMutation } from '../services/despensaApi';

const ItemsScreen = ({ route, navigation }) => {
  const category = route.params?.category;
  const [items, setItems] = useState([]);

  const [pushItem] = usePushItemMutation();
  const [deleteItemRemote] = useDeleteItemRemoteMutation();

  const load = async () => {
    if (!category?.id) return;
    const data = await fetchItemsByCategory(category.id);
    setItems(data);
  };

  useEffect(() => {
    if (!category?.id) return;
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation, category?.id]);

  const syncItem = async (item) => {
    await pushItem({
      categoryId: item.categoryId,
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      minStock: item.minStock,
      barcode: item.barcode || null,
      expirationDate: item.expirationDate || null,
    });
  };

  const remove = (item) => {
    Alert.alert('Eliminar producto', '¿Seguro?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(item.id);
          await deleteItemRemote({ categoryId: item.categoryId, id: item.id });
          load();
        },
      },
    ]);
  };

  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Error: categoría no recibida.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onEdit={() => navigation.navigate('AddEditItem', { item, category })}
            onDelete={() => remove(item)}
            onInc={async () => {
              await updateItemQuantity(item.id, 1);
              const updated = { ...item, quantity: item.quantity + 1 };
              await syncItem(updated);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              load();
            }}
            onDec={async () => {
              if (item.quantity > 0) {
                await updateItemQuantity(item.id, -1);
                const updated = { ...item, quantity: item.quantity - 1 };
                await syncItem(updated);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                load();
              }
            }}
          />
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: 90 }]}
        onPress={() => navigation.navigate('Scanner', { category })}
      >
        <Text style={styles.fabText}>📷</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditItem', { category })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ItemsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6fa' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1e90ff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 24 },
});
