import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { db } from '../../db/client';
import { applications, categories } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { seedDataIfEmpty } from '../../db/seed';

import AddApplicationButton from '../../components/applications/AddApplicationButton';

type ApplicationWithCategory = {
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

export default function ApplicationsScreen() {
  const [items, setItems] = useState<ApplicationWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadApplications() {
    try {
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
        .innerJoin(categories, eq(applications.categoryId, categories.id));

      setItems(results);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function setup() {
      await seedDataIfEmpty();
      await loadApplications();
    }
    setup();
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading applications...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No applications yet</Text>
        <Text style={styles.emptyText}>
          Add your first application to get started.
        </Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/add_application')}>
          <Text style={styles.addButtonText}>Add Application</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() =>
              router.push({
                pathname: '/application/[id]',
                params: { id: item.id.toString() },
              })
            }
            accessibilityLabel={`${item.company}, ${item.role}, ${item.currentStatus}`}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: item.categoryColour || '#999' },
              ]}
            />
            <View style={styles.cardContent}>
              <Text style={styles.company}>{item.company}</Text>
              <Text style={styles.role}>{item.role}</Text>
              <Text style={styles.meta}>
                {item.categoryName} · {item.currentStatus}
              </Text>
              <Text style={styles.meta}>{item.dateApplied}</Text>
              {item.location ? <Text style={styles.meta}>{item.location}</Text> : null}
            </View>
          </Pressable>
        )}
      />

      <AddApplicationButton />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginTop: 6,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  company: {
    fontSize: 17,
    fontWeight: '700',
  },
  role: {
    fontSize: 15,
    marginTop: 2,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});