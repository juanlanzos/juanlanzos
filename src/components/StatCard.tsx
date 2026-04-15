import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DataSource } from '../core/DataSource';
import { useDataSource } from '../core/useDataSource';
import { Sparkline } from './Sparkline';

type Props = {
  source: DataSource;
  width: number;
};

const statusColor = {
  idle: '#6b7280',
  connecting: '#f59e0b',
  running: '#2fd687',
  error: '#ef4444',
  stopped: '#6b7280',
} as const;

export function StatCard({ source, width }: Props) {
  const { latest, history, status, error } = useDataSource(source, {
    historySize: 60,
  });
  const color = source.metadata.color ?? '#7c5cff';
  const chartHeight = 70;
  const chartWidth = width - 32; // padding

  const valueText =
    latest !== undefined ? formatNumber(latest.value) : '—';

  const trend = computeTrend(history);

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: statusColor[status] }]} />
          <Text style={styles.title}>{source.metadata.name}</Text>
        </View>
        {source.metadata.description ? (
          <Text style={styles.subtitle}>{source.metadata.description}</Text>
        ) : null}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{valueText}</Text>
        {source.metadata.unit ? (
          <Text style={styles.unit}>{source.metadata.unit}</Text>
        ) : null}
        {trend !== null ? (
          <Text
            style={[
              styles.trend,
              { color: trend >= 0 ? '#2fd687' : '#ef4444' },
            ]}
          >
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </Text>
        ) : null}
      </View>

      <Sparkline
        data={history}
        color={color}
        width={chartWidth}
        height={chartHeight}
      />

      {status === 'error' && error ? (
        <Text style={styles.error} numberOfLines={1}>
          {error.message}
        </Text>
      ) : null}
    </View>
  );
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1000) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(2);
}

function computeTrend(history: { value: number }[]): number | null {
  if (history.length < 2) return null;
  const first = history[0].value;
  const last = history[history.length - 1].value;
  if (first === 0) return null;
  return ((last - first) / Math.abs(first)) * 100;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141a33',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e2650',
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    color: '#e7ebff',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: '#8a92b6',
    fontSize: 11,
    marginTop: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
  },
  unit: {
    color: '#8a92b6',
    fontSize: 14,
  },
  trend: {
    marginLeft: 'auto',
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 6,
  },
});
