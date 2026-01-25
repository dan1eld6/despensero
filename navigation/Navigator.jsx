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

import { fetchLowStockItems } from '../db/database';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

export default function Navigator() {
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
    <NavigationContainer>
      {user ? (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen
            name="Despensa"
            component={DespensaStack}
            options={{
              tabBarBadge: lowStockCount > 0 ? lowStockCount : undefined,
              tabBarBadgeStyle: { backgroundColor: 'red', color: 'white', fontWeight: '700' },
            }}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
