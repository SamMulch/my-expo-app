import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../db/client';
import { categories } from '../db/schema';

import AddCategoryButton from '../components/applications/AddCategoryButton';

export default function AddCategoryScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [colour, setColour] = useState('#2563EB');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Category name is required.');
      return;
    }
    if (!colour.trim()) {
      Alert.alert('Missing info', 'Colour is required.');
      return;
    }
    if (!icon.trim()) {
      Alert.alert('Missing info', 'Icon is required.');
      return;
    }

    setSaving(true);
    try {
      await db.insert(categories).values({
        name: name.trim(),
        colour: colour.trim(),
        icon: icon.trim(),
      });

      router.replace('/(tabs)/categories');
    } catch (err) {
      console.error('Failed to save category:', err);
      Alert.alert('Error', 'Could not save category. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>New Category</Text>

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Tech"
          value={name}
          onChangeText={setName}
          accessibilityLabel="Name"
        />

        <Text style={styles.label}>Colour * (hex code)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. #2563EB"
          value={colour}
          onChangeText={setColour}
          accessibilityLabel="Colour"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Icon * (emoji)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 💼"
          value={icon}
          onChangeText={setIcon}
          accessibilityLabel="Icon"
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityLabel="Save Category"
          accessibilityRole="button"
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Category'}
          </Text>
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

      <AddCategoryButton />
    </>
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
  saveButtonDisabled: {
    backgroundColor: '#93C5FD',
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