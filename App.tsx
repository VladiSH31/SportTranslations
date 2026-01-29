import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [period, setPeriod] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const [editingTime, setEditingTime] = useState(false);
  const [tempMinutes, setTempMinutes] = useState('0');
  const [tempSeconds, setTempSeconds] = useState('0');

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const timeText = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  const periodLabel = period === 1 ? '1st HALF' : '2nd HALF';

  const handleTogglePeriod = () => {
    const nextPeriod = period === 2 ? 1 : period + 1;
    Alert.alert('Змінити період?', `Перейти до ${nextPeriod === 1 ? '1st' : '2nd'} тайму?`, [
      { text: 'Скасувати', style: 'cancel' },
      { text: 'Без обнулення', onPress: () => setPeriod(nextPeriod) },
      {
        text: 'Обнулити таймер',
        onPress: () => {
          setPeriod(nextPeriod);
          setSeconds(0);
          setRunning(false);
        },
        style: 'destructive',
      },
    ]);
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
        <View style={[styles.container, styles.center]}>
          <Text style={styles.infoText}>Потрібен дозвіл на камеру</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Надати дозвіл</Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <StatusBar hidden />

        {/* КАМЕРА - тепер вона точно на весь екран */}
        <CameraView
            style={[StyleSheet.absoluteFill, { width, height }]}
            facing="back"
            mode="video"
        />

        {/* ТАБЛО */}
        <View style={styles.overlayTop} pointerEvents="none">
          <View style={styles.scoreboard}>
            <View style={styles.teamCol}>
              <Text style={styles.teamName}>TEAM A</Text>
              <Text style={styles.score}>{scoreA}</Text>
            </View>
            <View style={styles.centerCol}>
              <Text style={styles.time}>{timeText}</Text>
              <Text style={styles.period}>{periodLabel}</Text>
            </View>
            <View style={styles.teamCol}>
              <Text style={styles.teamName}>TEAM B</Text>
              <Text style={styles.score}>{scoreB}</Text>
            </View>
          </View>
        </View>

        {/* КНОПКИ КЕРУВАННЯ */}
        <View style={styles.controls}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.smallBtn} onPress={() => setScoreA(s => Math.max(0, s - 1))}>
              <Text style={styles.btnText}>A -</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => setScoreA(s => s + 1)}>
              <Text style={styles.btnText}>A +</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnAccent} onPress={() => setRunning(!running)}>
              <Text style={styles.btnText}>{running ? '⏸ PAUSE' : '▶ START'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => setScoreB(s => s + 1)}>
              <Text style={styles.btnText}>B +</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallBtn} onPress={() => setScoreB(s => Math.max(0, s - 1))}>
              <Text style={styles.btnText}>B -</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.row, { marginTop: 10 }]}>
            <TouchableOpacity style={styles.btnDark} onPress={() => {
              setTempMinutes(String(mm));
              setTempSeconds(String(ss));
              setEditingTime(true);
            }}>
              <Text style={styles.btnText}>⏱ EDIT TIME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDark} onPress={handleTogglePeriod}>
              <Text style={styles.btnText}>🔄 PERIOD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* МОДАЛКА РЕДАГУВАННЯ ЧАСУ */}
        <Modal visible={editingTime} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Виставити час</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={tempMinutes}
                    onChangeText={setTempMinutes}
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={tempSeconds}
                    onChangeText={setTempSeconds}
                />
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setEditingTime(false)}>
                  <Text style={styles.modalBtnText}>Скасувати</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={() => {
                  setSeconds(parseInt(tempMinutes || '0') * 60 + parseInt(tempSeconds || '0'));
                  setEditingTime(false);
                }}>
                  <Text style={styles.modalBtnText}>Зберегти</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoText: { color: '#fff', marginBottom: 20 },
  primaryBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold' },
  overlayTop: { position: 'absolute', top: 20, left: 0, right: 0, alignItems: 'center' },
  scoreboard: {
    width: '80%',
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  teamCol: { flex: 1, alignItems: 'center' },
  centerCol: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  teamName: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  score: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  time: { color: '#FBBF24', fontSize: 20, fontWeight: 'bold' },
  period: { color: '#ccc', fontSize: 10 },
  controls: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  row: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, backgroundColor: '#1E90FF', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnAccent: { flex: 1, backgroundColor: '#FF4500', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnDark: { flex: 1, backgroundColor: '#334155', padding: 12, borderRadius: 10, alignItems: 'center' },
  smallBtn: { width: 50, backgroundColor: '#475569', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 300, backgroundColor: '#1E293B', padding: 20, borderRadius: 15 },
  modalTitle: { color: '#fff', textAlign: 'center', marginBottom: 15 },
  timeInputRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  timeInput: { backgroundColor: '#334155', color: '#fff', fontSize: 24, width: 60, textAlign: 'center', borderRadius: 8, padding: 5 },
  timeSeparator: { color: '#fff', fontSize: 24, marginHorizontal: 5 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#64748B' },
  modalBtnSave: { backgroundColor: '#10B981' },
  modalBtnText: { color: '#fff', fontWeight: 'bold' }
});