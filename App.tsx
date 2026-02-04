import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Alert, Switch, Image, Modal, StatusBar, KeyboardAvoidingView, Platform, FlatList
} from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ============================================
// TYPES & CONFIG
// ============================================
type Sport = 'football' | 'basketball' | 'hockey' | 'volleyball' | 'tennis' | 'padel';

interface MatchSettings {
  sport: Sport;
  teamA: string;
  teamB: string;
  colorA: string;
  colorB: string;
  logoAUri?: string | null;
  logoBUri?: string | null;
}

interface StreamConfig {
  platform: 'youtube' | 'twitch' | 'custom';
  rtmpUrl?: string;
  streamKey?: string;
  saveToPhone: boolean;
}

interface HistoryItem {
  id: string;
  date: string;
  sport: Sport;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  duration: string;
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

const getVisibleTextColor = (color: string) => {
  if (color === '#000000') return '#FFFFFF';
  return color;
};

// ============================================
// CONTEXT FOR HISTORY
// ============================================
const HistoryContext = createContext<{
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
}>({ history: [], addToHistory: () => {} });

const Stack = createStackNavigator();

// ============================================
// 1. WELCOME SCREEN
// ============================================
function WelcomeScreen({ navigation }: any) {
  useFocusEffect(
      React.useCallback(() => {
        ScreenOrientation.unlockAsync();
      }, [])
  );

  return (
      <LinearGradient colors={['#0F172A', '#1e1b4b', '#000000']} style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="videocam" size={64} color="#a5b4fc" />
          </View>
          <Text style={styles.mainTitle}>SPORT TRANSLATIONS</Text>
          <Text style={styles.subTitle}>PROFESSIONAL STREAMING TOOL</Text>

          <View style={{ width: '100%', marginTop: 60, gap: 20 }}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('SportSelection')}>
              <LinearGradient colors={['#4f46e5', '#4338ca']} style={styles.btnGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
                <Ionicons name="play" size={24} color="white" style={{ marginRight: 10 }} />
                <Text style={styles.primaryBtnText}>START NEW STREAM</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('History')}>
              <Ionicons name="time-outline" size={24} color="#94A3B8" style={{ marginRight: 10 }} />
              <Text style={styles.secondaryBtnText}>HISTORY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
  );
}

// ============================================
// 1.1 HISTORY SCREEN
// ============================================
function HistoryScreen({ navigation }: any) {
  const { history } = useContext(HistoryContext);

  useFocusEffect(
      React.useCallback(() => {
        ScreenOrientation.unlockAsync();
      }, [])
  );

  const renderItem = ({ item }: { item: HistoryItem }) => (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>{SPORTS[item.sport].icon}</Text>
            <Text style={styles.historyDate}>{item.date}</Text>
          </View>
          <Text style={styles.historyDuration}>Duration: {item.duration}</Text>
        </View>

        <View style={styles.historyScoreRow}>
          <Text style={styles.historyTeam} numberOfLines={1}>{item.teamA}</Text>
          <View style={styles.historyScoreBox}>
            <Text style={styles.historyScore}>{item.scoreA} - {item.scoreB}</Text>
          </View>
          <Text style={[styles.historyTeam, { textAlign: 'right' }]} numberOfLines={1}>{item.teamB}</Text>
        </View>
      </View>
  );

  return (
      <LinearGradient colors={['#0F172A', '#1e1b4b', '#000000']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#cbd5e1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BROADCAST HISTORY</Text>
        </View>

        {history.length === 0 ? (
            <View style={styles.centerContent}>
              <Ionicons name="file-tray-outline" size={48} color="#475569" />
              <Text style={{ color: '#64748B', marginTop: 10 }}>No recent broadcasts</Text>
            </View>
        ) : (
            <FlatList
                data={[...history].reverse()}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
            />
        )}
      </LinearGradient>
  );
}

// ============================================
// 2. SPORT SELECTION
// ============================================
function SportSelectionScreen({ navigation }: any) {
  return (
      <LinearGradient colors={['#0F172A', '#1e1b4b', '#000000']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#cbd5e1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SELECT SPORT</Text>
        </View>

        <ScrollView contentContainerStyle={styles.sportGrid}>
          {(Object.keys(SPORTS) as Sport[]).map((key) => (
              <TouchableOpacity key={key} style={styles.sportCard} onPress={() => navigation.navigate('MatchSetup', { sport: key })}>
                <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.cardGradient}>
                  <Text style={styles.sportIcon}>{SPORTS[key].icon}</Text>
                  <Text style={styles.sportName}>{SPORTS[key].name.toUpperCase()}</Text>
                </LinearGradient>
              </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
  );
}

// ============================================
// 3. MATCH SETUP
// ============================================
function MatchSetupScreen({ route, navigation }: any) {
  const { sport } = route.params;
  const [teamA, setTeamA] = useState('HOME');
  const [teamB, setTeamB] = useState('GUEST');
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

  const handleNext = () => {
    const settings: MatchSettings = { sport, teamA, teamB, colorA, colorB, logoAUri: logoA, logoBUri: logoB };
    navigation.navigate('PlatformSelection', { matchSettings: settings });
  };

  return (
      <LinearGradient colors={['#0F172A', '#1e1b4b', '#000000']} style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
              <Ionicons name="arrow-back" size={24} color="#cbd5e1" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>MATCH SETUP</Text>
          </View>

          <ScrollView style={{ padding: 16 }}>
            {/* PREVIEW SECTION */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>SCOREBOARD PREVIEW</Text>
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
              <View style={styles.cardHeader}>
                <View style={[styles.teamIndicator, { backgroundColor: colorA }]} />
                <Text style={styles.cardTitle}>TEAM A</Text>
              </View>
              <TextInput style={styles.input} value={teamA} onChangeText={setTeamA} placeholder="Team Name" placeholderTextColor="#64748B" />
              <View style={styles.colorRow}>
                {PRESET_COLORS.map(c => (
                    <TouchableOpacity key={c} onPress={() => setColorA(c)} style={[styles.colorCircle, { backgroundColor: c, borderWidth: colorA === c ? 2 : 0, borderColor: '#fff' }]} />
                ))}
              </View>
              <TouchableOpacity style={styles.logoBtn} onPress={() => pickLogo('A')}>
                <Ionicons name={logoA ? "checkmark-circle" : "image-outline"} size={20} color={logoA ? "#10B981" : "#94A3B8"} />
                <Text style={[styles.logoBtnText, logoA && { color: '#10B981' }]}>{logoA ? 'Logo Uploaded' : 'Upload Logo'}</Text>
              </TouchableOpacity>
            </View>

            {/* TEAM B SETUP */}
            <View style={styles.setupCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.teamIndicator, { backgroundColor: colorB }]} />
                <Text style={styles.cardTitle}>TEAM B</Text>
              </View>
              <TextInput style={styles.input} value={teamB} onChangeText={setTeamB} placeholder="Team Name" placeholderTextColor="#64748B" />
              <View style={styles.colorRow}>
                {PRESET_COLORS.map(c => (
                    <TouchableOpacity key={c} onPress={() => setColorB(c)} style={[styles.colorCircle, { backgroundColor: c, borderWidth: colorB === c ? 2 : 0, borderColor: '#fff' }]} />
                ))}
              </View>
              <TouchableOpacity style={styles.logoBtn} onPress={() => pickLogo('B')}>
                <Ionicons name={logoB ? "checkmark-circle" : "image-outline"} size={20} color={logoB ? "#10B981" : "#94A3B8"} />
                <Text style={[styles.logoBtnText, logoB && { color: '#10B981' }]}>{logoB ? 'Logo Uploaded' : 'Upload Logo'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <LinearGradient colors={['#4f46e5', '#4338ca']} style={styles.btnGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
                <Text style={styles.primaryBtnText}>CONTINUE</Text>
                <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 10 }} />
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
  );
}

// ============================================
// 4. PLATFORM SELECTION
// ============================================
function PlatformSelectionScreen({ route, navigation }: any) {
  const { matchSettings } = route.params;
  const [saveLocal, setSaveLocal] = useState(true);

  const platforms = [
    { id: 'youtube', name: 'YouTube Live', icon: 'logo-youtube', color: '#FF0000' },
    { id: 'twitch', name: 'Twitch', icon: 'logo-twitch', color: '#9146FF' },
    { id: 'custom', name: 'Custom RTMP', icon: 'server-outline', color: '#3B82F6' },
  ];

  return (
      <LinearGradient colors={['#0F172A', '#1e1b4b', '#000000']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#cbd5e1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SELECT PLATFORM</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {platforms.map(p => (
              <TouchableOpacity
                  key={p.id}
                  style={styles.platformCard}
                  onPress={() => navigation.navigate('StreamConfig', { matchSettings, platform: p.id, saveLocal })}
              >
                <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.cardGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
                  <View style={[styles.iconContainer, { backgroundColor: `${p.color}20` }]}>
                    <Ionicons name={p.icon as any} size={28} color={p.color} />
                  </View>
                  <Text style={styles.platformText}>{p.name}</Text>
                  <Ionicons name="chevron-forward" size={24} color="#475569" style={{ marginLeft: 'auto' }} />
                </LinearGradient>
              </TouchableOpacity>
          ))}

          <View style={styles.switchContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="save-outline" size={24} color="#94A3B8" style={{ marginRight: 15 }} />
              <View>
                <Text style={styles.switchTitle}>Local Recording</Text>
                <Text style={styles.switchSub}>Save copy to gallery</Text>
              </View>
            </View>
            <Switch
                value={saveLocal}
                onValueChange={setSaveLocal}
                trackColor={{ false: "#334155", true: "#4f46e5" }}
                thumbColor="white"
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
  );
}

// ============================================
// 5. STREAM CONFIG
// ============================================
function StreamConfigScreen({ route, navigation }: any) {
  const { matchSettings, platform, saveLocal } = route.params;
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  return (
      <LinearGradient colors={['#0F172A', '#1e1b4b', '#000000']} style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
              <Ionicons name="arrow-back" size={24} color="#cbd5e1" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>STREAM CONFIG</Text>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <View style={styles.configCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="settings-outline" size={20} color="#a5b4fc" style={{ marginRight: 10 }} />
                <Text style={styles.cardTitle}>RTMP SETTINGS</Text>
              </View>

              {(platform === 'custom' || platform === 'youtube') && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>SERVER URL</Text>
                    <TextInput
                        style={styles.input}
                        value={url}
                        onChangeText={setUrl}
                        placeholder="rtmp://..."
                        placeholderTextColor="#475569"
                        autoCapitalize="none"
                    />
                  </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>STREAM KEY</Text>
                <TextInput
                    style={styles.input}
                    value={key}
                    onChangeText={setKey}
                    secureTextEntry
                    placeholder="••••••••••••"
                    placeholderTextColor="#475569"
                />
              </View>
            </View>

            <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 30 }]}
                onPress={() => navigation.navigate('Streaming', { matchSettings, streamConfig: { platform, rtmpUrl: url, streamKey: key, saveToPhone: saveLocal } })}
            >
              <LinearGradient colors={['#dc2626', '#991b1b']} style={styles.btnGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
                <Ionicons name="radio-outline" size={24} color="white" style={{ marginRight: 10 }} />
                <Text style={styles.primaryBtnText}>GO LIVE</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
  );
}

// ============================================
// 6. STREAMING SCREEN
// ============================================
function StreamingScreen({ route, navigation }: any) {
  const { matchSettings, streamConfig } = route.params;
  const { addToHistory } = useContext(HistoryContext);
  const settings = matchSettings as MatchSettings;
  const config = SPORTS[settings.sport];

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [period, setPeriod] = useState(1);
  const [seconds, setSeconds] = useState(config.defaultTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const [editTimeVisible, setEditTimeVisible] = useState(false);
  const [tempMinutes, setTempMinutes] = useState('0');
  const [tempSeconds, setTempSeconds] = useState('0');

  // Жорстка фіксація ландшафту ТІЛЬКИ для цього екрану
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setSeconds(s => config.timerMode === 'countdown' ? Math.max(0, s - 1) : s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // Логіка кнопки LIVE / OFFLINE
  const handleLiveToggle = () => {
    if (!isLive) {
      // START STREAM (Broadcast only)
      setIsLive(true);
      setStartTime(new Date());
      // Таймер гри НЕ запускаємо автоматично
    } else {
      // STOP STREAM REQUEST
      confirmStopStream();
    }
  };

  // Логіка кнопки EXIT
  const handleExitPress = () => {
    if (isLive) {
      confirmStopStream();
    } else {
      navigation.goBack();
    }
  };

  const confirmStopStream = () => {
    Alert.alert(
        'Завершити трансляцію?',
        'Зупинити ефір та зберегти в історію?',
        [
          {text: 'Ні', style: 'cancel'},
          {
            text: 'Так, завершити',
            style: 'destructive',
            onPress: stopStreamAndSave
          }
        ]
    );
  };

  const stopStreamAndSave = async () => {
    setIsLive(false);
    setTimerRunning(false); // Зупиняємо ігровий таймер при завершенні ефіру

    // Формуємо запис для історії (тривалість ефіру)
    const now = new Date();
    const durationMs = startTime ? now.getTime() - startTime.getTime() : 0;
    const durationMin = Math.floor(durationMs / 60000);
    const durationSec = Math.floor((durationMs % 60000) / 1000);

    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      date: now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      sport: settings.sport,
      teamA: settings.teamA,
      teamB: settings.teamB,
      scoreA: scoreA,
      scoreB: scoreB,
      duration: `${durationMin}:${durationSec.toString().padStart(2, '0')}`
    };

    addToHistory(historyItem);

    await ScreenOrientation.unlockAsync();
    navigation.navigate('History');
  };

  const openEditTime = () => {
    setTempMinutes(Math.floor(seconds / 60).toString());
    setTempSeconds((seconds % 60).toString());
    setEditTimeVisible(true);
  };

  const saveTime = () => {
    const newSec = parseInt(tempMinutes || '0') * 60 + parseInt(tempSeconds || '0');
    setSeconds(newSec);
    setEditTimeVisible(false);
  };

  const handlePeriodChange = (newPeriod: number) => {
    if (newPeriod < 1 || newPeriod > config.periods) return;
    Alert.alert(
        "Зміна періоду",
        `Перейти до ${config.periodLabel(newPeriod)}?`,
        [
          { text: "Без скидання часу", onPress: () => setPeriod(newPeriod) },
          { text: "Зі скиданням часу", onPress: () => { setPeriod(newPeriod); setSeconds(config.defaultTime); setTimerRunning(false); }, style: "destructive" },
          { text: "Скасувати", style: "cancel" }
        ]
    );
  };

  return (
      <View style={styles.fullscreenContainer}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" mode="video" />

        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={handleExitPress}>
            <Text style={styles.backBtnText}>← EXIT</Text>
          </TouchableOpacity>
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
          <TouchableOpacity style={[styles.liveBtn, isLive && styles.liveBtnActive]} onPress={handleLiveToggle}>
            <Text style={styles.liveBtnText}>{isLive ? '🔴 LIVE' : '⚪ OFFLINE'}</Text>
          </TouchableOpacity>
        </View>

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
          <TouchableOpacity style={styles.systemBtn} onPress={openEditTime}>
            <Text style={styles.systemBtnSubText}>TIME</Text>
            <Text style={styles.systemBtnText}>⚙</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.systemBtn, timerRunning && styles.systemBtnActive]} onPress={() => setTimerRunning(!timerRunning)}>
            <Text style={styles.systemBtnText}>{timerRunning ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <View style={styles.periodGroup}>
            <TouchableOpacity style={styles.periodBtn} onPress={() => handlePeriodChange(period - 1)}><Text style={styles.periodBtnText}>◀</Text></TouchableOpacity>
            <Text style={styles.periodLabel}>PERIOD</Text>
            <TouchableOpacity style={styles.periodBtn} onPress={() => handlePeriodChange(period + 1)}><Text style={styles.periodBtnText}>▶</Text></TouchableOpacity>
          </View>
        </View>

        <Modal visible={editTimeVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Виставити час</Text>
              <View style={styles.timeInputRow}>
                <TextInput style={styles.timeInput} keyboardType="number-pad" value={tempMinutes} onChangeText={setTempMinutes} maxLength={3} />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput style={styles.timeInput} keyboardType="number-pad" value={tempSeconds} onChangeText={setTempSeconds} maxLength={2} />
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setEditTimeVisible(false)}><Text style={styles.modalBtnText}>Скасувати</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={saveTime}><Text style={styles.modalBtnText}>Зберегти</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
  );
}

// ============================================
// APP NAVIGATION & PROVIDER
// ============================================
export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [...prev, item]);
  };

  if (!permission) return <View />;
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
      <HistoryContext.Provider value={{ history, addToHistory }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="SportSelection" component={SportSelectionScreen} />
            <Stack.Screen name="MatchSetup" component={MatchSetupScreen} />
            <Stack.Screen name="PlatformSelection" component={PlatformSelectionScreen} />
            <Stack.Screen name="StreamConfig" component={StreamConfigScreen} />
            <Stack.Screen name="Streaming" component={StreamingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </HistoryContext.Provider>
  );
}

// ============================================
// STYLES (DARK STEEL / SILVER / DEEP PURPLE)
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  infoText: { color: '#fff', marginBottom: 20 },

  // HEADERS
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'transparent' },
  headerTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  backIcon: { marginRight: 20, padding: 5 },

  // WELCOME SCREEN
  logoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mainTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  subTitle: { color: '#94a3b8', fontSize: 12, marginTop: 10, letterSpacing: 2, fontWeight: '600' },

  // BUTTONS
  primaryBtn: { borderRadius: 12, overflow: 'hidden', elevation: 5, shadowColor: '#4f46e5', shadowOpacity: 0.5, shadowRadius: 10 },
  btnGradient: { paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },

  secondaryBtn: { backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  secondaryBtnText: { color: '#cbd5e1', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },

  // HISTORY
  historyCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 8 },
  historyDate: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  historyDuration: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  historyScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTeam: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  historyScoreBox: { backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginHorizontal: 10 },
  historyScore: { color: '#FBBF24', fontSize: 16, fontWeight: '800' },

  // SPORT SELECTION
  sportGrid: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sportCard: { width: '48%', marginBottom: 15, borderRadius: 16, overflow: 'hidden', elevation: 4 },
  cardGradient: { padding: 20, alignItems: 'center', justifyContent: 'center', height: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sportIcon: { fontSize: 42, marginBottom: 12 },
  sportName: { color: '#e2e8f0', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },

  // MATCH SETUP
  sectionContainer: { marginBottom: 25 },
  sectionLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 10, letterSpacing: 1 },
  setupCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  teamIndicator: { width: 4, height: 16, borderRadius: 2, marginRight: 10 },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },

  input: { backgroundColor: '#0f172a', color: '#fff', padding: 14, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 15 },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },

  logoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
  logoBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginLeft: 8 },

  // PREVIEW
  compactScoreboardPreview: { width: '100%', flexDirection: 'row', backgroundColor: '#000', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155' },

  // PLATFORM & CONFIG
  platformCard: { marginBottom: 15, borderRadius: 16, overflow: 'hidden' },
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  platformText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, backgroundColor: '#1e293b', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  switchTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  switchSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },

  configCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  inputGroup: { marginTop: 15 },
  label: { color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },

  // STREAMING SCREEN
  fullscreenContainer: { flex: 1, backgroundColor: '#000' },
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
  systemBtn: { backgroundColor: 'rgba(51, 65, 85, 0.9)', width: 60, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  systemBtnActive: { backgroundColor: 'rgba(37, 99, 235, 0.9)' },
  systemBtnText: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold' },
  systemBtnSubText: { fontSize: 8, color: '#94A3B8', fontWeight: 'bold', marginBottom: 2 },
  periodGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(51, 65, 85, 0.9)', borderRadius: 12, paddingHorizontal: 5 },
  periodBtn: { padding: 12 },
  periodBtnText: { color: '#fff', fontSize: 18 },
  periodLabel: { color: '#94A3B8', fontSize: 9, fontWeight: 'bold', marginHorizontal: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 280, backgroundColor: '#1E293B', padding: 20, borderRadius: 15 },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  timeInputRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  timeInput: { backgroundColor: '#334155', color: '#fff', fontSize: 22, width: 55, textAlign: 'center', borderRadius: 8, padding: 8 },
  timeSeparator: { color: '#fff', fontSize: 22, marginHorizontal: 5 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#64748B' },
  modalBtnSave: { backgroundColor: '#10B981' },
  modalBtnText: { color: '#fff', fontWeight: 'bold' },
});