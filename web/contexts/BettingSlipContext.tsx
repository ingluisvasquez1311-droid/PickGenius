'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Bet {
    id: string;
    matchId: string;
    selection: string; // e.g., "Home", "Away", "Draw", "Over 2.5"
    odds: number;
    matchLabel: string; // "Real Madrid vs Barcelona"
    market: string; // "Winner", "Goals", etc.
}

interface BettingSlipContextType {
    bets: Bet[];
    addToSlip: (bet: Omit<Bet, 'id'>) => void;
    removeFromSlip: (id: string) => void;
    clearSlip: () => void;
    isOpen: boolean;
    toggleSlip: () => void;
}

const BettingSlipContext = createContext<BettingSlipContextType | undefined>(undefined);

export function BettingSlipProvider({ children }: { children: React.ReactNode }) {
    const [bets, setBets] = useState<Bet[]>(() => {
        if (typeof window !== 'undefined') {
            const savedBets = localStorage.getItem('pickgenius_betslip');
            if (savedBets) {
                try {
                    return JSON.parse(savedBets);
                } catch (e) {
                    console.error('Error loading bet slip', e);
                }
            }
        }
        return [];
    });
    const [isOpen, setIsOpen] = useState(false);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('pickgenius_betslip', JSON.stringify(bets));
    }, [bets]);

    const addToSlip = (bet: Omit<Bet, 'id'>) => {
        const newBet = { ...bet, id: Math.random().toString(36).substr(2, 9) };
        // Check if already exists (optional: prevent duplicates)
        const exists = bets.some(b => b.matchId === bet.matchId && b.selection === bet.selection);
        if (!exists) {
            setBets(prev => [...prev, newBet]);
            setIsOpen(true); // Auto open when adding
        }
    };

    const removeFromSlip = (id: string) => {
        setBets(prev => prev.filter(b => b.id !== id));
    };

    const clearSlip = () => {
        setBets([]);
    };

    const toggleSlip = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <BettingSlipContext.Provider value={{ bets, addToSlip, removeFromSlip, clearSlip, isOpen, toggleSlip }}>
            {children}
        </BettingSlipContext.Provider>
    );
}

export function useBettingSlip() {
    const context = useContext(BettingSlipContext);
    if (context === undefined) {
        throw new Error('useBettingSlip must be used within a BettingSlipProvider');
    }
    return context;
}
