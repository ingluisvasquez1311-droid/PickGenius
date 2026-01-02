"use client";

import { useState, useEffect, useCallback } from 'react';

export interface CreditTransaction {
    id: string;
    amount: number;
    type: 'deposit' | 'spend' | 'reward';
    description: string;
    timestamp: string;
}

export const useCredits = () => {
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadCredits = useCallback(() => {
        const savedBalance = localStorage.getItem('pg_credits_balance');
        const savedTransactions = localStorage.getItem('pg_credits_tx');

        if (savedBalance) {
            setBalance(parseFloat(savedBalance));
        } else {
            // Initial reward for new users
            setBalance(500);
            localStorage.setItem('pg_credits_balance', '500');
        }

        if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        loadCredits();
    }, [loadCredits]);

    const addCredits = (amount: number, description: string) => {
        const newBalance = balance + amount;
        setBalance(newBalance);

        const newTx: CreditTransaction = {
            id: Math.random().toString(36).substr(2, 9),
            amount,
            type: amount > 0 ? 'deposit' : 'spend',
            description,
            timestamp: new Date().toISOString()
        };

        const updatedTx = [newTx, ...transactions];
        setTransactions(updatedTx);

        localStorage.setItem('pg_credits_balance', newBalance.toString());
        localStorage.setItem('pg_credits_tx', JSON.stringify(updatedTx));
    };

    const spendCredits = (amount: number, description: string) => {
        if (balance < amount) return false;

        const newBalance = balance - amount;
        setBalance(newBalance);

        const newTx: CreditTransaction = {
            id: Math.random().toString(36).substr(2, 9),
            amount: -amount,
            type: 'spend',
            description,
            timestamp: new Date().toISOString()
        };

        const updatedTx = [newTx, ...transactions];
        setTransactions(updatedTx);

        localStorage.setItem('pg_credits_balance', newBalance.toString());
        localStorage.setItem('pg_credits_tx', JSON.stringify(updatedTx));
        return true;
    };

    return {
        balance,
        transactions,
        addCredits,
        spendCredits,
        isLoaded
    };
};
