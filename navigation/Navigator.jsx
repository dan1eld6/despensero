import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import CategoriesScreen from '../screens/CategoriesScreen';
import ItemsScreen from '../screens/ItemScreen';
import AddEditItemScreen from '../screens/AddEditItemScreen';
import ScannerScreen from '../screens/ScannerScreen';
import HomeScreen from '../screens/HomeScreen';
import LowStockScreen from '../screens/LowStockScreen';
import ExpiringSoonScreen from '../screens/ExpiringSoonScreen';
import ExpiredScreen from '../screens/ExpiredScreen';
import AuthScreen from '../screens/AuthScreen'; // NUEVO

import { fetchLowStockItems } from '../db/database';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------- STACK ---------- */

function DespensaStack() {
  return (
    <Stack.Navigator initialRouteName="Categories">
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categorías' }} />
      <Stack.Screen name="Items" component={ItemsScreen} options={{ title: 'Productos' }} />
      <Stack.Screen name="AddEditItem" component={AddEditItemScreen} options={{ title: 'Agregar / Editar' }} />
      <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Escanear código' }} />
      <Stack.Screen name="LowStock" component={LowStockScreen} options={{ title: 'Stock bajo' }} />
      <Stack.Screen name="ExpiringSoon" component={ExpiringSoonScreen} options={{ title: 'Vencen pronto' }} />
      <Stack.Screen name="Expired" component={ExpiredScreen} options={{ title: 'Vencidos' }} />
    </Stack.Navigator>
  );
}

/* ---------- TAB ---------- */

function MainTabs() {
  const [lowStockCount, setLowStockCount] = useState(0);

  const load = async () => {
    const low = await fetchLowStockItems();
    setLowStockCount(low.length);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Despensa"
        component={DespensaStack}
        options={{
          tabBarBadge: lowStockCount > 0 ? lowStockCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: 'red',
            color: 'white',
            fontWeight: '700',
          },
        }}
      />
    </Tab.Navigator>
  );
}

/* ---------- ROOT NAVIGATOR CON AUTH ---------- */

export default function Navigator() {
  const { user } = useSelector((state) => state.auth); // usuario logueado desde redux

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Si no hay usuario, mostrar pantalla de login/registro
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          // Si hay usuario logueado, mostrar tabs principales
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
