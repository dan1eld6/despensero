import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import {
  fetchCategoriesWithLowStockCount,
  insertCategory,
  updateCategory,
  deleteCategoryWithItems,
} from '../db/database';
import {
  usePushCategoryMutation,
  useDeleteCategoryRemoteMutation,
} from '../services/despensaApi';

const COLORS = ['#1e90ff', '#ff4d4d', '#ff9800', '#4caf50', '#9c27b0'];

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#1e90ff');

  const [pushCategory] = usePushCategoryMutation();
  const [deleteCategoryRemote] = useDeleteCategoryRemoteMutation();

  const load = async () => {
    const data = await fetchCategoriesWithLowStockCount();
    setCategories(data);
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const openNew = () => {
    setEditing(null);
    setName('');
    setColor('#1e90ff');
    setModalVisible(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setColor(cat.color || '#1e90ff');
    setModalVisible(true);
  };

  const save = async () => {
    try {
      const trimmed = name.trim();
      if (!trimmed) {
        Alert.alert('Error', 'La categoría debe tener nombre');
        return;
      }

      if (editing) {
        await updateCategory(editing.id, trimmed, color);
        await pushCategory({ id: editing.id, name: trimmed, color });
      } else {
        const id = Date.now().toString();
        await insertCategory(id, trimmed, color);
        await pushCategory({ id, name: trimmed, color });
      }

      setModalVisible(false);
      load();
    } catch (e) {
      console.error('Category save error:', e);
      if (e.message === 'CATEGORY_EXISTS') {
        Alert.alert('Error', 'La categoría ya existe');
      } else {
        Alert.alert('Error', 'No se pudo guardar');
      }
    }
  };

  const remove = (cat) => {
    Alert.alert(
      'Eliminar categoría',
      'Esto eliminará todos los productos asociados',
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteCategoryWithItems(cat.id);
            await deleteCategoryRemote({ id: cat.id });
            load();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(i) => i.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: item.color || '#1e90ff' }]}
            onPress={() => navigation.navigate('Items', { category: item })}
            onLongPress={() => openEdit(item)}
          >
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>Mantener para editar</Text>
            </View>

            {item.lowStockCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.lowStockCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openNew}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editing ? 'Editar categoría' : 'Nueva categoría'}
            </Text>

            <TextInput
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    color === c && styles.colorSelected,
                  ]}
                />
              ))}
            </View>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              {editing && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => {
                    setModalVisible(false);
                    remove(editing);
                  }}
                >
                  <Text style={{ color: 'white' }}>Eliminar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.saveBtn} onPress={save}>
                <Text style={{ color: 'white' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6fa' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 6,
  },
  name: { fontSize: 16, fontWeight: '500' },
  sub: { fontSize: 11, color: '#888' },
  badge: {
    backgroundColor: 'red',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#1e90ff',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  fabText: {
    color: 'white',
    fontSize: 32,
    lineHeight: 36,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: '#1e90ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
});
