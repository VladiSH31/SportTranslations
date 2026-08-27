import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HistoryItem } from '../types';

interface HistoryContextValue {
    history: HistoryItem[];
    addToHistory: (item: HistoryItem) => void;
}

const HistoryContext = createContext<HistoryContextValue>({
    history: [],
    addToHistory: () => {},
});

export function HistoryProvider({ children }: { children: ReactNode }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const addToHistory = (item: HistoryItem) => {
        setHistory(prev => [...prev, item]);
    };

    return (
        <HistoryContext.Provider value={{ history, addToHistory }}>
            {children}
        </HistoryContext.Provider>
    );
}

export const useHistory = () => useContext(HistoryContext);