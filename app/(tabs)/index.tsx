import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { applications, targets } from '@/db/schema';
import WeeklyTargetCard from '../../components/targets/WeeklyTargetCard';
import StatusPieChart from '../../components/charts/StatusPieChart';

import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_COLOURS: Record<string, string> = {
  Applied: '#6366F1',
  Interviewing: '#F59E0B',
  Offer: '#10B981',
  Rejected: '#EF4444',
  Withdrawn: '#94A3B8',
};

export default function HomeScreen() {
  const [weeklyTarget, setWeeklyTarget] = useState<{
    targetCount: number;
    startDate: string;
    endDate: string;
  } | null>(null);

  const [weeklyCount, setWeeklyCount] = useState(0);
  const [pieData, setPieData] = useState<
    { value: number; color: string; label: string }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      async function loadTarget() {
        const allTargets = await db.select().from(targets);
        const weekly = allTargets.find((t) => t.timespan === 'weekly');
        if (!weekly) return;

        setWeeklyTarget({
          targetCount: weekly.targetCount,
          startDate: weekly.startDate,
          endDate: weekly.endDate,
        });

        const allApps = await db.select().from(applications);
        const count = allApps.filter(
          (a) => a.dateApplied >= weekly.startDate && a.dateApplied <= weekly.endDate
        ).length;

        setWeeklyCount(count);
      }

      loadTarget();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const rows = await db
          .select({
            status: applications.currentStatus,
            count: sql<number>`count(*)`.as('count'),
          })
          .from(applications)
          .groupBy(applications.currentStatus);

        setPieData(
          rows.map((row) => ({
            value: row.count,
            color: STATUS_COLOURS[row.status] ?? '#CBD5E1',
            label: row.status,
          }))
        );
      };

      load();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
    <View style={styles.container}>
      {weeklyTarget && (
        <WeeklyTargetCard
          targetCount={weeklyTarget.targetCount}
          actualCount={weeklyCount}
          startDate={weeklyTarget.startDate}
          endDate={weeklyTarget.endDate}
        />
      )}

      <StatusPieChart data={pieData} />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});