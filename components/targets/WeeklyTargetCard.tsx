import { View, Text, StyleSheet } from 'react-native';

type Props = {
  targetCount: number;
  actualCount: number;
  startDate: string;
  endDate: string;
};

export default function WeeklyTargetCard({
  targetCount,
  actualCount,
  startDate,
  endDate,
}: Props) {
  const progress = Math.min(actualCount / targetCount, 1);
  const exceeded = actualCount > targetCount;
  const met = actualCount >= targetCount;
  const remaining = Math.max(targetCount - actualCount, 0);

  const statusText = exceeded
    ? `Target exceeded by ${actualCount - targetCount}`
    : met
    ? 'Target met!'
    : `${remaining} remaining`;

  const statusColor = exceeded
    ? '#15803d'   // green if exceeded
    : met
    ? '#0f766e'   // teal if target was met exactly 
    : '#b45309';  // amber if unmet 

  const barColor = exceeded ? '#16a34a' : met ? '#0f766e' : '#f59e0b';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Goal</Text>
        <Text style={styles.dates}>
          {startDate} – {endDate}
        </Text>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countBig}>{actualCount}</Text>
        <Text style={styles.countOf}> / {targetCount} applications</Text>
      </View>

      {/* progress bar */} 
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.round(progress * 100)}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  dates: {
    fontSize: 11,
    color: '#94A3B8',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  countBig: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f172a',
  },
  countOf: {
    fontSize: 15,
    color: '#64748B',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
  },
});