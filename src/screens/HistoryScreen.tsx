import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { GRADIENTS } from '../constants/colors';
import { SPORTS } from '../constants/sports';
import { HistoryItem } from '../types';
import { useHistory } from '../context/HistoryContext';

export default function HistoryScreen({ navigation }: any) {
    const { history } = useHistory();

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
        <LinearGradient colors={GRADIENTS.background} style={globalStyles.container}>
            <View style={globalStyles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={globalStyles.backIcon}>
                    <Ionicons name="arrow-back" size={24} color="#cbd5e1" />
                </TouchableOpacity>
                <Text style={globalStyles.headerTitle}>BROADCAST HISTORY</Text>
            </View>

            {history.length === 0 ? (
                <View style={globalStyles.centerContent}>
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

const styles = StyleSheet.create({
    historyCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 8 },
    historyDate: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
    historyDuration: { color: '#10B981', fontSize: 12, fontWeight: '700' },
    historyScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyTeam: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
    historyScoreBox: { backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginHorizontal: 10 },
    historyScore: { color: '#FBBF24', fontSize: 16, fontWeight: '800' },
});