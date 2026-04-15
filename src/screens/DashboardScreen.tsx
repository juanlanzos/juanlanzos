import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatCard } from '../components/StatCard';
import { useRegisteredSources } from '../core/useDataSource';

export function DashboardScreen() {
  const sources = useRegisteredSources();
  const { width } = useWindowDimensions();
  const cardWidth = width - 24; // horizontal padding

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Realtime Stats</Text>
        <Text style={styles.subtitle}>
          {sources.length} {sources.length === 1 ? 'fuente' : 'fuentes'} activa
          {sources.length === 1 ? '' : 's'}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {sources.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No hay fuentes registradas. Agrega una en{' '}
              <Text style={styles.code}>src/sources/index.ts</Text> o vía{' '}
              <Text style={styles.code}>registry.register()</Text>.
            </Text>
          </View>
        ) : (
          sources.map((source) => (
            <StatCard
              key={source.metadata.id}
              source={source}
              width={cardWidth}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: '#e7ebff',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8a92b6',
    fontSize: 12,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8a92b6',
    fontSize: 14,
    textAlign: 'center',
  },
  code: {
    color: '#e7ebff',
    fontFamily: 'Menlo',
  },
});
