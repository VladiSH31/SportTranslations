import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { GRADIENTS } from '../constants/colors';

export default function WelcomeScreen({ navigation }: any) {
    useFocusEffect(
        React.useCallback(() => {
            ScreenOrientation.unlockAsync();
        }, [])
    );

    return (
        <LinearGradient colors={GRADIENTS.background} style={globalStyles.container}>
            <StatusBar style="light" />
            <View style={globalStyles.centerContent}>
                <View style={styles.logoContainer}>
                    <Ionicons name="videocam" size={64} color="#a5b4fc" />
                </View>
                <Text style={styles.mainTitle}>SPORT TRANSLATIONS</Text>
                <Text style={styles.subTitle}>PROFESSIONAL STREAMING TOOL</Text>

                <View style={{ width: '100%', marginTop: 60, gap: 20 }}>
                    <TouchableOpacity style={globalStyles.primaryBtn} onPress={() => navigation.navigate('SportSelection')}>
                        <LinearGradient colors={GRADIENTS.primaryBtn} style={globalStyles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Ionicons name="play" size={24} color="white" style={{ marginRight: 10 }} />
                            <Text style={globalStyles.primaryBtnText}>START NEW STREAM</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={globalStyles.secondaryBtn} onPress={() => navigation.navigate('History')}>
                        <Ionicons name="time-outline" size={24} color="#94A3B8" style={{ marginRight: 10 }} />
                        <Text style={globalStyles.secondaryBtnText}>HISTORY</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    logoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    mainTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
    subTitle: { color: '#94a3b8', fontSize: 12, marginTop: 10, letterSpacing: 2, fontWeight: '600' },
});