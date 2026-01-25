import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  fetchLowStockItems,
  fetchTotalItemsCount,
  fetchExpiredItems,
  fetchExpiringSoonItems,
} from '../db/database';

const HomeScreen = ({ navigation }) => {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);

  const hasShownAlert = useRef(false);

  const load = async () => {
    const low = await fetchLowStockItems();
    const total = await fetchTotalItemsCount();
    const expired = await fetchExpiredItems();
    const soon = await fetchExpiringSoonItems(7);

    setLowStockCount(low.length);
    setTotalCount(total);
    setExpiringCount(soon.length);
    setExpiredCount(expired.length);

    if (!hasShownAlert.current) {
      if (expired.length > 0) {
        Alert.alert('⚠ Productos vencidos', `Tenés ${expired.length} productos vencidos`);
      } else if (soon.length > 0) {
        Alert.alert('⏳ Próximos a vencer', `${soon.length} productos vencerán pronto`);
      }
      hasShownAlert.current = true;
    }
  };

  useEffect(() => {
  const unsubscribe = navigation.addListener('focus', load);
  return unsubscribe;
}, [navigation]);


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>📦 Despensa</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.primary]}>
            <Text style={styles.summaryNumber}>{totalCount}</Text>
            <Text style={styles.summaryLabel}>Productos</Text>
          </View>

          <TouchableOpacity
            style={[styles.summaryCard, styles.warning]}
            onPress={() => navigation.navigate('Despensa', { screen: 'LowStock' })}
          >
            <Text style={styles.summaryNumber}>{lowStockCount}</Text>
            <Text style={styles.summaryLabel}>Stock bajo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <TouchableOpacity
            style={[styles.summaryCard, styles.expiring]}
            onPress={() => navigation.navigate('Despensa', { screen: 'ExpiringSoon' })}
          >
            <Text style={styles.summaryNumber}>{expiringCount}</Text>
            <Text style={styles.summaryLabel}>Vencen pronto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.summaryCard, styles.expired]}
            onPress={() => navigation.navigate('Despensa', { screen: 'Expired' })}
          >
            <Text style={styles.summaryNumber}>{expiredCount}</Text>
            <Text style={styles.summaryLabel}>Vencidos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Despensa', { screen: 'Categories' })}
        >
          <Text style={styles.cardTitle}>📁 Categorías</Text>
          <Text style={styles.cardSub}>Ver productos por categoría</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Despensa', { screen: 'Scanner' })}
        >
          <Text style={styles.cardTitle}>📷 Escanear producto</Text>
          <Text style={styles.cardSub}>Agregar o sumar stock automáticamente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Despensa', { screen: 'AddEditItem' })}
        >
          <Text style={styles.cardTitle}>➕ Nuevo producto</Text>
          <Text style={styles.cardSub}>Carga manual rápida</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4f6fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  primary: { backgroundColor: '#1e90ff', marginRight: 8 },
  warning: { backgroundColor: '#ff4d4d', marginLeft: 8 },
  expiring: { backgroundColor: '#ff9800', marginRight: 8 },
  expired: { backgroundColor: '#8b0000', marginLeft: 8 },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#fff',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 4 },
});
