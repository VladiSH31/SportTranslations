import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { GRADIENTS } from '../constants/colors';

export default function StreamConfigScreen({ route, navigation }: any) {
    const { matchSettings, platform, saveLocal } = route.params;
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');

    return (
        <LinearGradient colors={GRADIENTS.background} style={globalStyles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={globalStyles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backIcon}>
                        <Ionicons name="arrow-back" size={24} color="#cbd5e1" />
                    </TouchableOpacity>
                    <Text style={globalStyles.headerTitle}>STREAM CONFIG</Text>
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <View style={globalStyles.configCard}>
                        <View style={globalStyles.cardHeader}>
                            <Ionicons name="settings-outline" size={20} color="#a5b4fc" style={{ marginRight: 10 }} />
                            <Text style={globalStyles.cardTitle}>RTMP SETTINGS</Text>
                        </View>

                        {(platform === 'custom' || platform === 'youtube') && (
                            <View style={globalStyles.inputGroup}>
                                <Text style={globalStyles.label}>SERVER URL</Text>
                                <TextInput style={globalStyles.input} value={url} onChangeText={setUrl} placeholder="rtmp://..." placeholderTextColor="#475569" autoCapitalize="none" />
                            </View>
                        )}

                        <View style={globalStyles.inputGroup}>
                            <Text style={globalStyles.label}>STREAM KEY</Text>
                            <TextInput style={globalStyles.input} value={key} onChangeText={setKey} secureTextEntry placeholder="••••••••••••" placeholderTextColor="#475569" />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[globalStyles.primaryBtn, { marginTop: 30 }]}
                        onPress={() => navigation.navigate('Streaming', { matchSettings, streamConfig: { platform, rtmpUrl: url, streamKey: key, saveToPhone: saveLocal } })}
                    >
                        <LinearGradient colors={GRADIENTS.liveBtn} style={globalStyles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Ionicons name="radio-outline" size={24} color="white" style={{ marginRight: 10 }} />
                            <Text style={globalStyles.primaryBtnText}>GO LIVE</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <View style={{ height: 60 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}