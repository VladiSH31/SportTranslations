import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    infoText: { color: '#fff', marginBottom: 20 },

    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'transparent' },
    headerTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
    backIcon: { marginRight: 20, padding: 5 },

    primaryBtn: { borderRadius: 12, overflow: 'hidden', elevation: 5, shadowColor: '#4f46e5', shadowOpacity: 0.5, shadowRadius: 10 },
    btnGradient: { paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },

    secondaryBtn: { backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    secondaryBtnText: { color: '#cbd5e1', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },

    cardGradient: { padding: 20, alignItems: 'center', justifyContent: 'center', height: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },

    setupCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    cardTitle: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },

    input: { backgroundColor: '#0f172a', color: '#fff', padding: 14, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 15 },
    label: { color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },

    configCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
    inputGroup: { marginTop: 15 },
});