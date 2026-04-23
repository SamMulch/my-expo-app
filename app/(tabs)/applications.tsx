import { useState, useCallback } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { db } from '../../db/client';
import { applications, categories } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { seedDataIfEmpty } from '../../db/seed';
import AddApplicationButton from '../../components/applications/AddApplicationButton';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  // for searching 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  useFocusEffect(
  useCallback(() => {
    async function setup() {
      setLoading(true);
      await seedDataIfEmpty();
      await loadApplications();
    }

    setup();
  }, [])
);

  // category data comes from what is already loaded
  const categoryOptions = [
    'All',
    ...Array.from(new Set(items.map(item => item.categoryName))).sort(),
  ];

  // filtering that list to do the sorting operations
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter(app => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      app.company.toLowerCase().includes(normalizedQuery) ||
      app.role.toLowerCase().includes(normalizedQuery);

    const matchesCategory =
      selectedCategory === 'All' || app.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
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
        <Text style={styles.emptySubText}>
          Add your first application to get started.
        </Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/add_application')}>
          <Text style={styles.addButtonText}>Add Application</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
    <View style={styles.screen}>
      {/* searchbar */}
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by company or role..."
        placeholderTextColor="#64748B" // wasnt visible before
        accessibilityLabel="Search applications"
        style={styles.searchInput}
      />

      {/* Category filtering pills */}
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.filterRow}
>
  {categoryOptions.map((cat) => {
    const isSelected = selectedCategory === cat;
    return (
      <Pressable
        key={cat}
        accessibilityLabel={`Filter by ${cat}`}
        accessibilityRole="button"
        onPress={() => setSelectedCategory(cat)}
        style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
      >
        <Text
          style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}
          numberOfLines={1}
        >
          {cat}
        </Text>
      </Pressable>
    );
  })}
</ScrollView>

      {/* Applications list */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No applications match your filters</Text>
        }
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
            <View style={[styles.categoryDot, { backgroundColor: item.categoryColour || '#999' }]} />
            <View style={styles.cardContent}>
              <Text style={styles.company}>{item.company}</Text>
              <Text style={styles.role}>{item.role}</Text>
              <Text style={styles.meta}>{item.categoryName} · {item.currentStatus}</Text>
              <Text style={styles.meta}>{item.dateApplied}</Text>
              {item.location ? <Text style={styles.meta}>{item.location}</Text> : null}
            </View>
          </Pressable>
        )}
      />

      <AddApplicationButton />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
    borderRadius: 10,
    borderWidth: 1,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterRow: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  gap: 8,
  flexDirection: 'row',
},
filterButton: {
  backgroundColor: '#FFFFFF',
  borderColor: '#94A3B8',
  borderRadius: 999,
  borderWidth: 1,
  paddingHorizontal: 14,
  paddingVertical: 7,
  flexShrink: 0,
  height: 36, // fixed height so things dont expand
  justifyContent: 'center',      
  alignItems: 'center',          
},
filterButtonSelected: {
  backgroundColor: '#0F172A',
  borderColor: '#0F172A',
},
filterButtonText: {
  color: '#0F172A',
  fontSize: 14,
  fontWeight: '500',
  flexShrink: 0,  // fixing the text getting squished
},
  filterButtonTextSelected: {
    color: '#FFFFFF',
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
    paddingTop: 8,
  },
  emptySubText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
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