import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { categories } from '../../db/schema';

type CategoryDetail = {
  id: number;
  name: string;
  colour: string;
  icon: string;
};

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<CategoryDetail | null>(null);

  useEffect(() => {
    async function loadCategory() {
      const results = await db
        .select({
          id: categories.id,
          name: categories.name,
          colour: categories.colour,
          icon: categories.icon,
        })
        .from(categories)
        .where(eq(categories.id, Number(id)));

      if (results.length > 0) setCategory(results[0]);
    }
    loadCategory();
  }, [id]);

  if (!category) return null;

  const deleteCategory = async () => {
    await db.delete(categories).where(eq(categories.id, Number(id)));
    router.back();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete ${category.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteCategory },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.name}>{category.name}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Colour</Text>
        <Text style={styles.value}>{category.colour}</Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Icon</Text>
        <Text style={styles.value}>{category.icon}</Text>
      </View>

      <Pressable
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: '/category/[id]/edit',
            params: { id },
          })
        }
        accessibilityLabel="Edit category"
        accessibilityRole="button"
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={confirmDelete}
        accessibilityLabel="Delete category"
        accessibilityRole="button"
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  role: {
    fontSize: 17,
    color: '#374151',
    marginBottom: 20,
  },
  infoBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 15,
    color: '#111827',
  },
  editButton: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  deleteButtonText: {
    color: '#7F1D1D',
    fontSize: 15,
    fontWeight: '500',
  },
});