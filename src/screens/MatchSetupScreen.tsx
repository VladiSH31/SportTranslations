import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Sport, MatchSettings } from '../types';
import { SPORTS } from '../constants/sports';
import { PRESET_COLORS } from '../constants/colors';
import { getVisibleTextColor } from '../utils/colorHelpers';

export default function MatchSetupScreen({ route, navigation }: any) {
    const sport: Sport = route.params.sport;
    const sportConfig = SPORTS[sport];

    const [teamA, setTeamA] = useState('AAA');
    const [teamB, setTeamB] = useState('BBB');
    const [colorA, setColorA] = useState(PRESET_COLORS[2]);
    const [colorB, setColorB] = useState(PRESET_COLORS[3]);
    const [logoAUri, setLogoAUri] = useState<string | null>(null);
    const [logoBUri, setLogoBUri] = useState<string | null>(null);

    const pickLogo = async (team: 'A' | 'B') => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets?.[0]?.uri) {
            if (team === 'A') setLogoAUri(result.assets[0].uri);
            else setLogoBUri(result.assets[0].uri);
        }
    };

    const handleContinue = () => {
        const matchSettings: MatchSettings = {
            sport,
            teamA,
            teamB,
            colorA,
            colorB,
            logoAUri,
            logoBUri,
        };
        navigation.navigate('PlatformSelection', { matchSettings });
    };

    return (
        <LinearGradient colors={['#0F172A', '#1E293B', '#312E81']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {sportConfig.icon} {sportConfig.name}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* TEAM A */}
                <View style={styles.teamCard}>
                    <Text style={styles.teamLabel}>Команда A</Text>
                    <View style={styles.teamRow}>
                        <TouchableOpacity style={styles.logoPicker} onPress={() => pickLogo('A')}>
                            {logoAUri ? (
                                <Image source={{ uri: logoAUri }} style={styles.logoImage} />
                            ) : (
                                <Ionicons name="camera-outline" size={24} color="#94A3B8" />
                            )}
                        </TouchableOpacity>
                        <TextInput
                            style={styles.teamInput}
                            value={teamA}
                            onChangeText={setTeamA}
                            placeholder="Назва команди A"
                            placeholderTextColor="#64748B"
                        />
                    </View>
                    <View style={styles.colorRow}>
                        {PRESET_COLORS.map((color) => (
                            <TouchableOpacity
                                key={`A-${color}`}
                                style={[
                                    styles.colorSwatch,
                                    { backgroundColor: color },
                                    colorA === color && styles.colorSwatchActive,
                                ]}
                                onPress={() => setColorA(color)}
                            />
                        ))}
                    </View>
                </View>

                {/* TEAM B */}
                <View style={styles.teamCard}>
                    <Text style={styles.teamLabel}>Команда B</Text>
                    <View style={styles.teamRow}>
                        <TouchableOpacity style={styles.logoPicker} onPress={() => pickLogo('B')}>
                            {logoBUri ? (
                                <Image source={{ uri: logoBUri }} style={styles.logoImage} />
                            ) : (
                                <Ionicons name="camera-outline" size={24} color="#94A3B8" />
                            )}
                        </TouchableOpacity>
                        <TextInput
                            style={styles.teamInput}
                            value={teamB}
                            onChangeText={setTeamB}
                            placeholder="Назва команди B"
                            placeholderTextColor="#64748B"
                        />
                    </View>
                    <View style={styles.colorRow}>
                        {PRESET_COLORS.map((color) => (
                            <TouchableOpacity
                                key={`B-${color}`}
                                style={[
                                    styles.colorSwatch,
                                    { backgroundColor: color },
                                    colorB === color && styles.colorSwatchActive,
                                ]}
                                onPress={() => setColorB(color)}
                            />
                        ))}
                    </View>
                </View>

                {/* PREVIEW */}
                <View style={styles.previewBox}>
                    <Text style={[styles.previewTeam, { color: getVisibleTextColor(colorA) }]} numberOfLines={1}>
                        {teamA}
                    </Text>
                    <Text style={styles.previewVs}>VS</Text>
                    <Text style={[styles.previewTeam, { color: getVisibleTextColor(colorB) }]} numberOfLines={1}>
                        {teamB}
                    </Text>
                </View>

                <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
                    <Text style={styles.continueBtnText}>Продовжити</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
    },
    backBtn: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    teamCard: {
        backgroundColor: 'rgba(51, 65, 85, 0.5)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    teamLabel: { color: '#C4B5FD', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
    teamRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    logoPicker: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.3)',
        overflow: 'hidden',
    },
    logoImage: { width: '100%', height: '100%' },
    teamInput: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        color: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    colorRow: { flexDirection: 'row', gap: 10 },
    colorSwatch: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorSwatchActive: { borderColor: '#A78BFA' },
    previewBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        marginVertical: 20,
    },
    previewTeam: { fontSize: 16, fontWeight: 'bold', maxWidth: 120 },
    previewVs: { color: '#64748B', fontSize: 14, fontWeight: 'bold' },
    continueBtn: {
        backgroundColor: '#7C3AED',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    continueBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});