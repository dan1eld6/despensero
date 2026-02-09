import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { fetchItemByBarcode, updateItemQuantity } from '../db/database';

const ScannerScreen = ({ navigation, route }) => {
  const category = route.params?.category;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [foundItem, setFoundItem] = useState(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const existing = await fetchItemByBarcode(data);

      if (!existing) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        Alert.alert(
          'Producto no encontrado',
          '¿Querés agregar este producto?',
          [
            { text: 'Cancelar', onPress: () => setScanned(false), style: 'cancel' },
            {
              text: 'Agregar',
              onPress: () => {
                if (!category) {
                  Alert.alert(
                    'Sin categoría',
                    'Primero seleccioná una categoría para poder agregar el producto.'
                  );
                  setScanned(false);
                  return;
                }

                navigation.replace('AddEditItem', {
                  barcode: data,
                  category,
                });
              },
            },
          ]
        );
        return;
      }

      setFoundItem(existing);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Scan error:', err);
      Alert.alert('Error', 'No se pudo procesar el código');
      setScanned(false);
    }
  };

  const inc = async () => {
    await updateItemQuantity(foundItem.id, 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFoundItem(null);
    setScanned(false);
  };

  const dec = async () => {
    if (foundItem.quantity > 0) {
      await updateItemQuantity(foundItem.id, -1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFoundItem(null);
    setScanned(false);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>Se necesita permiso de cámara</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
        }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.text}>Apuntá al código de barras</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal producto encontrado */}
      <Modal visible={!!foundItem} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{foundItem?.name}</Text>
            <Text style={styles.modalSub}>Stock actual: {foundItem?.quantity}</Text>

            <View style={styles.row}>
              <TouchableOpacity style={styles.minusBtn} onPress={dec}>
                <Text style={styles.btnText}>−1</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.plusBtn} onPress={inc}>
                <Text style={styles.btnText}>+1</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelModal}
              onPress={() => {
                setFoundItem(null);
                setScanned(false);
              }}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScannerScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 16, marginBottom: 12 },
  cancel: { color: '#1e90ff', fontSize: 16 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  modalSub: { color: '#666', marginBottom: 16 },

  row: { flexDirection: 'row', gap: 16 },
  plusBtn: {
    backgroundColor: '#1e90ff',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  minusBtn: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  btnText: { color: 'white', fontWeight: '700', fontSize: 16 },

  cancelModal: { marginTop: 16 },
});
