import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, } from 'react-native';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { categories } from '../../../db/schema';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState('');
  const [colour, setColour] = useState('');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    async function loadCategory() {
      const results = await db
        .select()
        .from(categories)
        .where(eq(categories.id, Number(id)));

      if (results.length > 0) {
        const cat = results[0];
        setName(cat.name);
        setColour(cat.colour);
        setIcon(cat.icon);
      }
    }
    loadCategory();
  }, [id]);

  const saveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Category name is required.');
      return;
    }

    await db
      .update(categories)
      .set({
        name: name.trim(),
        colour: colour.trim(),
        icon: icon.trim(),
      })
      .where(eq(categories.id, Number(id)));

    router.replace('/(tabs)/categories');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Edit Category</Text>

      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        accessibilityLabel="Name"
      />

      <Text style={styles.label}>Colour (hex code)</Text>
      <TextInput
        style={styles.input}
        value={colour}
        onChangeText={setColour}
        accessibilityLabel="Colour"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Icon (emoji)</Text>
      <TextInput
        style={styles.input}
        value={icon}
        onChangeText={setIcon}
        accessibilityLabel="Icon"
      />

      <Pressable
        style={styles.saveButton}
        onPress={saveChanges}
        accessibilityLabel="Save changes"
        accessibilityRole="button"
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </Pressable>

      <Pressable
        style={styles.cancelButton}
        onPress={() => router.back()}
        accessibilityLabel="Cancel"
        accessibilityRole="button"
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111827',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  saveButton: {
    marginTop: 28,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
});