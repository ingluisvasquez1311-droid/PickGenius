/**
 * PickGenius Image Utilities
 * Standardizes how we fetch images from external providers like Sofascore.
 */

const PROXY = 'https://wsrv.nl/?url=';

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
    return `${PROXY}${encodeURIComponent('https://api.sofascore.com/api/v1/team/' + id + '/image')}&w=100&h=100&fit=contain`;
};

export const getTournamentImage = (id: number | string) => {
    if (!id) return DEFAULT_IMAGES.tournament;
    return `${PROXY}${encodeURIComponent('https://api.sofascore.com/api/v1/unique-tournament/' + id + '/image')}&w=100&h=100&fit=contain`;
};

export const getCategoryImage = (id: number | string) => {
    if (!id) return DEFAULT_IMAGES.tournament;
    return `${PROXY}${encodeURIComponent('https://api.sofascore.com/api/v1/category/' + id + '/image')}&w=100&h=100&fit=cover`;
};

export const getPlayerImage = (id: number | string) => {
    if (!id) return DEFAULT_IMAGES.player;
    return `${PROXY}${encodeURIComponent('https://api.sofascore.com/api/v1/player/' + id + '/image')}&w=200&h=200&fit=cover`;
};

export const DEFAULT_IMAGES = {
    team: 'https://www.sofascore.com/static/images/default-team.png',
    tournament: 'https://www.sofascore.com/static/images/default-tournament.png',
    player: 'https://www.sofascore.com/static/images/default-player.png'
};
