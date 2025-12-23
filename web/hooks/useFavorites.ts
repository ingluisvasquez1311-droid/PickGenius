import { useState, useEffect } from 'react';

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('favorites');
            if (stored) {
                return JSON.parse(stored);
            }
        }
        return [];
    });

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const newFavorites = prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id];

            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return { favorites, toggleFavorite, isFavorite };
}
