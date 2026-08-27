export type Sport = 'football' | 'basketball' | 'hockey' | 'volleyball' | 'tennis' | 'padel';

export interface MatchSettings {
    sport: Sport;
    teamA: string;
    teamB: string;
    colorA: string;
    colorB: string;
    logoAUri?: string | null;
    logoBUri?: string | null;
}

export interface StreamConfig {
    platform: 'youtube' | 'twitch' | 'custom';
    rtmpUrl?: string;
    streamKey?: string;
    saveToPhone: boolean;
}

export interface HistoryItem {
    id: string;
    date: string;
    sport: Sport;
    teamA: string;
    teamB: string;
    scoreA: number;
    scoreB: number;
    duration: string;
}