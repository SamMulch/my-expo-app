import { db } from '@/db/client';
import {
  applications as applicationsTable,
  applicationStatusLogs as logsTable,
  categories as categoriesTable,
  users as usersTable,
} from '@/db/schema';
import { getCurrentUserId, setCurrentUserId } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// settings: CSV export, logout, delete profile
export default function SettingsScreen() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  // log out will clear the current user and redirect to login screen
  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await setCurrentUserId(null);
          router.replace('/login');
        },
      },
    ]);
  };

  // delete user profile
  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete profile',
      'This will permanently delete your account. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const userId = await getCurrentUserId();
            if (userId === null) return;
            await db.delete(usersTable).where(eq(usersTable.id, userId));
            await setCurrentUserId(null);
            router.replace('/login');
          },
        },
      ]
    );
  };

  // to export all applications as a CSV
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // fetch fresh from db so export isnt old
      const apps = await db.select().from(applicationsTable);
      const cats = await db.select().from(categoriesTable);
      const statusLogs = await db.select().from(logsTable);

      if (apps.length === 0) {
        Alert.alert('No data', 'You have no applications to export yet.');
        setExporting(false);
        return;
      }

      // build CSV
      const header = 'date_applied,company,role,category,location,current_status,status_history,extra_context\n';
      const rows = apps
        .map((app) => {
          const category = cats.find((c) => c.id === app.categoryId);
          const history = statusLogs
            .filter((l) => l.applicationId === app.id)
            .map((l) => `${l.status} @ ${l.changedAt}`)
            .join(' | ');
          const company = app.company.replace(/"/g, '""');
          const role = app.role.replace(/"/g, '""');
          const loc = (app.location ?? '').replace(/"/g, '""');
          const extra = (app.extraContext ?? '').replace(/"/g, '""');
          return `${app.dateApplied},"${company}","${role}","${category?.name ?? ''}","${loc}","${app.currentStatus}","${history}","${extra}"`;
        })
        .join('\n');

      const csv = header + rows;
      const filename = `job-applications-${Date.now()}.csv`;

      // cacheDirectory for exports
      const fileUri = (FileSystem.cacheDirectory ?? FileSystem.documentDirectory) + filename;

      await FileSystem.writeAsStringAsync(fileUri, csv);

      // share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export applications',
        });
      } else {
        Alert.alert('Saved', `CSV saved to: ${fileUri}`);
      }
    } catch (e) {
      console.error('CSV export error:', e);
      const message = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Export failed', message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenSubtitle}>Account and data</Text>

        {/* CSV export stuff */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <View style={styles.card}>
          <Pressable
            accessibilityLabel="Export applications as CSV"
            accessibilityRole="button"
            onPress={handleExportCSV}
            disabled={exporting}
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Text style={styles.rowLabel}>Export to CSV</Text>
            )}
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        {/* account section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        <Pressable
          accessibilityLabel="Log out"
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>Log Out</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Delete profile"
          accessibilityRole="button"
          onPress={handleDeleteProfile}
          style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}
        >
          <Text style={styles.dangerButtonText}>Delete Profile</Text>
        </Pressable>

        <Text style={styles.footer}>Job Tracker · IS4447</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  sectionLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  rowLabel: {
    color: '#0F172A',
    fontSize: 15,
  },
  chevron: {
    color: '#666',
    fontSize: 20,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerButtonText: {
    color: '#7F1D1D',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});