import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ItemCard from '../components/ItemCard';
import { fetchExpiredItems, updateItemQuantity, deleteItem } from '../db/database';

const ExpiredScreen = () => {
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await fetchExpiredItems();
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

export default ExpiredScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f4f6fa' },
});
