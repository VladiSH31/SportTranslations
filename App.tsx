import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ImagePicker from 'expo-image-picker';

// ============================================
// TYPES & CONFIG
// ============================================
type Sport = 'football' | 'basketball' | 'hockey' | 'volleyball' | 'tennis' | 'padel';

interface MatchSettings {
  teamA: string;
  teamB: string;
  colorA: string;
  colorB: string;
  logoAUri?: string | null;
  logoBUri?: string | null;
}

const SPORTS: Record<Sport, any> = {
  football: { name: 'Футбол', icon: '⚽', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 2, periodLabel: (p: number) => (p === 1 ? '1st HALF' : '2nd HALF') },
  basketball: { name: 'Баскетбол', icon: '🏀', timerMode: 'countdown', defaultTime: 600, scoreButtons: [1, 2, 3], periods: 4, periodLabel: (p: number) => `${p} QUARTER` },
  hockey: { name: 'Хокей', icon: '🏒', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 3, periodLabel: (p: number) => `${p} PERIOD` },
  volleyball: { name: 'Волейбол', icon: '🏐', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 5, periodLabel: (p: number) => `SET ${p}` },
  tennis: { name: 'Теніс', icon: '🎾', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 5, periodLabel: (p: number) => `SET ${p}` },
  padel: { name: 'Падел', icon: '🎾', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 3, periodLabel: (p: number) => `SET ${p}` },
};

const PRESET_COLORS = ['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#FFFFFF'];

// Helper to determine text color based on team color (for visibility)
const getVisibleTextColor = (color: string) => {
  if (color === '#000000') return '#FFFFFF'; // If team color is black, show white text
  return color;
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [matchSettings, setMatchSettings] = useState<MatchSettings | null>(null);

  useEffect(() => {
    if (matchSettings) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.unlockAsync();
    }
  }, [matchSettings]);

  if (!permission?.granted) {
    return (
        <View style={[styles.container, styles.center]}>
          <Text style={styles.infoText}>Потрібен дозвіл на камеру</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Надати дозвіл</Text>
          </TouchableOpacity>
        </View>
    );
  }

  if (!selectedSport) return <SportSelectionScreen onSelect={setSelectedSport} />;
  if (!matchSettings) return <MatchSetupScreen sport={selectedSport} onBack={() => setSelectedSport(null)} onStart={setMatchSettings} />;

  return <StreamingScreen sport={selectedSport} settings={matchSettings} onBack={() => setMatchSettings(null)} />;
}

// ============================================
// 1. SPORT SELECTION
// ============================================
function SportSelectionScreen({ onSelect }: { onSelect: (sport: Sport) => void }) {
  return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.sportHeader}>
          <Text style={styles.sportTitle}>Sport Translations</Text>
          <Text style={styles.sportSubTitle}>Оберіть вид спорту</Text>
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
// 2. MATCH SETUP (WITH PREVIEW)
// ============================================
function MatchSetupScreen({ sport, onBack, onStart }: { sport: Sport, onBack: () => void, onStart: (s: MatchSettings) => void }) {
  const [teamA, setTeamA] = useState('AAA');
  const [teamB, setTeamB] = useState('BBB');
  const [colorA, setColorA] = useState(PRESET_COLORS[2]);
  const [colorB, setColorB] = useState(PRESET_COLORS[3]);
  const [logoA, setLogoA] = useState<string | null>(null);
  const [logoB, setLogoB] = useState<string | null>(null);

  const pickLogo = async (side: 'A' | 'B') => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) {
      if (side === 'A') setLogoA(result.assets[0].uri);
      else setLogoB(result.assets[0].uri);
    }
  };

  return (
      <View style={styles.container}>
        <View style={styles.setupHeader}>
          <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← Назад</Text></TouchableOpacity>
          <Text style={styles.setupTitle}>Налаштування матчу</Text>
        </View>

        <ScrollView style={{ padding: 16 }}>
          {/* PREVIEW SECTION */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>ПОПЕРЕДНІЙ ПЕРЕГЛЯД ТАБЛО</Text>
            <View style={styles.compactScoreboardPreview}>
              <View style={styles.sbTeam}>
                <View style={styles.sbTeamTop}>
                  {logoA ? <Image source={{ uri: logoA }} style={styles.sbLogo} /> : <View style={[styles.sbLogoFallback, { backgroundColor: colorA }]} />}
                  <Text style={[styles.sbTeamName, { color: getVisibleTextColor(colorA) }]} numberOfLines={1}>{teamA}</Text>
                </View>
                <Text style={styles.sbScore}>0</Text>
              </View>
              <View style={styles.sbCenter}>
                <Text style={styles.sbTime}>00:00</Text>
                <Text style={styles.sbPeriod}>{SPORTS[sport].periodLabel(1)}</Text>
              </View>
              <View style={styles.sbTeam}>
                <View style={styles.sbTeamTop}>
                  <Text style={[styles.sbTeamName, { color: getVisibleTextColor(colorB) }]} numberOfLines={1}>{teamB}</Text>
                  {logoB ? <Image source={{ uri: logoB }} style={styles.sbLogo} /> : <View style={[styles.sbLogoFallback, { backgroundColor: colorB }]} />}
                </View>
                <Text style={styles.sbScore}>0</Text>
              </View>
            </View>
          </View>

          {/* TEAM A SETUP */}
          <View style={styles.setupCard}>
            <Text style={styles.label}>Команда А</Text>
            <TextInput style={styles.input} value={teamA} onChangeText={setTeamA} placeholder="Назва" placeholderTextColor="#64748B" />
            <View style={styles.colorRow}>
              {PRESET_COLORS.map(c => (
                  <TouchableOpacity key={c} onPress={() => setColorA(c)} style={[styles.colorCircle, { backgroundColor: c, borderWidth: colorA === c ? 3 : 0, borderColor: '#fff' }]} />
              ))}
            </View>
            <TouchableOpacity style={styles.logoBtn} onPress={() => pickLogo('A')}>
              <Text style={styles.logoBtnText}>{logoA ? '✅ Логотип обрано' : '＋ Додати логотип'}</Text>
            </TouchableOpacity>
          </View>

          {/* TEAM B SETUP */}
          <View style={styles.setupCard}>
            <Text style={styles.label}>Команда B</Text>
            <TextInput style={styles.input} value={teamB} onChangeText={setTeamB} placeholder="Назва" placeholderTextColor="#64748B" />
            <View style={styles.colorRow}>
              {PRESET_COLORS.map(c => (
                  <TouchableOpacity key={c} onPress={() => setColorB(c)} style={[styles.colorCircle, { backgroundColor: c, borderWidth: colorB === c ? 3 : 0, borderColor: '#fff' }]} />
              ))}
            </View>
            <TouchableOpacity style={styles.logoBtn} onPress={() => pickLogo('B')}>
              <Text style={styles.logoBtnText}>{logoB ? '✅ Логотип обрано' : '＋ Додати логотип'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={() => onStart({ teamA, teamB, colorA, colorB, logoAUri: logoA, logoBUri: logoB })}>
            <Text style={styles.startBtnText}>ДАЛІ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
  );
}

// ============================================
// 3. STREAMING SCREEN
// ============================================
function StreamingScreen({ sport, settings, onBack }: { sport: Sport; settings: MatchSettings; onBack: () => void }) {
  const config = SPORTS[sport];
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [period, setPeriod] = useState(1);
  const [seconds, setSeconds] = useState(config.defaultTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setSeconds(s => config.timerMode === 'countdown' ? Math.max(0, s - 1) : s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  return (
      <View style={styles.fullscreenContainer}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" mode="video" />

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}><Text style={styles.backBtnText}>← SETUP</Text></TouchableOpacity>
          <View style={styles.compactScoreboard}>
            <View style={styles.sbTeam}>
              <View style={styles.sbTeamTop}>
                {settings.logoAUri ? <Image source={{ uri: settings.logoAUri }} style={styles.sbLogo} /> : <View style={[styles.sbLogoFallback, { backgroundColor: settings.colorA }]} />}
                <Text style={[styles.sbTeamName, { color: getVisibleTextColor(settings.colorA) }]} numberOfLines={1}>{settings.teamA}</Text>
              </View>
              <Text style={styles.sbScore}>{scoreA}</Text>
            </View>
            <View style={styles.sbCenter}>
              <Text style={styles.sbTime}>{Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}</Text>
              <Text style={styles.sbPeriod}>{config.periodLabel(period)}</Text>
            </View>
            <View style={styles.sbTeam}>
              <View style={styles.sbTeamTop}>
                <Text style={[styles.sbTeamName, { color: getVisibleTextColor(settings.colorB) }]} numberOfLines={1}>{settings.teamB}</Text>
                {settings.logoBUri ? <Image source={{ uri: settings.logoBUri }} style={styles.sbLogo} /> : <View style={[styles.sbLogoFallback, { backgroundColor: settings.colorB }]} />}
              </View>
              <Text style={styles.sbScore}>{scoreB}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.liveBtn, isLive && styles.liveBtnActive]} onPress={() => setIsLive(!isLive)}>
            <Text style={styles.liveBtnText}>{isLive ? '🔴 LIVE' : '⚪ OFFLINE'}</Text>
          </TouchableOpacity>
        </View>

        {/* CONTROLS */}
        <View style={styles.leftControls}>
          {config.scoreButtons.map((p: number) => (
              <TouchableOpacity key={p} style={[styles.scoreBtn, {backgroundColor: settings.colorA}]} onPress={() => setScoreA(s => s + p)}>
                <Text style={styles.scoreBtnText}>+{p}</Text>
              </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.scoreBtnMinus} onPress={() => setScoreA(s => Math.max(0, s - 1))}><Text style={styles.scoreBtnText}>−</Text></TouchableOpacity>
        </View>

        <View style={styles.rightControls}>
          {config.scoreButtons.map((p: number) => (
              <TouchableOpacity key={p} style={[styles.scoreBtn, {backgroundColor: settings.colorB}]} onPress={() => setScoreB(s => s + p)}>
                <Text style={styles.scoreBtnText}>+{p}</Text>
              </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.scoreBtnMinus} onPress={() => setScoreB(s => Math.max(0, s - 1))}><Text style={styles.scoreBtnText}>−</Text></TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.systemBtn} onPress={() => setTimerRunning(!timerRunning)}><Text style={styles.systemBtnText}>{timerRunning ? '⏸' : '▶'}</Text></TouchableOpacity>
          <View style={styles.periodGroup}>
            <TouchableOpacity style={styles.periodBtn} onPress={() => setPeriod(p => Math.max(1, p-1))}><Text style={styles.periodBtnText}>◀</Text></TouchableOpacity>
            <Text style={styles.periodLabel}>PERIOD</Text>
            <TouchableOpacity style={styles.periodBtn} onPress={() => setPeriod(p => Math.min(config.periods, p+1))}><Text style={styles.periodBtnText}>▶</Text></TouchableOpacity>
          </View>
        </View>
      </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  fullscreenContainer: { flex: 1, backgroundColor: '#000' },
  center: { justifyContent: 'center', alignItems: 'center' },
  infoText: { color: '#fff', marginBottom: 20 },
  primaryBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold' },

  // Sport Selection
  sportHeader: { padding: 40, alignItems: 'center' },
  sportTitle: { color: '#FBBF24', fontSize: 28, fontWeight: 'bold' },
  sportSubTitle: { color: '#94A3B8', fontSize: 14, marginTop: 5 },
  sportGrid: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sportCard: { width: '47%', backgroundColor: '#1E293B', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  sportIcon: { fontSize: 40, marginBottom: 10 },
  sportName: { color: '#fff', fontWeight: '600' },

  // Setup Screen
  setupHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#1E293B' },
  backText: { color: '#3B82F6', marginRight: 20, fontWeight: 'bold' },
  setupTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  setupCard: { backgroundColor: '#1E293B', padding: 15, borderRadius: 15, marginBottom: 15 },
  label: { color: '#94A3B8', marginBottom: 10, fontSize: 12, fontWeight: 'bold' },
  input: { backgroundColor: '#0F172A', color: '#fff', padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 15 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  colorCircle: { width: 35, height: 35, borderRadius: 18 },
  logoBtn: { backgroundColor: '#334155', padding: 10, borderRadius: 10, alignItems: 'center' },
  logoBtnText: { color: '#fff', fontSize: 12 },
  startBtn: { backgroundColor: '#10B981', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Preview
  previewContainer: { backgroundColor: '#1E293B', padding: 15, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
  previewLabel: { color: '#FBBF24', fontSize: 10, fontWeight: 'bold', marginBottom: 15 },
  compactScoreboardPreview: { width: '100%', flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },

  // Streaming UI
  topBar: { position: 'absolute', top: 15, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  compactScoreboard: { width: '55%', flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  sbTeam: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sbTeamTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sbLogo: { width: 20, height: 20, borderRadius: 4 },
  sbLogoFallback: { width: 20, height: 20, borderRadius: 4 },
  sbTeamName: { fontSize: 10, fontWeight: 'bold', maxWidth: 70 },
  sbCenter: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sbScore: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  sbTime: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  sbPeriod: { color: '#94A3B8', fontSize: 8, fontWeight: 'bold' },
  liveBtn: { backgroundColor: 'rgba(51, 65, 85, 0.8)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  liveBtnActive: { backgroundColor: 'rgba(220, 38, 38, 0.9)' },
  liveBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  leftControls: { position: 'absolute', left: 20, top: 80, bottom: 80, justifyContent: 'center', gap: 8 },
  rightControls: { position: 'absolute', right: 20, top: 80, bottom: 80, justifyContent: 'center', gap: 8 },
  scoreBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  scoreBtnMinus: { backgroundColor: 'rgba(51, 65, 85, 0.9)', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  scoreBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  bottomControls: { position: 'absolute', bottom: 25, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15 },
  systemBtn: { backgroundColor: 'rgba(51, 65, 85, 0.9)', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  systemBtnActive: { backgroundColor: 'rgba(37, 99, 235, 0.9)' },
  systemBtnText: { fontSize: 20 },
  periodGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(51, 65, 85, 0.9)', borderRadius: 12, paddingHorizontal: 5 },
  periodBtn: { padding: 12 },
  periodBtnText: { color: '#fff', fontSize: 18 },
  periodLabel: { color: '#94A3B8', fontSize: 9, fontWeight: 'bold', marginHorizontal: 5 },
});