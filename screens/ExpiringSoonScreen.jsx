import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import ItemCard from '../components/ItemCard';
import { fetchExpiringSoonItems, updateItemQuantity, deleteItem } from '../db/database';

const ExpiringSoonScreen = () => {
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await fetchExpiringSoonItems(7);
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPlus={() => {
              updateItemQuantity(item.id, 1);
              load();
            }}
            onMinus={() => {
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

export default ExpiringSoonScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f4f6fa' },
});
