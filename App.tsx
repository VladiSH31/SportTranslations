import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';

// ============================================
// ТИПИ ТА КОНФІГУРАЦІЯ СПОРТІВ
// ============================================
type Sport = 'football' | 'basketball' | 'hockey' | 'volleyball' | 'tennis' | 'padel';

const SPORTS: Record<Sport, any> = {
  football: {
    name: 'Футбол',
    icon: '⚽',
    timerMode: 'countup',
    defaultTime: 0,
    scoreButtons: [1],
    periods: 2,
    periodLabel: (p: number) => (p === 1 ? '1st HALF' : '2nd HALF'),
  },
  basketball: {
    name: 'Баскетбол',
    icon: '🏀',
    timerMode: 'countdown',
    defaultTime: 600, // 10 хвилин
    scoreButtons: [1, 2, 3],
    periods: 4,
    periodLabel: (p: number) => `${p} QUARTER`,
  },
  hockey: {
    name: 'Хокей',
    icon: '🏒',
    timerMode: 'countup',
    defaultTime: 0,
    scoreButtons: [1],
    periods: 3,
    periodLabel: (p: number) => `${p} PERIOD`,
  },
  volleyball: {
    name: 'Волейбол',
    icon: '🏐',
    timerMode: 'countup',
    defaultTime: 0,
    scoreButtons: [1],
    periods: 5,
    periodLabel: (p: number) => `SET ${p}`,
  },
  tennis: {
    name: 'Теніс',
    icon: '🎾',
    timerMode: 'countup',
    defaultTime: 0,
    scoreButtons: [1],
    periods: 5,
    periodLabel: (p: number) => `SET ${p}`,
  },
  padel: {
    name: 'Падел',
    icon: '🎾',
    timerMode: 'countup',
    defaultTime: 0,
    scoreButtons: [1],
    periods: 3,
    periodLabel: (p: number) => `SET ${p}`,
  },
};

// ============================================
// ГОЛОВНИЙ КОМПОНЕНТ
// ============================================
export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  useEffect(() => {
    if (selectedSport) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, [selectedSport]);

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
        {!selectedSport ? (
            <SportSelectionScreen onSelect={setSelectedSport} />
        ) : (
            <StreamingScreen sport={selectedSport} onBack={() => setSelectedSport(null)} />
        )}
      </View>
  );
}

// ============================================
// ЕКРАН ВИБОРУ СПОРТУ (PORTRAIT)
// ============================================
function SportSelectionScreen({ onSelect }: { onSelect: (sport: Sport) => void }) {
  return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.sportHeader}>
          <Text style={styles.sportTitle}>Sport Translations</Text>
          <Text style={styles.sportSubTitle}>Оберіть вид спорту для матчу</Text>
        </View>
        <ScrollView contentContainerStyle={styles.sportGrid}>
          {(Object.keys(SPORTS) as Sport[]).map((key) => (
              <TouchableOpacity key={key} style={styles.sportCard} onPress={() => onSelect(key)}>
                <Text style={styles.sportIcon}>{SPORTS[key].icon}</Text>
                <Text style={styles.sportName}>{SPORTS[key].name}</Text>
              </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
  );
}

// ============================================
// ЕКРАН ТРАНСЛЯЦІЇ (LANDSCAPE)
// ============================================
function StreamingScreen({ sport, onBack }: { sport: Sport; onBack: () => void }) {
  const { width, height } = useWindowDimensions();
  const config = SPORTS[sport];

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [period, setPeriod] = useState(1);
  const [seconds, setSeconds] = useState(config.defaultTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Модалі
  const [editTimeVisible, setEditTimeVisible] = useState(false);
  const [tempMinutes, setTempMinutes] = useState('0');
  const [tempSeconds, setTempSeconds] = useState('0');

  // Таймер матчу
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (config.timerMode === 'countdown') {
          return Math.max(0, s - 1);
        } else {
          return s + 1;
        }
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, config.timerMode]);

  const formatTime = (sec: number) => {
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  // EDIT TIME
  const handleEditTime = () => {
    setTempMinutes(String(Math.floor(seconds / 60)));
    setTempSeconds(String(seconds % 60));
    setEditTimeVisible(true);
  };

  const handleSaveTime = () => {
    const newSeconds = parseInt(tempMinutes || '0') * 60 + parseInt(tempSeconds || '0');
    setSeconds(newSeconds);
    setEditTimeVisible(false);
  };

  // RESET TIME
  const handleResetTime = () => {
    setSeconds(config.defaultTime);
    setTimerRunning(false);
  };

  // PERIOD CHANGE
  const handlePeriodChange = (direction: 'next' | 'prev') => {
    const newPeriod = direction === 'next' ? period + 1 : period - 1;
    if (newPeriod < 1 || newPeriod > config.periods) return;

    Alert.alert(
        'Змінити період?',
        `Перейти до ${config.periodLabel(newPeriod)}?`,
        [
          { text: 'Скасувати', style: 'cancel' },
          {
            text: 'Без обнулення',
            onPress: () => {
              setPeriod(newPeriod);
            },
          },
          {
            text: 'З обнуленням',
            onPress: () => {
              setPeriod(newPeriod);
              setSeconds(config.defaultTime);
              setTimerRunning(false);
            },
            style: 'destructive',
          },
        ]
    );
  };

  return (
      <View style={styles.container}>
        <StatusBar hidden />

        {/* CAMERA VIEW (65%) */}
        <View style={{ height: '65%', backgroundColor: '#000' }}>
          <CameraView style={StyleSheet.absoluteFill} facing="back" mode="video" />

          {/* SCOREBOARD OVERLAY */}
          <View style={styles.overlayContainer}>
            <View style={styles.minimalScoreboard}>
              <View style={styles.teamInfo}>
                <Text style={styles.overlayTeamName}>TEAM A</Text>
                <Text style={styles.overlayScore}>{scoreA}</Text>
              </View>
              <View style={styles.timerInfo}>
                <Text style={styles.overlayTime}>{formatTime(seconds)}</Text>
                <Text style={styles.overlayPeriod}>{config.periodLabel(period)}</Text>
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.overlayTeamName}>TEAM B</Text>
                <Text style={styles.overlayScore}>{scoreB}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← BACK</Text>
          </TouchableOpacity>

          {isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
          )}
        </View>

        {/* CONTROL PANEL (35%) */}
        <View style={styles.controlPanel}>
          {/* TOP ROW: TEAM CONTROLS */}
          <View style={styles.mainControlsRow}>
            {/* TEAM A BUTTONS */}
            <View style={styles.controlGroup}>
              <Text style={styles.groupLabel}>TEAM A</Text>
              <View style={styles.btnRow}>
                {config.scoreButtons.map((p: number) => (
                    <TouchableOpacity
                        key={p}
                        style={styles.yellowBtn}
                        onPress={() => setScoreA((s) => s + p)}
                    >
                      <Text style={styles.btnText}>+{p}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={styles.grayBtn}
                    onPress={() => setScoreA((s) => Math.max(0, s - 1))}
                >
                  <Text style={styles.btnText}>−</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CENTER SYSTEM CONTROLS */}
            <View style={styles.systemGroup}>
              <TouchableOpacity style={styles.sysBtn} onPress={handleEditTime}>
                <Text style={styles.sysBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sysBtn} onPress={handleResetTime}>
                <Text style={styles.sysBtnText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.sysBtn, timerRunning && styles.sysBtnActive]}
                  onPress={() => setTimerRunning(!timerRunning)}
              >
                <Text style={styles.sysBtnText}>{timerRunning ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
            </View>

            {/* TEAM B BUTTONS */}
            <View style={styles.controlGroup}>
              <Text style={styles.groupLabel}>TEAM B</Text>
              <View style={styles.btnRow}>
                {config.scoreButtons.map((p: number) => (
                    <TouchableOpacity
                        key={p}
                        style={styles.yellowBtn}
                        onPress={() => setScoreB((s) => s + p)}
                    >
                      <Text style={styles.btnText}>+{p}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={styles.grayBtn}
                    onPress={() => setScoreB((s) => Math.max(0, s - 1))}
                >
                  <Text style={styles.btnText}>−</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* BOTTOM ROW: PERIOD + GO LIVE */}
          <View style={styles.bottomControlsRow}>
            <View style={styles.periodControl}>
              <TouchableOpacity
                  style={styles.periodBtn}
                  onPress={() => handlePeriodChange('prev')}
                  disabled={period === 1}
              >
                <Text style={styles.periodBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.periodLabel}>PERIOD</Text>
              <TouchableOpacity
                  style={styles.periodBtn}
                  onPress={() => handlePeriodChange('next')}
                  disabled={period === config.periods}
              >
                <Text style={styles.periodBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.liveActionBtn, isLive && styles.liveActionBtnActive]}
                onPress={() => setIsLive(!isLive)}
            >
              <Text style={styles.liveActionBtnText}>{isLive ? '⏹ STOP' : '🔴 GO LIVE'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MODAL: EDIT TIME */}
        <Modal visible={editTimeVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Виставити час</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={tempMinutes}
                    onChangeText={setTempMinutes}
                    maxLength={3}
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={tempSeconds}
                    onChangeText={setTempSeconds}
                    maxLength={2}
                />
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnCancel]}
                    onPress={() => setEditTimeVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Скасувати</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSave]}
                    onPress={handleSaveTime}
                >
                  <Text style={styles.modalBtnText}>Зберегти</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
  );
}

// ============================================
// СТИЛІ
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { justifyContent: 'center', alignItems: 'center' },
  infoText: { color: '#fff', marginBottom: 20 },
  primaryBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold' },

  // Sport Selection
  sportHeader: { padding: 40, alignItems: 'center' },
  sportTitle: { color: '#FBBF24', fontSize: 28, fontWeight: 'bold' },
  sportSubTitle: { color: '#94A3B8', fontSize: 14, marginTop: 5 },
  sportGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sportCard: {
    width: '47%',
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sportIcon: { fontSize: 40, marginBottom: 10 },
  sportName: { color: '#fff', fontWeight: '600' },

  // Streaming Screen
  overlayContainer: { position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center' },
  minimalScoreboard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 8,
    width: '60%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  teamInfo: { flex: 1, alignItems: 'center' },
  timerInfo: {
    flex: 1.2,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  overlayTeamName: { color: '#fff', fontSize: 10, fontWeight: 'bold', opacity: 0.8 },
  overlayScore: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  overlayTime: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  overlayPeriod: { color: '#94A3B8', fontSize: 8, fontWeight: 'bold' },

  backBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 5,
  },
  backBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  liveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 5 },
  liveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Control Panel
  controlPanel: { height: '35%', backgroundColor: '#0F172A', padding: 10, justifyContent: 'space-between' },
  mainControlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bottomControlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  controlGroup: { flex: 1, alignItems: 'center' },
  systemGroup: { width: 100, alignItems: 'center', gap: 5 },
  groupLabel: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  btnRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', justifyContent: 'center' },
  yellowBtn: {
    backgroundColor: '#FBBF24',
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grayBtn: {
    backgroundColor: '#334155',
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  sysBtn: {
    backgroundColor: '#334155',
    width: 50,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sysBtnActive: { backgroundColor: '#1E90FF' },
  sysBtnText: { color: '#fff', fontSize: 18 },

  periodControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 8,
    gap: 5,
  },
  periodBtn: { padding: 8 },
  periodBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  periodLabel: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },

  liveActionBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveActionBtnActive: { backgroundColor: '#7C2D12' },
  liveActionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: { width: 300, backgroundColor: '#1E293B', padding: 20, borderRadius: 15 },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeInput: {
    backgroundColor: '#334155',
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
    borderRadius: 8,
    padding: 8,
  },
  timeSeparator: { color: '#fff', fontSize: 24, marginHorizontal: 8 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#64748B' },
  modalBtnSave: { backgroundColor: '#10B981' },
  modalBtnText: { color: '#fff', fontWeight: 'bold' },
});