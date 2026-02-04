import React, { useEffect, useState } from 'react';
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
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ImagePicker from 'expo-image-picker';

// ============================================
// TYPES & CONFIG
// ============================================
type Sport = 'football' | 'basketball' | 'hockey' | 'volleyball' | 'tennis' | 'padel';
type Platform = 'facebook' | 'youtube' | 'twitch' | 'rtmp' | 'local';

interface MatchSettings {
  teamA: string;
  teamB: string;
  colorA: string;
  colorB: string;
  logoAUri?: string | null;
  logoBUri?: string | null;
}

interface StreamConfig {
  platform: Platform;
  url?: string;
  streamKey?: string;
  sponsors: string[];
  breakGraphics: string[];
}

interface MatchHistoryItem {
  id: string;
  teamA: string;
  teamB: string;
  colorA: string;
  colorB: string;
  date: string;
  sport: Sport;
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

const Stack = createStackNavigator();

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [permission, requestPermission] = useCameraPermissions();

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

  return (
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#0F172A' },
            }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="SportSelection" component={SportSelectionScreen} />
          <Stack.Screen name="MatchSetup" component={MatchSetupScreen} />
          <Stack.Screen name="PlatformSelection" component={PlatformSelectionScreen} />
          <Stack.Screen name="StreamConfig" component={StreamConfigScreen} />
          <Stack.Screen name="Streaming" component={StreamingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

// ============================================
// 1. WELCOME SCREEN (Головна)
// ============================================
function WelcomeScreen({ navigation }: any) {
  return (
      <View style={styles.container}>
        <View style={styles.welcomeHeader}>
          <Text style={styles.logoText}>
            SPORT<Text style={styles.logoTextRed}>CAM</Text>
          </Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.welcomeContent}>
          <Text style={styles.welcomeHint}>СМ. ПРИКЛАДИ 🔴</Text>
          <Text style={styles.welcomeHint}>(ВІДЕО КОРИСТУВАЧІВ)</Text>

          <TouchableOpacity
              style={styles.welcomeCard}
              onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.welcomeCardTitle}>СТВОРИТИ НОВУ ПРЯМУ ТРАНСЛЯЦІЮ</Text>
            <Text style={styles.welcomeCardSubtitle}>зі своїм підрахунком очок</Text>
            <View style={styles.welcomePreview}>
              <View style={styles.welcomeScorePreview}>
                <Text style={styles.welcomeScoreText}>1 : 3</Text>
                <Text style={styles.welcomeLiveText}>● LIVE</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.welcomeCard}>
            <Text style={styles.welcomeCardTitle}>ТРАНСЛЮВАТИ ПОДІЇ RANKEDIN</Text>
            <Text style={styles.welcomeCardSubtitle}>з підрахунком очок в прямому ефірі</Text>
            <View style={styles.welcomePreview}>
              <View style={styles.rankedinPreview}>
                <Text style={styles.rankedinText}>RANKEDIN</Text>
                <Text style={styles.welcomeLiveText}>● LIVE</Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
  );
}

// ============================================
// 2. HISTORY SCREEN (Список матчів)
// ============================================
function HistoryScreen({ navigation }: any) {
  const [matches] = useState<MatchHistoryItem[]>([
    { id: '1', teamA: 'VYSH', teamB: 'AVG', colorA: '#000000', colorB: '#94A3B8', date: '24/01/2026', sport: 'basketball' },
    { id: '2', teamA: 'PER', teamB: 'AVG', colorA: '#000000', colorB: '#3B82F6', date: '24/01/2026', sport: 'basketball' },
    { id: '3', teamA: 'Pereyaslav', teamB: 'Avangard', colorA: '#3B82F6', colorB: '#10B981', date: '23/01/2026', sport: 'basketball' },
  ]);

  return (
      <View style={styles.container}>
        <View style={styles.historyHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.historyTitle}>Матчи</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.deletedNotice}>
          <Text style={styles.deletedNoticeText}>УДАЛЕННОЕ ПОДСЧЕТ ОЧКОВ СО второго устройства</Text>
          <TouchableOpacity style={styles.learnMoreBtn}>
            <Text style={styles.learnMoreText}>УЗНАТЬ БОЛЬШЕ</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
            style={styles.newMatchBtn}
            onPress={() => navigation.navigate('SportSelection')}
        >
          <Text style={styles.newMatchBtnText}>+ ТРАНСЛИРОВАТЬ НОВЫЙ МАТЧ</Text>
        </TouchableOpacity>

        <Text style={styles.historyLabel}>История</Text>

        <ScrollView style={styles.historyList}>
          {matches.map((match) => (
              <TouchableOpacity key={match.id} style={styles.historyCard}>
                <View style={styles.historyTeamRow}>
                  <View style={[styles.historyDot, { backgroundColor: match.colorA }]} />
                  <Text style={styles.historyTeamName}>{match.teamA}</Text>
                </View>
                <View style={styles.historyTeamRow}>
                  <View style={[styles.historyDot, { backgroundColor: match.colorB }]} />
                  <Text style={styles.historyTeamName}>{match.teamB}</Text>
                </View>
                <View style={styles.historyFooter}>
                  <Text style={styles.historyDate}>📅 {match.date}</Text>
                </View>
              </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
  );
}

// ============================================
// 3. SPORT SELECTION
// ============================================
function SportSelectionScreen({ navigation }: any) {
  return (
      <View style={styles.container}>
        <View style={styles.sportHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.sportTitle}>Транслювати новий матч</Text>
        </View>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>4</Text>
          </View>
        </View>

        <Text style={styles.stepLabel}>Вибрати вид спорту</Text>

        <ScrollView contentContainerStyle={styles.sportGrid}>
          {(Object.keys(SPORTS) as Sport[]).map((key) => (
              <TouchableOpacity
                  key={key}
                  style={styles.sportCard}
                  onPress={() => navigation.navigate('MatchSetup', { sport: key })}
              >
                <Text style={styles.sportIcon}>{SPORTS[key].icon}</Text>
                <Text style={styles.sportName}>{SPORTS[key].name}</Text>
              </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
  );
}

// ============================================
// 4. MATCH SETUP
// ============================================
function MatchSetupScreen({ route, navigation }: any) {
  const { sport } = route.params;
  const [teamA, setTeamA] = useState('TEST');
  const [teamB, setTeamB] = useState('Test');
  const [colorA, setColorA] = useState('#000000');
  const [colorB, setColorB] = useState('#94A3B8');
  const [logoA, setLogoA] = useState<string | null>(null);
  const [logoB, setLogoB] = useState<string | null>(null);

  const pickLogo = async (side: 'A' | 'B') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      if (side === 'A') setLogoA(result.assets[0].uri);
      else setLogoB(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    const settings: MatchSettings = {
      teamA,
      teamB,
      colorA,
      colorB,
      logoAUri: logoA,
      logoBUri: logoB,
    };
    navigation.navigate('PlatformSelection', { sport, settings });
  };

  return (
      <View style={styles.container}>
        <View style={styles.setupHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.setupTitle}>Транслювати новий матч</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepIndicator}>
          <View style={styles.stepCircleDone}>
            <Text style={styles.stepCheckmark}>✓</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>4</Text>
          </View>
        </View>

        <ScrollView style={{ padding: 16 }}>
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Предварительный просмотр</Text>
            <View style={styles.previewBox}>
              <View style={styles.previewScoreboard}>
                <View style={styles.previewTeam}>
                  <Text style={styles.previewTeamName}>{teamA}</Text>
                  <View style={styles.previewLogoBox}>
                    {logoA ? (
                        <Image source={{ uri: logoA }} style={styles.previewLogo} />
                    ) : (
                        <View style={[styles.previewLogoFallback, { backgroundColor: colorA }]} />
                    )}
                  </View>
                </View>
                <View style={styles.previewCenter}>
                  <Text style={styles.previewScore}>0 : 0</Text>
                  <Text style={styles.previewTime}>1st</Text>
                  <Text style={styles.previewTime}>00:00</Text>
                </View>
                <View style={styles.previewTeam}>
                  <View style={styles.previewLogoBox}>
                    {logoB ? (
                        <Image source={{ uri: logoB }} style={styles.previewLogo} />
                    ) : (
                        <View style={[styles.previewLogoFallback, { backgroundColor: colorB }]} />
                    )}
                  </View>
                  <Text style={styles.previewTeamName}>{teamB}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity>
              <Text style={styles.previewLink}>👁 ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР ТАБЛО РЕЗУЛЬТАТОВ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.setupSection}>
            <Text style={styles.sectionLabel}>Цвет</Text>
            <Text style={styles.sectionSubLabel}>Первый игрок / команда</Text>
            <TextInput
                style={styles.input}
                value={teamA}
                onChangeText={setTeamA}
                placeholder="Назва команди А"
                placeholderTextColor="#64748B"
            />
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                      key={c}
                      onPress={() => setColorA(c)}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c, borderWidth: colorA === c ? 3 : 1, borderColor: colorA === c ? '#FBBF24' : '#334155' },
                      ]}
                  />
              ))}
            </View>
          </View>

          <View style={styles.setupSection}>
            <Text style={styles.sectionSubLabel}>Второй игрок / команда</Text>
            <TextInput
                style={styles.input}
                value={teamB}
                onChangeText={setTeamB}
                placeholder="Назва команди B"
                placeholderTextColor="#64748B"
            />
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                      key={c}
                      onPress={() => setColorB(c)}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c, borderWidth: colorB === c ? 3 : 1, borderColor: colorB === c ? '#FBBF24' : '#334155' },
                      ]}
                  />
              ))}
            </View>
          </View>

          <View style={styles.setupSection}>
            <Text style={styles.sectionLabel}>Логотипы команды</Text>
            <View style={styles.logoRow}>
              <TouchableOpacity style={styles.logoUploadBox} onPress={() => pickLogo('A')}>
                {logoA ? (
                    <Image source={{ uri: logoA }} style={styles.logoUploadImage} />
                ) : (
                    <>
                      <Text style={styles.logoUploadPlus}>+</Text>
                      <Text style={styles.logoUploadText}>Добавить</Text>
                    </>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoUploadBox} onPress={() => pickLogo('B')}>
                {logoB ? (
                    <Image source={{ uri: logoB }} style={styles.logoUploadImage} />
                ) : (
                    <>
                      <Text style={styles.logoUploadPlus}>+</Text>
                      <Text style={styles.logoUploadText}>Добавить</Text>
                    </>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.deleteLogoText}>🗑 Удалить</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>ДАЛЕЕ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
  );
}

// ============================================
// 5. PLATFORM SELECTION
// ============================================
function PlatformSelectionScreen({ route, navigation }: any) {
  const { sport, settings } = route.params;

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
    { id: 'youtube', name: 'YouTube', icon: '▶', color: '#FF0000' },
    { id: 'twitch', name: 'Twitch', icon: '🎮', color: '#9146FF' },
    { id: 'rtmp', name: 'RTMP', icon: '📡', color: '#FBBF24' },
    { id: 'local', name: 'СОХРАНИТЬ\nВ ПАМЯТИ', icon: '💾', color: '#000000' },
  ];

  const handlePlatformSelect = (platformId: Platform) => {
    navigation.navigate('StreamConfig', { sport, settings, platform: platformId });
  };

  return (
      <View style={styles.container}>
        <View style={styles.setupHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.setupTitle}>Транслювати новий матч</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepIndicator}>
          <View style={styles.stepCircleDone}>
            <Text style={styles.stepCheckmark}>✓</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircleDone}>
            <Text style={styles.stepCheckmark}>✓</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>4</Text>
          </View>
        </View>

        <Text style={styles.stepLabel}>Вибрати платформу, на якій буде осуществляться трансляція</Text>

        <ScrollView contentContainerStyle={styles.platformGrid}>
          {platforms.map((platform) => (
              <TouchableOpacity
                  key={platform.id}
                  style={[styles.platformCard, { backgroundColor: platform.color }]}
                  onPress={() => handlePlatformSelect(platform.id as Platform)}
              >
                <Text style={styles.platformIcon}>{platform.icon}</Text>
                <Text style={styles.platformName}>{platform.name}</Text>
              </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.platformFooter}>
          <Text style={styles.platformFooterText}>
            Ви хотите сохранить видео, чтобы поделиться им позже?
          </Text>
          <View style={styles.platformToggle}>
            <Text style={styles.platformToggleText}>
              Сохранять видео на моем устройстве, пока я веду прямую трансляцию
            </Text>
            <View style={styles.toggleSwitch} />
          </View>
        </View>
      </View>
  );
}

// ============================================
// 6. STREAM CONFIG
// ============================================
function StreamConfigScreen({ route, navigation }: any) {
  const { sport, settings, platform } = route.params;
  const [url, setUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [breakGraphics, setBreakGraphics] = useState<string[]>([]);

  const pickSponsorLogo = async () => {
    if (sponsors.length >= 6) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSponsors([...sponsors, result.assets[0].uri]);
    }
  };

  const pickBreakGraphic = async () => {
    if (breakGraphics.length >= 4) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      setBreakGraphics([...breakGraphics, result.assets[0].uri]);
    }
  };

  const handleStart = () => {
    const streamConfig: StreamConfig = {
      platform,
      url,
      streamKey,
      sponsors,
      breakGraphics,
    };
    navigation.navigate('Streaming', { sport, settings, streamConfig });
  };

  return (
      <View style={styles.container}>
        <View style={styles.setupHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.setupTitle}>Транслювати новий матч</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepIndicator}>
          <View style={styles.stepCircleDone}>
            <Text style={styles.stepCheckmark}>✓</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircleDone}>
            <Text style={styles.stepCheckmark}>✓</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircleDone}>
            <Text style={styles.stepCheckmark}>✓</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumber}>4</Text>
          </View>
        </View>

        <ScrollView style={{ padding: 16 }}>
          {platform === 'rtmp' && (
              <>
                <View style={styles.configSection}>
                  <Text style={styles.configLabel}>URL</Text>
                  <TextInput
                      style={styles.input}
                      value={url}
                      onChangeText={setUrl}
                      placeholder="rtmp://..."
                      placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.configSection}>
                  <Text style={styles.configLabel}>Ключ трансляції</Text>
                  <TextInput
                      style={styles.input}
                      value={streamKey}
                      onChangeText={setStreamKey}
                      placeholder="Ключ трансляції"
                      placeholderTextColor="#64748B"
                      secureTextEntry
                  />
                </View>
              </>
          )}

          <View style={styles.configSection}>
            <Text style={styles.configLabel}>Добавьте логотипы спонсоров ({sponsors.length} / 6)</Text>
            <ScrollView horizontal style={styles.sponsorScroll}>
              {sponsors.map((uri, idx) => (
                  <View key={idx} style={styles.sponsorBox}>
                    <Image source={{ uri }} style={styles.sponsorImage} />
                  </View>
              ))}
              {sponsors.length < 6 && (
                  <TouchableOpacity style={styles.sponsorAddBox} onPress={pickSponsorLogo}>
                    <Text style={styles.sponsorAddText}>+</Text>
                  </TouchableOpacity>
              )}
            </ScrollView>
            <TouchableOpacity>
              <Text style={styles.previewLink}>👁 ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР ДОБАВЛЕННЫХ ЛОГОТИПОВ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.configSection}>
            <Text style={styles.configLabel}>Добавить графику в перервах ({breakGraphics.length} / 4)</Text>
            <ScrollView horizontal style={styles.sponsorScroll}>
              {breakGraphics.map((uri, idx) => (
                  <View key={idx} style={styles.graphicBox}>
                    <Image source={{ uri }} style={styles.graphicImage} />
                  </View>
              ))}
              {breakGraphics.length < 4 && (
                  <TouchableOpacity style={styles.graphicAddBox} onPress={pickBreakGraphic}>
                    <Text style={styles.graphicAddText}>+ Коснитесь, чтобы импортировать графику</Text>
                  </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.startStreamBtn} onPress={handleStart}>
            <Text style={styles.startStreamBtnText}>
              {platform === 'rtmp' ? 'ПРОДОЛЖИТЬ С RTMP' : `ПРОДОЛЖИТЬ С ${platform.toUpperCase()}`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
  );
}

// ============================================
// 7. STREAMING SCREEN
// ============================================
function StreamingScreen({ route, navigation }: any) {
  const { sport, settings, streamConfig } = route.params;
  const config = SPORTS[sport];
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [period, setPeriod] = useState(1);
  const [seconds, setSeconds] = useState(config.defaultTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const [editTimeVisible, setEditTimeVisible] = useState(false);
  const [tempMinutes, setTempMinutes] = useState('0');
  const [tempSeconds, setTempSeconds] = useState('0');

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(
        () => setSeconds((s) => (config.timerMode === 'countdown' ? Math.max(0, s - 1) : s + 1)),
        1000
    );
    return () => clearInterval(id);
  }, [timerRunning]);

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

    Alert.alert('Зміна періоду', `Перейти до ${config.periodLabel(newPeriod)}?`, [
      { text: 'Без скидання часу', onPress: () => setPeriod(newPeriod) },
      {
        text: 'Зі скиданням часу',
        onPress: () => {
          setPeriod(newPeriod);
          setSeconds(config.defaultTime);
          setTimerRunning(false);
        },
        style: 'destructive',
      },
      { text: 'Скасувати', style: 'cancel' },
    ]);
  };

  const handleBack = () => {
    Alert.alert('Завершити трансляцію?', 'Ви впевнені, що хочете вийти?', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Вийти',
        style: 'destructive',
        onPress: () => {
          ScreenOrientation.unlockAsync();
          navigation.navigate('History');
        },
      },
    ]);
  };

  return (
      <View style={styles.fullscreenContainer}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" mode="video" />

        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backBtnText}>← BACK</Text>
          </TouchableOpacity>
          <View style={styles.compactScoreboard}>
            <View style={styles.sbTeam}>
              <View style={styles.sbTeamTop}>
                {settings.logoAUri ? (
                    <Image source={{ uri: settings.logoAUri }} style={styles.sbLogo} />
                ) : (
                    <View style={[styles.sbLogoFallback, { backgroundColor: settings.colorA }]} />
                )}
                <Text style={[styles.sbTeamName, { color: getVisibleTextColor(settings.colorA) }]} numberOfLines={1}>
                  {settings.teamA}
                </Text>
              </View>
              <Text style={styles.sbScore}>{scoreA}</Text>
            </View>
            <View style={styles.sbCenter}>
              <Text style={styles.sbTime}>
                {Math.floor(seconds / 60)
                    .toString()
                    .padStart(2, '0')}
                :{(seconds % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={styles.sbPeriod}>{config.periodLabel(period)}</Text>
            </View>
            <View style={styles.sbTeam}>
              <View style={styles.sbTeamTop}>
                <Text style={[styles.sbTeamName, { color: getVisibleTextColor(settings.colorB) }]} numberOfLines={1}>
                  {settings.teamB}
                </Text>
                {settings.logoBUri ? (
                    <Image source={{ uri: settings.logoBUri }} style={styles.sbLogo} />
                ) : (
                    <View style={[styles.sbLogoFallback, { backgroundColor: settings.colorB }]} />
                )}
              </View>
              <Text style={styles.sbScore}>{scoreB}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.liveBtn, isLive && styles.liveBtnActive]} onPress={() => setIsLive(!isLive)}>
            <Text style={styles.liveBtnText}>{isLive ? '🔴 LIVE' : '⚪ OFFLINE'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.leftControls}>
          {config.scoreButtons.map((p: number) => (
              <TouchableOpacity key={p} style={[styles.scoreBtn, { backgroundColor: settings.colorA }]} onPress={() => setScoreA((s) => s + p)}>
                <Text style={styles.scoreBtnText}>+{p}</Text>
              </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.scoreBtnMinus} onPress={() => setScoreA((s) => Math.max(0, s - 1))}>
            <Text style={styles.scoreBtnText}>−</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightControls}>
          {config.scoreButtons.map((p: number) => (
              <TouchableOpacity key={p} style={[styles.scoreBtn, { backgroundColor: settings.colorB }]} onPress={() => setScoreB((s) => s + p)}>
                <Text style={styles.scoreBtnText}>+{p}</Text>
              </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.scoreBtnMinus} onPress={() => setScoreB((s) => Math.max(0, s - 1))}>
            <Text style={styles.scoreBtnText}>−</Text>
          </TouchableOpacity>
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
            <TouchableOpacity style={styles.periodBtn} onPress={() => handlePeriodChange(period - 1)}>
              <Text style={styles.periodBtnText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.periodLabel}>PERIOD</Text>
            <TouchableOpacity style={styles.periodBtn} onPress={() => handlePeriodChange(period + 1)}>
              <Text style={styles.periodBtnText}>▶</Text>
            </TouchableOpacity>
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
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setEditTimeVisible(false)}>
                  <Text style={styles.modalBtnText}>Скасувати</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={saveTime}>
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
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  fullscreenContainer: { flex: 1, backgroundColor: '#000' },
  center: { justifyContent: 'center', alignItems: 'center' },
  infoText: { color: '#fff', marginBottom: 20, fontSize: 16 },
  primaryBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Welcome Screen
  welcomeHeader: {
    backgroundColor: '#FBBF24',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  logoTextRed: { color: '#DC2626' },
  settingsBtn: { padding: 5 },
  settingsBtnText: { fontSize: 24, color: '#000' },
  welcomeContent: { padding: 20 },
  welcomeHint: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginBottom: 5 },
  welcomeCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  welcomeCardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  welcomeCardSubtitle: { color: '#94A3B8', fontSize: 11, marginBottom: 15 },
  welcomePreview: { backgroundColor: '#0F172A', padding: 20, borderRadius: 10, alignItems: 'center' },
  welcomeScorePreview: { alignItems: 'center' },
  welcomeScoreText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  welcomeLiveText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  rankedinPreview: { alignItems: 'center' },
  rankedinText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  // History Screen
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1E293B',
  },
  backText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 14 },
  historyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  deletedNotice: {
    backgroundColor: '#FBBF24',
    padding: 15,
    alignItems: 'center',
  },
  deletedNoticeText: { color: '#000', fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  learnMoreBtn: { backgroundColor: '#DC2626', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  learnMoreText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  newMatchBtn: { backgroundColor: '#10B981', margin: 15, padding: 18, borderRadius: 12, alignItems: 'center' },
  newMatchBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  historyLabel: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 15, marginBottom: 10 },
  historyList: { flex: 1, paddingHorizontal: 15 },
  historyCard: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyTeamRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  historyDot: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  historyTeamName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  historyFooter: { marginTop: 5, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  historyDate: { color: '#94A3B8', fontSize: 11 },

  // Sport Selection
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1E293B',
  },
  sportTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 15 },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: { backgroundColor: '#FBBF24' },
  stepCircleDone: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  stepCheckmark: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stepLine: { width: 40, height: 2, backgroundColor: '#334155', marginHorizontal: 5 },
  stepLabel: { color: '#94A3B8', fontSize: 12, textAlign: 'center', paddingHorizontal: 30, marginBottom: 20 },
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
  sportName: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Match Setup
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1E293B',
  },
  setupTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  previewContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  previewLabel: { color: '#FBBF24', fontSize: 11, fontWeight: 'bold', marginBottom: 10 },
  previewBox: { backgroundColor: '#0F172A', padding: 15, borderRadius: 10, marginBottom: 10 },
  previewScoreboard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewTeam: { flex: 1, alignItems: 'center' },
  previewTeamName: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  previewLogoBox: { width: 40, height: 40, borderRadius: 8, overflow: 'hidden' },
  previewLogo: { width: '100%', height: '100%' },
  previewLogoFallback: { width: '100%', height: '100%' },
  previewCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  previewScore: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  previewTime: { color: '#FBBF24', fontSize: 10, fontWeight: 'bold' },
  previewLink: { color: '#3B82F6', fontSize: 10, textAlign: 'center' },
  setupSection: { backgroundColor: '#1E293B', padding: 15, borderRadius: 15, marginBottom: 15 },
  sectionLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  sectionSubLabel: { color: '#94A3B8', fontSize: 11, marginBottom: 10 },
  input: {
    backgroundColor: '#0F172A',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  colorCircle: { width: 35, height: 35, borderRadius: 18 },
  logoRow: { flexDirection: 'row', gap: 15, marginBottom: 10 },
  logoUploadBox: {
    width: 100,
    height: 100,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoUploadPlus: { color: '#94A3B8', fontSize: 32 },
  logoUploadText: { color: '#94A3B8', fontSize: 10, marginTop: 5 },
  logoUploadImage: { width: '100%', height: '100%', borderRadius: 8 },
  deleteLogoText: { color: '#EF4444', fontSize: 11, textAlign: 'center' },
  nextBtn: { backgroundColor: '#10B981', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // Platform Selection
  platformGrid: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  platformCard: {
    width: '47%',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  platformIcon: { fontSize: 40, marginBottom: 10 },
  platformName: { color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  platformFooter: { padding: 20, backgroundColor: '#1E293B', marginTop: 'auto' },
  platformFooterText: { color: '#94A3B8', fontSize: 11, marginBottom: 10, textAlign: 'center' },
  platformToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  platformToggleText: { color: '#fff', fontSize: 11, flex: 1 },
  toggleSwitch: { width: 50, height: 28, backgroundColor: '#334155', borderRadius: 14 },

  // Stream Config
  configSection: { marginBottom: 20 },
  configLabel: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  sponsorScroll: { marginBottom: 10 },
  sponsorBox: {
    width: 80,
    height: 80,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
  },
  sponsorImage: { width: '100%', height: '100%' },
  sponsorAddBox: {
    width: 80,
    height: 80,
    backgroundColor: '#334155',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#64748B',
    borderStyle: 'dashed',
  },
  sponsorAddText: { color: '#94A3B8', fontSize: 32 },
  graphicBox: {
    width: 120,
    height: 80,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
  },
  graphicImage: { width: '100%', height: '100%' },
  graphicAddBox: {
    width: 200,
    height: 80,
    backgroundColor: '#334155',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#64748B',
    borderStyle: 'dashed',
    paddingHorizontal: 10,
  },
  graphicAddText: { color: '#94A3B8', fontSize: 11, textAlign: 'center' },
  startStreamBtn: {
    backgroundColor: '#FBBF24',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  startStreamBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

  // Streaming Screen (unchanged from original)
  topBar: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  compactScoreboard: {
    width: '55%',
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sbTeam: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sbTeamTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sbLogo: { width: 20, height: 20, borderRadius: 4 },
  sbLogoFallback: { width: 20, height: 20, borderRadius: 4 },
  sbTeamName: { fontSize: 10, fontWeight: 'bold', maxWidth: 70 },
  sbCenter: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sbScore: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  sbTime: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  sbPeriod: { color: '#94A3B8', fontSize: 8, fontWeight: 'bold' },
  liveBtn: { backgroundColor: 'rgba(51, 65, 85, 0.8)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  liveBtnActive: { backgroundColor: 'rgba(220, 38, 38, 0.9)' },
  liveBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  leftControls: {
    position: 'absolute',
    left: 20,
    top: 80,
    bottom: 80,
    justifyContent: 'center',
    gap: 8,
  },
  rightControls: {
    position: 'absolute',
    right: 20,
    top: 80,
    bottom: 80,
    justifyContent: 'center',
    gap: 8,
  },
  scoreBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  scoreBtnMinus: {
    backgroundColor: 'rgba(51, 65, 85, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  bottomControls: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  systemBtn: {
    backgroundColor: 'rgba(51, 65, 85, 0.9)',
    width: 60,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemBtnActive: { backgroundColor: 'rgba(37, 99, 235, 0.9)' },
  systemBtnText: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold' },
  systemBtnSubText: { fontSize: 8, color: '#94A3B8', fontWeight: 'bold', marginBottom: 2 },
  periodGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 5,
  },
  periodBtn: { padding: 12 },
  periodBtnText: { color: '#fff', fontSize: 18 },
  periodLabel: { color: '#94A3B8', fontSize: 9, fontWeight: 'bold', marginHorizontal: 5 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: { width: 280, backgroundColor: '#1E293B', padding: 20, borderRadius: 15 },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
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
    fontSize: 22,
    width: 55,
    textAlign: 'center',
    borderRadius: 8,
    padding: 8,
  },
  timeSeparator: { color: '#fff', fontSize: 22, marginHorizontal: 5 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#64748B' },
  modalBtnSave: { backgroundColor: '#10B981' },
  modalBtnText: { color: '#fff', fontWeight: 'bold' },
});