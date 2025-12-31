/**
 * PickGenius Image Utilities
 * Standardizes how we fetch images from external providers like Sofascore.
 */

// Using local Next.js proxy via rewrites to avoid external proxy blocks and CORS issues
const PROXY_PREFIX = '/api/proxy-image';

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
    if (!id) return getProxiedDefault('team');
    return `${PROXY_PREFIX}/team/${id}`;
};

export const getTeamLogo = getTeamImage;



export const getTournamentImage = (id: number | string) => {
    if (!id) return getProxiedDefault('tournament');
    return `${PROXY_PREFIX}/tournament/${id}`;
};

export const getCategoryImage = (id: number | string) => {
    if (!id) return getProxiedDefault('tournament');
    return `${PROXY_PREFIX}/category/${id}`;
};

export const getPlayerImage = (id: number | string) => {
    if (!id) return getProxiedDefault('player');
    return `${PROXY_PREFIX}/player/${id}`;
};

const getProxiedDefault = (type: 'team' | 'tournament' | 'player') => {
    return DEFAULT_IMAGES[type];
};

export const DEFAULT_IMAGES = {
    team: 'https://www.sofascore.com/static/images/default-team.png',
    tournament: 'https://www.sofascore.com/static/images/default-tournament.png',
    player: 'https://www.sofascore.com/static/images/default-player.png'
};
