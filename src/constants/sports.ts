import { Sport } from '../types';

export const SPORTS: Record<Sport, any> = {
    football: { name: 'Футбол', icon: '⚽', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 2, periodLabel: (p: number) => (p === 1 ? '1st HALF' : '2nd HALF') },
    basketball: { name: 'Баскетбол', icon: '🏀', timerMode: 'countdown', defaultTime: 600, scoreButtons: [1, 2, 3], periods: 4, periodLabel: (p: number) => `${p} QUARTER` },
    hockey: { name: 'Хокей', icon: '🏒', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 3, periodLabel: (p: number) => `${p} PERIOD` },
    volleyball: { name: 'Волейбол', icon: '🏐', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 5, periodLabel: (p: number) => `SET ${p}` },
    tennis: { name: 'Теніс', icon: '🎾', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 5, periodLabel: (p: number) => `SET ${p}` },
    padel: { name: 'Падел', icon: '🎾', timerMode: 'countup', defaultTime: 0, scoreButtons: [1], periods: 3, periodLabel: (p: number) => `SET ${p}` },
};