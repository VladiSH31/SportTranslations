import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { HistoryProvider } from './src/context/HistoryContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
        <View style={[styles.container, styles.center]}>
          <Text style={styles.infoText}>Потрібен дозвіл на камеру</Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Надати дозвіл</Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <HistoryProvider>
        <AppNavigator />
      </HistoryProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { justifyContent: 'center', alignItems: 'center' },
  infoText: { color: '#fff', marginBottom: 20 },
  btn: { backgroundColor: '#4f46e5', padding: 14, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
});