import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { GRADIENTS } from '../constants/colors';

const PLATFORMS = [
    { id: 'youtube', name: 'YouTube Live', icon: 'logo-youtube', color: '#FF0000' },
    { id: 'twitch', name: 'Twitch', icon: 'logo-twitch', color: '#9146FF' },
    { id: 'custom', name: 'Custom RTMP', icon: 'server-outline', color: '#3B82F6' },
];

export default function PlatformSelectionScreen({ route, navigation }: any) {
    const { matchSettings } = route.params;
    const [saveLocal, setSaveLocal] = useState(true);

    return (
        <LinearGradient colors={GRADIENTS.background} style={globalStyles.container}>
            <View style={globalStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backIcon}>
                    <Ionicons name="arrow-back" size={24} color="#cbd5e1" />
                </TouchableOpacity>
                <Text style={globalStyles.headerTitle}>SELECT PLATFORM</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {PLATFORMS.map(p => (
                    <TouchableOpacity
                        key={p.id}
                        style={styles.platformCard}
                        onPress={() => navigation.navigate('StreamConfig', { matchSettings, platform: p.id, saveLocal })}
                    >
                        <LinearGradient colors={GRADIENTS.card} style={globalStyles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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
                    <Switch value={saveLocal} onValueChange={setSaveLocal} trackColor={{ false: '#334155', true: '#4f46e5' }} thumbColor="white" />
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    platformCard: { marginBottom: 15, borderRadius: 16, overflow: 'hidden' },
    iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    platformText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, backgroundColor: '#1e293b', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
    switchTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
    switchSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
});