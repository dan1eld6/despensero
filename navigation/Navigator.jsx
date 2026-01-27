import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ItemsScreen from '../screens/ItemScreen';
import AddEditItemScreen from '../screens/AddEditItemScreen';
import ScannerScreen from '../screens/ScannerScreen';
import LowStockScreen from '../screens/LowStockScreen';
import ExpiringSoonScreen from '../screens/ExpiringSoonScreen';
import ExpiredScreen from '../screens/ExpiredScreen';
import LoginScreen from '../screens/LoginScreen';
import QuickAddItemScreen from '../screens/QuickAddItemScreen';

import { fetchLowStockItems } from '../db/database';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------- DESPENSA STACK ---------- */
function DespensaStack() {
  return (
    <Stack.Navigator>
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

/* ---------- HOME STACK ---------- */
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScannerFromHome" component={ScannerScreen} options={{ title: 'Escanear producto' }} />
    </Stack.Navigator>
  );
}

/* ---------- ROOT STACK ---------- */
function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="QuickAddItem" component={QuickAddItemScreen} options={{ headerShown: true, title: 'Nuevo producto' }} />
    </Stack.Navigator>
  );
}

/* ---------- TABS ---------- */
function MainTabs() {
  const [lowStockCount, setLowStockCount] = useState(0);
  const user = useSelector(state => state.auth.user);

  const load = async () => {
    const low = await fetchLowStockItems();
    setLowStockCount(low.length);
  };

  useEffect(() => {
    if (user) {
      load();
      const interval = setInterval(load, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen
        name="Despensa"
        component={DespensaStack}
        options={{
          tabBarBadge: lowStockCount > 0 ? lowStockCount : undefined,
          tabBarBadgeStyle: { backgroundColor: 'red', color: 'white', fontWeight: '700' },
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigator() {
  const user = useSelector(state => state.auth.user);

  return (
    <NavigationContainer>
      {user ? (
        <RootStack />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
