import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { registerDefaultSources } from './src/sources';

export default function App() {
  useEffect(() => {
    registerDefaultSources();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <DashboardScreen />
    </SafeAreaProvider>
  );
}
