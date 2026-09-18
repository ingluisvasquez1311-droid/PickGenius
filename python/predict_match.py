import asyncio
import sys
import os
import json

from playwright.async_api import async_playwright

BROWSER_SESSION = os.path.abspath(os.path.join(
    os.path.dirname(__file__), 'browser_session'
))

def get_groq_key():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))
    try:
        with open(env_path, "r") as f:
            for line in f:
                if line.startswith("GROQ_API_KEY="):
                    return line.split("=", 1)[1].strip()
    except Exception:
        pass
    return None

async def sofa_api_fetch(page, path):
    url = f"https://api.sofascore.com/api/v1{path}"
    result = await page.evaluate(f"""
        async () => {{
            try {{
                const res = await fetch('{url}');
                if (!res.ok) return {{ error: res.status }};
                return await res.json();
            }} catch(e) {{
                return {{ error: e.toString() }};
            }}
        }}
    """)
    return result

async def extract_match_data(url_or_id):
    # Extraer ID si es URL
    match_id = None
    if "id:" in url_or_id:
        match_id = url_or_id.split("id:")[-1].split()[0]
    elif "/" in url_or_id:
        parts = url_or_id.split("/")
        for p in reversed(parts):
            p = p.split('#')[0]
            if p.isdigit():
                match_id = p
                break
    else:
        if url_or_id.isdigit():
            match_id = url_or_id

    if not match_id:
        return {"error": "No se pudo extraer el ID del partido de la URL proporcionada."}

    async with async_playwright() as pw:
        browser = await pw.chromium.launch_persistent_context(
            user_data_dir=BROWSER_SESSION,
            headless=True,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        page = await browser.new_page()
        
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
        """)

        # Visitar home para preparar cookies
        try:
            await page.goto("https://www.sofascore.com", wait_until='domcontentloaded', timeout=15000)
        except:
            pass

        data = {
            "id": match_id,
            "home": "Local",
            "away": "Visitante",
            "tournament": "Torneo",
            "h2h": "",
            "home_form": "",
            "away_form": "",
            "total_shots_home_avg": 0,
            "total_shots_away_avg": 0,
        }

        # 1. Obtener detalles del evento
        ev_data = await sofa_api_fetch(page, f"/event/{match_id}")
        if not ev_data or "error" in ev_data:
            await browser.close()
            return {"error": f"Error al cargar evento {match_id}. Verifique si el enlace es de un partido real."}
            
        event = ev_data.get("event", {})
        data["home"] = event.get("homeTeam", {}).get("name", "Local")
        data["away"] = event.get("awayTeam", {}).get("name", "Visitante")
        data["tournament"] = event.get("tournament", {}).get("name", "Competición")
        home_id = event.get("homeTeam", {}).get("id")
        away_id = event.get("awayTeam", {}).get("id")
        tournament_id = event.get("tournament", {}).get("uniqueTournament", {}).get("id")
        season_id = event.get("season", {}).get("id")

        # 2. Obtener H2H
        h2h_data = await sofa_api_fetch(page, f"/event/{match_id}/h2h")
        h2h_events = h2h_data.get("events", [])[:5] if h2h_data and "error" not in h2h_data else []

        # 3. Forma
        home_f_data = await sofa_api_fetch(page, f"/team/{home_id}/events/last/0") if home_id else {}
        home_events = home_f_data.get("events", [])[:5] if home_f_data and "error" not in home_f_data else []

        away_f_data = await sofa_api_fetch(page, f"/team/{away_id}/events/last/0") if away_id else {}
        away_events = away_f_data.get("events", [])[:5] if away_f_data and "error" not in away_f_data else []

        def fmt_form(games):
            out = []
            for g in games:
                h = g.get("homeTeam", {}).get("name", "-")
                a = g.get("awayTeam", {}).get("name", "-")
                hs = g.get("homeScore", {}).get("current", "-")
                as_ = g.get("awayScore", {}).get("current", "-")
                out.append(f"{h} {hs}-{as_} {a}")
            return " | ".join(out) if out else "Sin datos recientes"

        data["h2h"] = fmt_form(h2h_events)
        data["home_form"] = fmt_form(home_events)
        data["away_form"] = fmt_form(away_events)

        # 4. REMATES TOTALES (Total Shots) del torneo
        if home_id and tournament_id and season_id:
            h_stats = await sofa_api_fetch(page, f"/team/{home_id}/unique-tournament/{tournament_id}/season/{season_id}/statistics/overall")
            a_stats = await sofa_api_fetch(page, f"/team/{away_id}/unique-tournament/{tournament_id}/season/{season_id}/statistics/overall")
            
            if h_stats and "error" not in h_stats and "statistics" in h_stats:
                data["total_shots_home_avg"] = h_stats["statistics"].get("shots", 0) / max(1, h_stats["statistics"].get("matches", 1))
            if a_stats and "error" not in a_stats and "statistics" in a_stats:
                data["total_shots_away_avg"] = a_stats["statistics"].get("shots", 0) / max(1, a_stats["statistics"].get("matches", 1))

        await browser.close()
        return data

async def predict_match(match_data):
    api_key = get_groq_key()
    if not api_key:
        return {"error": "Falta GROQ_API_KEY en .env del backend"}

    prompt = f"""Eres una Inteligencia Artificial avanzada especializada en apuestas deportivas (Fútbol). Tu objetivo es detectar la apuesta de mayor valor (Value Bet).

PARTIDO: {match_data['home']} vs {match_data['away']}
TORNEO: {match_data['tournament']}
H2H (Frente a frente últimos 5): {match_data['h2h']}
FORMA {match_data['home']} (Últimos 5): {match_data['home_form']}
FORMA {match_data['away']} (Últimos 5): {match_data['away_form']}
PROMEDIO REMATES TOTALES POR PARTIDO: {match_data['home']}: {match_data['total_shots_home_avg']:.1f} tiros | {match_data['away']}: {match_data['total_shots_away_avg']:.1f} tiros

Instrucciones Críticas:
1. Analiza fuertemente el mercado de Remates si ves promedios altos.
2. Encuentra la apuesta con mejor balance Riesgo/Beneficio.
3. El JSON debe ser estricto.

Responde SOLO con este JSON:
{{
  "pick": "Mercado exacto (ej. Local o Empate, Más de 2.5 goles, Más de 15.5 remates, etc)",
  "confianza": número del 1 al 100,
  "valor": "Alto" o "Medio" o "Bajo",
  "riesgo": "Alto" o "Medio" o "Bajo",
  "cuota_estimada": "Ej: 1.85",
  "razonamiento": "Explicación directa de 3 líneas sobre por qué esta es la mejor apuesta.",
  "estadisticas_clave": [
    "Dato crucial 1 (ej. Remates promedio)",
    "Dato crucial 2",
    "Dato crucial 3"
  ]
}}"""

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        prediction = json.loads(response.choices[0].message.content)
        return {"match": match_data, "prediction": prediction}
    except Exception as e:
        return {"error": f"Fallo en la IA: {str(e)}"}

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Debe proporcionar la URL o ID del partido."}))
        return

    url_or_id = sys.argv[1]
    match_data = await extract_match_data(url_or_id)
    
    if "error" in match_data:
        print(json.dumps(match_data))
        return
        
    result = await predict_match(match_data)
    print(json.dumps(result))

if __name__ == "__main__":
    asyncio.run(main())
