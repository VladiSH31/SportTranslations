import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getVisibleTextColor } from '../utils/colorHelpers';

interface Props {
    teamA: string;
    teamB: string;
    colorA: string;
    colorB: string;
    logoAUri?: string | null;
    logoBUri?: string | null;
    scoreA: number;
    scoreB: number;
    time: string;
    periodLabel: string;
    variant?: 'preview' | 'compact';
}

export default function ScoreboardPreview({
                                              teamA, teamB, colorA, colorB, logoAUri, logoBUri, scoreA, scoreB, time, periodLabel, variant = 'preview',
                                          }: Props) {
    return (
        <View style={variant === 'compact' ? styles.compact : styles.preview}>
            <View style={styles.sbTeam}>
                <View style={styles.sbTeamTop}>
                    {logoAUri ? <Image source={{ uri: logoAUri }} style={styles.sbLogo} /> : <View style={[styles.sbLogoFallback, { backgroundColor: colorA }]} />}
                    <Text style={[styles.sbTeamName, { color: getVisibleTextColor(colorA) }]} numberOfLines={1}>{teamA}</Text>
                </View>
                <Text style={styles.sbScore}>{scoreA}</Text>
            </View>
            <View style={styles.sbCenter}>
                <Text style={styles.sbTime}>{time}</Text>
                <Text style={styles.sbPeriod}>{periodLabel}</Text>
            </View>
            <View style={styles.sbTeam}>
                <View style={styles.sbTeamTop}>
                    <Text style={[styles.sbTeamName, { color: getVisibleTextColor(colorB) }]} numberOfLines={1}>{teamB}</Text>
                    {logoBUri ? <Image source={{ uri: logoBUri }} style={styles.sbLogo} /> : <View style={[styles.sbLogoFallback, { backgroundColor: colorB }]} />}
                </View>
                <Text style={styles.sbScore}>{scoreB}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    preview: { width: '100%', flexDirection: 'row', backgroundColor: '#000', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155' },
    compact: { width: '55%', flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    sbTeam: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    sbTeamTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    sbLogo: { width: 20, height: 20, borderRadius: 4 },
    sbLogoFallback: { width: 20, height: 20, borderRadius: 4 },
    sbTeamName: { fontSize: 10, fontWeight: 'bold', maxWidth: 70 },
    sbCenter: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sbScore: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    sbTime: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
    sbPeriod: { color: '#94A3B8', fontSize: 8, fontWeight: 'bold' },
});