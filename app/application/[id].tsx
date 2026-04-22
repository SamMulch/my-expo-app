import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { applications, categories } from '../../db/schema';

type ApplicationDetail = {
  id: number;
  company: string;
  role: string;
  dateApplied: string;
  currentStatus: string;
  location: string | null;
  extraContext: string | null;
  categoryName: string;
  categoryColour: string;
};

export default function ApplicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);

  useEffect(() => {
    async function loadApplication() {
      const results = await db
        .select({
          id: applications.id,
          company: applications.company,
          role: applications.role,
          dateApplied: applications.dateApplied,
          currentStatus: applications.currentStatus,
          location: applications.location,
          extraContext: applications.extraContext,
          categoryName: categories.name,
          categoryColour: categories.colour,
        })
        .from(applications)
        .innerJoin(categories, eq(applications.categoryId, categories.id))
        .where(eq(applications.id, Number(id)));

      if (results.length > 0) setApplication(results[0]);
    }
    loadApplication();
  }, [id]);

  if (!application) return null;

  const deleteApplication = async () => {
    await db.delete(applications).where(eq(applications.id, Number(id)));
    router.back();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Application',
      `Are you sure you want to delete ${application.company}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteApplication },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.company}>{application.company}</Text>
      <Text style={styles.role}>{application.role}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{application.currentStatus}</Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{application.categoryName}</Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Date Applied</Text>
        <Text style={styles.value}>{application.dateApplied}</Text>
      </View>

      {application.location ? (
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{application.location}</Text>
        </View>
      ) : null}

      {application.extraContext ? (
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Notes</Text>
          <Text style={styles.value}>{application.extraContext}</Text>
        </View>
      ) : null}

      <Pressable
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: '/application/[id]/edit',
            params: { id },
          })
        }
        accessibilityLabel="Edit application"
        accessibilityRole="button"
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={confirmDelete}
        accessibilityLabel="Delete application"
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
  company: {
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