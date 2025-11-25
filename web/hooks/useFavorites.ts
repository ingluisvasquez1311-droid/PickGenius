import { useState, useEffect } from 'react';

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('favorites');
        if (stored) {
            setFavorites(JSON.parse(stored));
        }
    }, []);

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
