import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface Props {
    visible: boolean;
    minutes: string;
    seconds: string;
    onChangeMinutes: (v: string) => void;
    onChangeSeconds: (v: string) => void;
    onCancel: () => void;
    onSave: () => void;
}

export default function EditTimeModal({ visible, minutes, seconds, onChangeMinutes, onChangeSeconds, onCancel, onSave }: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Виставити час</Text>
                    <View style={styles.timeInputRow}>
                        <TextInput style={styles.timeInput} keyboardType="number-pad" value={minutes} onChangeText={onChangeMinutes} maxLength={3} />
                        <Text style={styles.timeSeparator}>:</Text>
                        <TextInput style={styles.timeInput} keyboardType="number-pad" value={seconds} onChangeText={onChangeSeconds} maxLength={2} />
                    </View>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={onCancel}><Text style={styles.modalBtnText}>Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={onSave}><Text style={styles.modalBtnText}>Зберегти</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { width: 280, backgroundColor: '#1E293B', padding: 20, borderRadius: 15 },
    modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
    timeInputRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    timeInput: { backgroundColor: '#334155', color: '#fff', fontSize: 22, width: 55, textAlign: 'center', borderRadius: 8, padding: 8 },
    timeSeparator: { color: '#fff', fontSize: 22, marginHorizontal: 5 },
    modalButtons: { flexDirection: 'row', gap: 10 },
    modalBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
    modalBtnCancel: { backgroundColor: '#64748B' },
    modalBtnSave: { backgroundColor: '#10B981' },
    modalBtnText: { color: '#fff', fontWeight: 'bold' },
});