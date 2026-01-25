import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { fetchItemsByCategory, deleteItem } from '../db/database';
import ItemCard from '../components/ItemCard';
import { updateItemQuantity } from '../db/database';
import * as Haptics from 'expo-haptics';


const ItemsScreen = ({ route, navigation }) => {
    const category = route.params?.category;
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!category?.id) return;

        const unsub = navigation.addListener('focus', load);
        load();
        return unsub;
    }, [navigation, category?.id]);

    const load = async () => {
        if (!category?.id) return;
        const data = await fetchItemsByCategory(category.id);
        setItems(data);
    };

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
