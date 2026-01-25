import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';    


const getExpirationStatus = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  const date = new Date(dateStr);
  const diffDays = (date - today) / 86400000;

  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'soon';
  return null;
};


const ItemCard = ({ item, onEdit, onDelete, onInc, onDec }) => {
    const status = getExpirationStatus(item.expirationDate);
    {status === 'expired' && <Text style={styles.expired}>❌ Vencido</Text>}
{status === 'soon' && <Text style={styles.expiring}>⏳ Próximo a vencer</Text>}


    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>

                {item.categoryName && (
                    <Text style={styles.category}>📁 {item.categoryName}</Text>
                )}

                <Text style={styles.stock}>Stock: {item.quantity}</Text>

                {item.minStock > 0 && item.quantity <= item.minStock && (
                    <Text style={styles.lowStock}>⚠ Stock bajo</Text>
                )}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.qtyBtn} onPress={onDec}>
                    <Text style={styles.qtyText}>−</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.qtyBtn} onPress={onInc}>
                    <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onEdit}>
                    <Text style={styles.edit}>✏️</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onDelete}>
                    <Text style={styles.delete}>🗑</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ItemCard;

const styles = StyleSheet.create({

    expired: { color: '#d9534f', fontWeight: '700', marginTop: 4 },
expiring: { color: '#f0ad4e', fontWeight: '700', marginTop: 4 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600' },
    category: { fontSize: 12, color: '#777', marginTop: 2 },
    stock: { marginTop: 4 },
    lowStock: { marginTop: 2, color: '#d9534f', fontWeight: '600' },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyBtn: {
        backgroundColor: '#1e90ff',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    edit: { fontSize: 18 },
    delete: { fontSize: 18 },
});
