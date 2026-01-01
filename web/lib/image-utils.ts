/**
 * PickGenius Image Utilities
 * Standardizes how we fetch images from external providers like Sofascore.
 */

// Using local Stealth Proxy (app/api/image-proxy) to bypass 403s
const PROXY_PREFIX = '/api/image-proxy';

export const getBlurDataURL = (color = '#111') => {
    const svg = `
    <svg width="40" height="40" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <rect width="40" height="40" fill="${color}" />
    </svg>`;
    const toBase64 = (str: string) =>
        typeof window === 'undefined'
            ? Buffer.from(str).toString('base64')
            : window.btoa(str);

    return `data:image/svg+xml;base64,${toBase64(svg)}`;
};

export const getTeamImage = (id: number | string) => {
    if (!id) return DEFAULT_IMAGES.team;
    return `${PROXY_PREFIX}?path=team/${id}/image`;
};

export const getTeamLogo = getTeamImage;

export const getTournamentImage = (id: number | string) => {
    if (!id) return DEFAULT_IMAGES.tournament;
    return `${PROXY_PREFIX}?path=unique-tournament/${id}/image`;
};

export const getCategoryImage = (id: number | string) => {
    if (!id) return DEFAULT_IMAGES.tournament;
    return `${PROXY_PREFIX}?path=category/${id}/image`;
};

export const getPlayerImage = (id: number | string) => {
    if (!id) return DEFAULT_IMAGES.player;
    return `${PROXY_PREFIX}?path=player/${id}/image`;
};

const getProxiedDefault = (type: 'team' | 'tournament' | 'player') => {
    return DEFAULT_IMAGES[type];
};

export const DEFAULT_IMAGES = {
    team: 'https://www.sofascore.com/static/images/default-team.png',
    tournament: 'https://www.sofascore.com/static/images/default-tournament.png',
    player: 'https://www.sofascore.com/static/images/default-player.png'
};
