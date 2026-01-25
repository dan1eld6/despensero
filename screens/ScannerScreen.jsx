import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { fetchProductByBarcodeAPI } from '../api/productsApi';
import { fetchItemByBarcode, updateItemQuantity } from '../db/database';

const ScannerScreen = ({ route, navigation }) => {
    const category = route.params?.category;
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, []);

    const handleBarcodeScanned = async ({ data }) => {
        if (scanned) return;
        setScanned(true);

        try {
            // 1️⃣ Buscar en BD local
            const existing = await fetchItemByBarcode(data);

            if (existing) {
                await updateItemQuantity(existing.id, 1);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                Alert.alert(
                    'Stock actualizado',
                    `${existing.name}\nCantidad: ${existing.quantity + 1}`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
                return;
            }

            // 2️⃣ Buscar en API externa
            const apiProduct = await fetchProductByBarcodeAPI(data);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            navigation.replace('AddEditItem', {
                barcode: data,
                apiProduct,
                category,
            });
        } catch (err) {
            console.error('Scan error:', err);
            Alert.alert('Error', 'No se pudo procesar el código');
            setScanned(false);
        }
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

            <View style={styles.overlay}>
                <Text style={styles.text}>Apuntá al código de barras</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancel}>Cancelar</Text>
                </TouchableOpacity>
            </View>
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
});
