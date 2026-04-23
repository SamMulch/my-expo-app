import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { db } from '@/db/client';
import { applications, targets } from '@/db/schema';
import WeeklyTargetCard from '../../components/targets/WeeklyTargetCard';

export default function HomeScreen() {
  const [weeklyTarget, setWeeklyTarget] = useState<{
    targetCount: number;
    startDate: string;
    endDate: string;
  } | null>(null);

  const [weeklyCount, setWeeklyCount] = useState(0);

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
  return (
    <View style={styles.container}>
      {weeklyTarget && (
        <WeeklyTargetCard
          targetCount={weeklyTarget.targetCount}
          actualCount={weeklyCount}
          startDate={weeklyTarget.startDate}
          endDate={weeklyTarget.endDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});