"""
PickGenius - Sports Scraper
Recolecta datos en tiempo real de múltiples deportes
"""

import asyncio
import logging
import os
import aiohttp
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger("SportsScraper")

SPORTS_CONFIG = {
    "football": {
        "name": "Fútbol",
        "leagues": ["Premier League", "La Liga", "Serie A", "Bundesliga", "Liga BetPlay"],
        "api_endpoint": "soccer"
    },
    "basketball": {
        "name": "Baloncesto",
        "leagues": ["NBA", "EuroLeague"],
        "api_endpoint": "basketball"
    },
    "tennis": {
        "name": "Tenis",
        "leagues": ["ATP", "WTA"],
        "api_endpoint": "tennis"
    },
    "baseball": {
        "name": "Béisbol",
        "leagues": ["MLB"],
        "api_endpoint": "baseball"
    },
    "american_football": {
        "name": "NFL",
        "leagues": ["NFL"],
        "api_endpoint": "american-football"
    },
    "hockey": {
        "name": "Hockey",
        "leagues": ["NHL"],
        "api_endpoint": "hockey"
    }
}

class SportsScraper:
    def __init__(self):
        self.api_key = os.getenv("SPORTS_API_KEY", "")
        self.base_url = "https://v3.football.api-sports.io"  # API-Sports
        self.session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if not self.session or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={
                    "x-rapidapi-key": self.api_key,
                    "x-rapidapi-host": "v3.football.api-sports.io"
                }
            )
        return self.session

    async def _request(self, url: str, params: dict = {}) -> dict:
        """Realiza una petición HTTP con manejo de errores"""
        try:
            session = await self._get_session()
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status == 200:
                    return await resp.json()
                logger.warning(f"⚠️ API respondió {resp.status} para {url}")
                return {}
        except asyncio.TimeoutError:
            logger.error(f"⏱️ Timeout al consultar {url}")
            return {}
        except Exception as e:
            logger.error(f"❌ Error en request a {url}: {e}")
            return {}

    async def fetch_live_matches(self) -> list:
        """Obtiene partidos en vivo de fútbol"""
        url = f"{self.base_url}/fixtures"
        data = await self._request(url, {"live": "all"})
        fixtures = data.get("response", [])
        return [self._normalize_football_match(f, is_live=True) for f in fixtures]

    async def fetch_upcoming_matches(self) -> list:
        """Obtiene próximos partidos (próximas 24h)"""
        today = datetime.now().strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        url = f"{self.base_url}/fixtures"
        data = await self._request(url, {"date": today, "timezone": "America/Bogota"})
        fixtures = data.get("response", [])
        return [self._normalize_football_match(f, is_live=False) for f in fixtures[:50]]

    def _normalize_football_match(self, fixture: dict, is_live: bool) -> dict:
        """Normaliza la respuesta de API a formato estándar PickGenius"""
        f = fixture.get("fixture", {})
        teams = fixture.get("teams", {})
        goals = fixture.get("goals", {})
        league = fixture.get("league", {})
        score = fixture.get("score", {})

        return {
            "id": str(f.get("id", "")),
            "sport": "football",
            "sport_name": "Fútbol",
            "league": league.get("name", ""),
            "league_logo": league.get("logo", ""),
            "country": league.get("country", ""),
            "status": f.get("status", {}).get("short", "NS"),
            "status_long": f.get("status", {}).get("long", "Not Started"),
            "is_live": is_live,
            "date": f.get("date", ""),
            "timestamp": f.get("timestamp", 0),
            "elapsed": f.get("status", {}).get("elapsed"),
            "home_team": {
                "id": str(teams.get("home", {}).get("id", "")),
                "name": teams.get("home", {}).get("name", ""),
                "logo": teams.get("home", {}).get("logo", ""),
                "winner": teams.get("home", {}).get("winner"),
            },
            "away_team": {
                "id": str(teams.get("away", {}).get("id", "")),
                "name": teams.get("away", {}).get("name", ""),
                "logo": teams.get("away", {}).get("logo", ""),
                "winner": teams.get("away", {}).get("winner"),
            },
            "score": {
                "home": goals.get("home"),
                "away": goals.get("away"),
                "halftime": score.get("halftime", {}),
                "fulltime": score.get("fulltime", {}),
            },
            "venue": f.get("venue", {}).get("name", ""),
            "referee": f.get("referee", ""),
        }

    async def fetch_all_sports(self) -> dict:
        """Recolecta datos de todos los deportes en paralelo"""
        live_task = asyncio.create_task(self.fetch_live_matches())
        upcoming_task = asyncio.create_task(self.fetch_upcoming_matches())

        live, upcoming = await asyncio.gather(live_task, upcoming_task, return_exceptions=True)

        if isinstance(live, Exception):
            logger.error(f"Error en live matches: {live}")
            live = []
        if isinstance(upcoming, Exception):
            logger.error(f"Error en upcoming matches: {upcoming}")
            upcoming = []

        return {"live": live, "upcoming": upcoming}

    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
