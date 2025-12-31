"use client";

import { useState, useEffect } from 'react';

export interface BankrollEntry {
    id: string;
    date: string;
    match: string;
    type: 'W' | 'L' | 'P';
    stake: number;
    odds: number;
    profit: number;
}

export const useBankroll = () => {
    const [entries, setEntries] = useState<BankrollEntry[]>([]);
    const [initialBankroll, setInitialBankroll] = useState(1000);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedEntries = localStorage.getItem('pg_bankroll_entries');
        const savedInitial = localStorage.getItem('pg_bankroll_initial');

        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        }
        if (savedInitial) {
            setInitialBankroll(Number(savedInitial));
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('pg_bankroll_entries', JSON.stringify(entries));
            localStorage.setItem('pg_bankroll_initial', initialBankroll.toString());
        }
    }, [entries, initialBankroll, isLoaded]);

    const addEntry = (entry: Omit<BankrollEntry, 'id' | 'profit'>) => {
        let profit = 0;
        if (entry.type === 'W') profit = entry.stake * (entry.odds - 1);
        else if (entry.type === 'L') profit = -entry.stake;

        const newEntry: BankrollEntry = {
            ...entry,
            id: Date.now().toString(),
            profit
        };
        setEntries(prev => [newEntry, ...prev]);
    };

    const deleteEntry = (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const totalProfit = entries.reduce((acc, curr) => acc + curr.profit, 0);
    const currentBankroll = initialBankroll + totalProfit;
    const winRate = entries.length > 0
        ? (entries.filter(e => e.type === 'W').length / entries.length) * 100
        : 0;

    const roi = entries.reduce((acc, curr) => acc + curr.stake, 0) > 0
        ? (totalProfit / entries.reduce((acc, curr) => acc + curr.stake, 0)) * 100
        : 0;

    return {
        entries,
        initialBankroll,
        currentBankroll,
        totalProfit,
        winRate,
        roi,
        addEntry,
        deleteEntry,
        setInitialBankroll,
        isLoaded
    };
};
