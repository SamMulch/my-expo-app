import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { applications, categories } from '../../../db/schema';

type Category = {
  id: number;
  name: string;
  colour: string;
  icon: string;
};

const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];

export default function EditApplication() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [dateApplied, setDateApplied] = useState('');
  const [location, setLocation] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Applied');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  useEffect(() => {
    async function loadData() {
      // Load the existing application
      const appResults = await db
        .select()
        .from(applications)
        .where(eq(applications.id, Number(id)));

      if (appResults.length > 0) {
        const app = appResults[0];
        setCompany(app.company);
        setRole(app.role);
        setDateApplied(app.dateApplied);
        setLocation(app.location ?? '');
        setExtraContext(app.extraContext ?? '');
        setSelectedStatus(app.currentStatus);
        setSelectedCategoryId(app.categoryId);
      }

      // Load categories for the picker
      const cats = await db.select().from(categories);
      setCategoryList(cats);
    }
    loadData();
  }, [id]);

  const saveChanges = async () => {
    if (!company.trim()) {
      Alert.alert('Missing info', 'Company name is required.');
      return;
    }
    if (!role.trim()) {
      Alert.alert('Missing info', 'Role is required.');
      return;
    }

    await db
      .update(applications)
      .set({
        company: company.trim(),
        role: role.trim(),
        dateApplied,
        currentStatus: selectedStatus,
        categoryId: selectedCategoryId!,
        location: location.trim() || null,
        extraContext: extraContext.trim() || null,
      })
      .where(eq(applications.id, Number(id)));

    router.replace('/(tabs)/applications');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Edit Application</Text>

      <Text style={styles.label}>Company *</Text>
      <TextInput
        style={styles.input}
        value={company}
        onChangeText={setCompany}
        accessibilityLabel="Company"
      />

      <Text style={styles.label}>Role *</Text>
      <TextInput
        style={styles.input}
        value={role}
        onChangeText={setRole}
        accessibilityLabel="Role"
      />

      <Text style={styles.label}>Date Applied *</Text>
      <TextInput
        style={styles.input}
        value={dateApplied}
        onChangeText={setDateApplied}
        accessibilityLabel="Date Applied"
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        accessibilityLabel="Location"
      />

      <Text style={styles.label}>Status *</Text>
      <View style={styles.chipRow}>
        {STATUS_OPTIONS.map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, selectedStatus === s && styles.chipSelected]}
            onPress={() => setSelectedStatus(s)}
            accessibilityLabel={`Status ${s}`}
            accessibilityRole="button"
          >
            <Text style={[styles.chipText, selectedStatus === s && styles.chipTextSelected]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Category *</Text>
      <View style={styles.chipRow}>
        {categoryList.map((cat) => (
          <Pressable
            key={cat.id}
            style={[
              styles.chip,
              selectedCategoryId === cat.id && { backgroundColor: cat.colour, borderColor: cat.colour },
            ]}
            onPress={() => setSelectedCategoryId(cat.id)}
            accessibilityLabel={`Category ${cat.name}`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.chipText,
                selectedCategoryId === cat.id && { color: '#fff' },
              ]}
            >
              {cat.icon} {cat.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={extraContext}
        onChangeText={setExtraContext}
        multiline
        numberOfLines={4}
        accessibilityLabel="Notes"
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
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