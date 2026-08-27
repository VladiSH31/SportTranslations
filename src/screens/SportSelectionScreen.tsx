import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { GRADIENTS } from '../constants/colors';
import { SPORTS } from '../constants/sports';
import { Sport } from '../types';

export default function SportSelectionScreen({ navigation }: any) {
    return (
        <LinearGradient colors={GRADIENTS.background} style={globalStyles.container}>
            <View style={globalStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backIcon}>
                    <Ionicons name="arrow-back" size={24} color="#cbd5e1" />
                </TouchableOpacity>
                <Text style={globalStyles.headerTitle}>SELECT SPORT</Text>
            </View>

            <ScrollView contentContainerStyle={styles.sportGrid}>
                {(Object.keys(SPORTS) as Sport[]).map((key) => (
                    <TouchableOpacity key={key} style={styles.sportCard} onPress={() => navigation.navigate('MatchSetup', { sport: key })}>
                        <LinearGradient colors={GRADIENTS.card} style={globalStyles.cardGradient}>
                            <Text style={styles.sportIcon}>{SPORTS[key].icon}</Text>
                            <Text style={styles.sportName}>{SPORTS[key].name.toUpperCase()}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    sportGrid: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    sportCard: { width: '48%', marginBottom: 15, borderRadius: 16, overflow: 'hidden', elevation: 4 },
    sportIcon: { fontSize: 42, marginBottom: 12 },
    sportName: { color: '#e2e8f0', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
});