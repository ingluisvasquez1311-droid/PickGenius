const fetch = require('node-fetch');

async function test() {
    const tournamentId = 132; // NBA
    const seasonId = 58766; // Current NBA
    const category = 'points';
    const url = `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/top-players/${category}`;

    console.log("Fetching:", url);
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });

    console.log("Status:", res.status);
    if (res.ok) {
        const data = await res.json();
        console.log("Keys:", Object.keys(data));
        if (data.topPlayers) {
            console.log("Top Players Length:", data.topPlayers.length);
            console.log("First Player Sample:", JSON.stringify(data.topPlayers[0], null, 2));
        } else {
            console.log("Data sample:", JSON.stringify(data, null, 2).substring(0, 500));
        }
    } else {
        const text = await res.text();
        console.log("Error body:", text);
    }
}

test();
