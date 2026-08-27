import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { GRADIENTS } from '../constants/colors';

const DEFAULT_URLS: Record<string, string> = {
    twitch: 'rtmp://live.twitch.tv/app',
    youtube: 'rtmp://a.rtmp.youtube.com/live2',
};

export default function StreamConfigScreen({ route, navigation }: any) {
    const { matchSettings, platform, saveLocal } = route.params;
    const [url, setUrl] = useState(DEFAULT_URLS[platform] || '');
    const [key, setKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    const needsUrl = platform === 'custom' || platform === 'youtube' || platform === 'twitch';

    const handleGoLive = () => {
        if (needsUrl && !url.trim()) {
            Alert.alert('Помилка', 'Введіть Server URL');
            return;
        }
        if (!key.trim() && platform !== 'save') {
            Alert.alert('Помилка', 'Введіть Stream Key');
            return;
        }
        navigation.navigate('Streaming', {
            matchSettings,
            streamConfig: { platform, rtmpUrl: url, streamKey: key, saveToPhone: saveLocal },
        });
    };

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

                        {needsUrl && (
                            <View style={globalStyles.inputGroup}>
                                <Text style={globalStyles.label}>SERVER URL</Text>
                                <TextInput
                                    style={globalStyles.input}
                                    value={url}
                                    onChangeText={setUrl}
                                    placeholder="rtmp://..."
                                    placeholderTextColor="#475569"
                                    autoCapitalize="none"
                                />
                            </View>
                        )}

                        <View style={globalStyles.inputGroup}>
                            <Text style={globalStyles.label}>STREAM KEY</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TextInput
                                    style={[globalStyles.input, { flex: 1 }]}
                                    value={key}
                                    onChangeText={setKey}
                                    secureTextEntry={!showKey}
                                    placeholder="••••••••••••"
                                    placeholderTextColor="#475569"
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowKey(!showKey)} style={{ marginLeft: 10 }}>
                                    <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={22} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={[globalStyles.primaryBtn, { marginTop: 30 }]} onPress={handleGoLive}>
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