"""
PickGenius - BetPlay Odds Downloader
Descarga y normaliza cuotas de BetPlay Colombia
"""

import asyncio
import json
import logging
import os
from datetime import datetime
import aiohttp
from pathlib import Path

logger = logging.getLogger("BetPlayOdds")

class BetPlayOddsDownloader:
    def __init__(self):
        self.api_key = os.getenv("BETPLAY_API_KEY", "")
        # BetPlay usa The Odds API como fuente alternativa
        self.odds_api_key = os.getenv("ODDS_API_KEY", "")
        self.base_url = "https://api.the-odds-api.com/v4"
        self.data_dir = Path("../data")
        self.data_dir.mkdir(exist_ok=True)

    async def fetch_odds(self) -> list:
        """Descarga cuotas de múltiples deportes"""
        sports = ["soccer_colombia_primera_a", "soccer_epl", "basketball_nba", "americanfootball_nfl"]
        all_odds = []

        async with aiohttp.ClientSession() as session:
            tasks = [self._fetch_sport_odds(session, sport) for sport in sports]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, list):
                all_odds.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"Error descargando cuotas: {result}")

        # Guardar respaldo local
        backup_path = self.data_dir / f"odds_backup_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        try:
            with open(backup_path, "w", encoding="utf-8") as f:
                json.dump(all_odds, f, ensure_ascii=False, indent=2, default=str)
        except Exception as e:
            logger.warning(f"No se pudo guardar respaldo local: {e}")

        return all_odds

    async def _fetch_sport_odds(self, session: aiohttp.ClientSession, sport: str) -> list:
        """Descarga cuotas para un deporte específico"""
        url = f"{self.base_url}/sports/{sport}/odds"
        params = {
            "apiKey": self.odds_api_key,
            "regions": "eu,us",
            "markets": "h2h,spreads,totals",
            "oddsFormat": "decimal",
        }
        try:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return [self._normalize_odds(event, sport) for event in data]
                elif resp.status == 401:
                    logger.warning(f"API key inválida para {sport}")
                    return self._mock_odds(sport)  # Fallback a datos mock
                else:
                    logger.warning(f"Status {resp.status} para {sport}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching odds para {sport}: {e}")
            return self._mock_odds(sport)

    def _normalize_odds(self, event: dict, sport: str) -> dict:
        """Normaliza cuotas al formato PickGenius"""
        bookmakers = event.get("bookmakers", [])
        betplay_odds = next(
            (b for b in bookmakers if "bet" in b.get("key", "").lower()),
            bookmakers[0] if bookmakers else {}
        )

        markets = {}
        for market in betplay_odds.get("markets", []):
            market_key = market.get("key")
            outcomes = {o["name"]: o["price"] for o in market.get("outcomes", [])}
            markets[market_key] = outcomes

        return {
            "event_id": event.get("id", ""),
            "sport": sport,
            "home_team": event.get("home_team", ""),
            "away_team": event.get("away_team", ""),
            "commence_time": event.get("commence_time", ""),
            "bookmaker": betplay_odds.get("title", "BetPlay"),
            "markets": markets,
            "h2h": markets.get("h2h", {}),
            "last_update": betplay_odds.get("last_update", ""),
        }

    def _mock_odds(self, sport: str) -> list:
        """Devuelve cuotas de ejemplo cuando la API no está disponible"""
        logger.info(f"🎭 Usando cuotas mock para {sport}")
        return [
            {
                "event_id": f"mock_{sport}_1",
                "sport": sport,
                "home_team": "Equipo Local",
                "away_team": "Equipo Visitante",
                "commence_time": datetime.utcnow().isoformat(),
                "bookmaker": "BetPlay",
                "markets": {"h2h": {"Home": 1.85, "Draw": 3.20, "Away": 4.10}},
                "h2h": {"Home": 1.85, "Draw": 3.20, "Away": 4.10},
                "last_update": datetime.utcnow().isoformat(),
                "is_mock": True
            }
        ]
