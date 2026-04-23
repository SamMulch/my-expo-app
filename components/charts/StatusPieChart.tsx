import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

type PieItem = {
  value: number;
  color: string;
  label: string;
};

type Props = {
  data: PieItem[];
};

const STATUS_COLOURS: Record<string, string> = {
  Applied:      '#6366F1',
  Interviewing: '#F59E0B',
  Offer:        '#10B981',
  Rejected:     '#EF4444',
  Withdrawn:    '#94A3B8',
};

export default function StatusPieChart({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No applications yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Applications by Status</Text>

      <View style={styles.chartWrapper}>
        <PieChart
          donut
          data={data}
          radius={90}
          innerRadius={55}
          centerLabelComponent={() => (
            <View style={styles.center}>
              <Text style={styles.centerNumber}>{total}</Text>
              <Text style={styles.centerLabel}>Total</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.legend}>
        {data.map(item => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
            <Text style={styles.legendCount}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  center: {
    alignItems: 'center',
  },
  centerNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  centerLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  legend: {
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  legendCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  empty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
});