import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Text } from 'react-native';
import ItemCard from '../components/ItemCard';
import { fetchLowStockItemsWithCategory, deleteItem, updateItemQuantity } from '../db/database';
import * as Haptics from 'expo-haptics';

const LowStockScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);

    const load = async () => {
        const data = await fetchLowStockItemsWithCategory();
        setItems(data);
    };

    useEffect(() => {
        const unsub = navigation.addListener('focus', load);
        load();
        return unsub;
    }, [navigation]);

    const remove = (id) => {
        Alert.alert('Eliminar producto', '¿Seguro?', [
            { text: 'Cancelar' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    await deleteItem(id);
                    load();
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>⚠️ Productos con stock bajo</Text> */}

            {items.length === 0 ? (
                <Text style={styles.empty}>No hay productos con stock bajo 🎉</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(i) => i.id.toString()}
                    renderItem={({ item }) => (
                        <ItemCard
                            item={item}
                            onEdit={() => navigation.navigate('AddEditItem', { item })}
                            onDelete={() => remove(item.id)}
                            onInc={async () => {
                                await updateItemQuantity(item.id, 1);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                load();
                            }}
                            onDec={async () => {
                                if (item.quantity > 0) {
                                    await updateItemQuantity(item.id, -1);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    load();
                                }
                            }}
                        />
                    )}
                />
            )}
        </View>
    );
};

export default LowStockScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f4f6fa' },
    title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
    empty: { textAlign: 'center', color: '#777', marginTop: 40 },
});
