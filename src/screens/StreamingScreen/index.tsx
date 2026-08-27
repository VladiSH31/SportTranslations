import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { LiveStreamView } from '@api.video/react-native-livestream';
import * as ScreenOrientation from 'expo-screen-orientation';
import { globalStyles } from '../../styles/globalStyles';
import { SPORTS } from '../../constants/sports';
import { MatchSettings, HistoryItem } from '../../types';
import { useHistory } from '../../context/HistoryContext';
import ScoreboardPreview from '../../components/ScoreboardPreview';
import EditTimeModal from './EditTimeModal';

export default function StreamingScreen({ route, navigation }: any) {
    const { matchSettings, streamConfig } = route.params;
    const { rtmpUrl, streamKey, saveToPhone } = streamConfig;
    const { addToHistory } = useHistory();
    const settings = matchSettings as MatchSettings;
    const config = SPORTS[settings.sport];

    const streamRef = useRef<any>(null);

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

    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        return () => {
            ScreenOrientation.unlockAsync();
        };
    }, []);

    useEffect(() => {
        if (!timerRunning) return;
        const id = setInterval(() => setSeconds((s: number) => (config.timerMode === 'countdown' ? Math.max(0, s - 1) : s + 1)), 1000);
        return () => clearInterval(id);
    }, [timerRunning]);

    const handleLiveToggle = () => {
        if (!isLive) {
            startStream();
        } else {
            confirmStopStream();
        }
    };

    const startStream = () => {
        if (!rtmpUrl || !streamKey) {
            Alert.alert('Помилка', 'RTMP URL або Stream Key не задані. Поверніться на екран налаштувань стріму.');
            return;
        }
        try {
            streamRef.current?.startStreaming(streamKey, rtmpUrl);
            setIsLive(true);
            setStartTime(new Date());
        } catch (e: any) {
            Alert.alert('Помилка запуску трансляції', e?.message ?? 'Невідома помилка');
        }
    };

    const handleExitPress = () => {
        if (isLive) {
            confirmStopStream();
        } else {
            navigation.goBack();
        }
    };

    const confirmStopStream = () => {
        Alert.alert('Завершити трансляцію?', 'Зупинити ефір та зберегти в історію?', [
            { text: 'Ні', style: 'cancel' },
            { text: 'Так, завершити', style: 'destructive', onPress: stopStreamAndSave },
        ]);
    };

    const stopStreamAndSave = async () => {
        try {
            streamRef.current?.stopStreaming();
        } catch (e) {
            // ignore stop errors
        }
        setIsLive(false);
        setTimerRunning(false);

        const now = new Date();
        const durationMs = startTime ? now.getTime() - startTime.getTime() : 0;
        const durationMin = Math.floor(durationMs / 60000);
        const durationSec = Math.floor((durationMs % 60000) / 1000);

        const historyItem: HistoryItem = {
            id: Date.now().toString(),
            date: now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sport: settings.sport,
            teamA: settings.teamA,
            teamB: settings.teamB,
            scoreA,
            scoreB,
            duration: `${durationMin}:${durationSec.toString().padStart(2, '0')}`,
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
        Alert.alert('Зміна періоду', `Перейти до ${config.periodLabel(newPeriod)}?`, [
            { text: 'Без скидання часу', onPress: () => setPeriod(newPeriod) },
            { text: 'Зі скиданням часу', onPress: () => { setPeriod(newPeriod); setSeconds(config.defaultTime); setTimerRunning(false); }, style: 'destructive' },
            { text: 'Скасувати', style: 'cancel' },
        ]);
    };

    const timeLabel = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    return (
        <View style={styles.fullscreenContainer}>
            <LiveStreamView
                ref={streamRef}
                style={StyleSheet.absoluteFill}
                camera="back"
                enablePinchedZoom={true}
                video={{
                    fps: 30,
                    resolution: '720p',
                    bitrate: 2 * 1024 * 1024,
                    orientation: 'landscape',
                }}
                audio={{
                    bitrate: 128000,
                    sampleRate: 44100,
                    isStereo: true,
                }}
                isMuted={false}
                onConnectionSuccess={() => console.log('RTMP: connected')}
                onConnectionFailed={(reason: string) => {
                    Alert.alert('Помилка з’єднання', reason);
                    setIsLive(false);
                }}
                onDisconnect={() => {
                    console.log('RTMP: disconnected');
                    setIsLive(false);
                }}
            />

            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={handleExitPress}>
                    <Text style={styles.backBtnText}>← EXIT</Text>
                </TouchableOpacity>

                <ScoreboardPreview
                    teamA={settings.teamA} teamB={settings.teamB}
                    colorA={settings.colorA} colorB={settings.colorB}
                    logoAUri={settings.logoAUri} logoBUri={settings.logoBUri}
                    scoreA={scoreA} scoreB={scoreB}
                    time={timeLabel} periodLabel={config.periodLabel(period)}
                    variant="compact"
                />

                <TouchableOpacity style={[styles.liveBtn, isLive && styles.liveBtnActive]} onPress={handleLiveToggle}>
                    <Text style={styles.liveBtnText}>{isLive ? '🔴 LIVE' : '⚪ OFFLINE'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.leftControls}>
                {config.scoreButtons.map((p: number) => (
                    <TouchableOpacity key={p} style={[styles.scoreBtn, { backgroundColor: settings.colorA }]} onPress={() => setScoreA(s => s + p)}>
                        <Text style={styles.scoreBtnText}>+{p}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.scoreBtnMinus} onPress={() => setScoreA(s => Math.max(0, s - 1))}><Text style={styles.scoreBtnText}>−</Text></TouchableOpacity>
            </View>

            <View style={styles.rightControls}>
                {config.scoreButtons.map((p: number) => (
                    <TouchableOpacity key={p} style={[styles.scoreBtn, { backgroundColor: settings.colorB }]} onPress={() => setScoreB(s => s + p)}>
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

            <EditTimeModal
                visible={editTimeVisible}
                minutes={tempMinutes}
                seconds={tempSeconds}
                onChangeMinutes={setTempMinutes}
                onChangeSeconds={setTempSeconds}
                onCancel={() => setEditTimeVisible(false)}
                onSave={saveTime}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    fullscreenContainer: { flex: 1, backgroundColor: '#000' },
    topBar: { position: 'absolute', top: 15, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 8 },
    backBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
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
});