import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import ItemCard from '../components/ItemCard';
import { fetchAllItems, updateItemQuantity, deleteItem } from '../db/database';

const getExpirationStatus = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  const date = new Date(dateStr);
  const diffDays = (date - today) / 86400000;

  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'soon';
  return null;
};

const ExpiredScreen = () => {
  const [items, setItems] = useState([]);

  const load = async () => {
    const all = await fetchAllItems();
    const expired = all.filter(i => getExpirationStatus(i.expirationDate) === 'expired');
    setItems(expired);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={i => i.id.toString()}
        ListEmptyComponent={<Text style={styles.empty}>No hay productos vencidos 🎉</Text>}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onInc={() => {
              updateItemQuantity(item.id, 1);
              load();
            }}
            onDec={() => {
              updateItemQuantity(item.id, -1);
              load();
            }}
            onDelete={() => {
              deleteItem(item.id);
              load();
            }}
          />
        )}
      />
    </View>
  );
};

export default ExpiredScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f4f6fa' },
  empty: { textAlign: 'center', marginTop: 40, color: '#777' },
});
