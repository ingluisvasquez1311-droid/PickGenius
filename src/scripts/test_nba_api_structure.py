"""
Script de prueba para verificar la estructura actual de la NBA API
"""
from nba_api.stats.endpoints import leaguegamelog
from nba_api.stats.static import teams
import json

print("=" * 60)
print("🔍 PROBANDO ESTRUCTURA DE NBA API")
print("=" * 60)

# Probar con un equipo y temporada reciente
team_abbr = 'LAL'
season = '2024-25'  # Temporada actual

print(f"\n📊 Obteniendo game log para {team_abbr} temporada {season}...")

try:
    game_log = leaguegamelog.LeagueGameLog(
        season=season,
        player_or_team_abbreviation=team_abbr,
        season_type_all_star='Regular Season',
        league_id='00',
        timeout=60
    )
    
    print("\n✅ Llamada a API exitosa")
    print("\n🔍 Métodos disponibles:")
    print(f"   - get_data_frames(): {type(game_log.get_data_frames())}")
    print(f"   - get_dict(): {type(game_log.get_dict())}")
    print(f"   - get_normalized_dict(): {type(game_log.get_normalized_dict())}")
    
    # Intentar get_data_frames
    print("\n📋 Probando get_data_frames()...")
    try:
        dfs = game_log.get_data_frames()
        if dfs and len(dfs) > 0:
            df = dfs[0]
            print(f"   ✅ DataFrame obtenido: {len(df)} filas")
            print(f"   Columnas: {list(df.columns)[:10]}...")  # Primeras 10 columnas
            if len(df) > 0:
                print(f"\n   Ejemplo de primera fila:")
                first_row = df.iloc[0].to_dict()
                for key, value in list(first_row.items())[:5]:
                    print(f"      {key}: {value}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Intentar get_normalized_dict
    print("\n📋 Probando get_normalized_dict()...")
    try:
        norm_dict = game_log.get_normalized_dict()
        print(f"   ✅ Dict obtenido")
        print(f"   Claves disponibles: {list(norm_dict.keys())}")
        
        for key in norm_dict.keys():
            data = norm_dict[key]
            if isinstance(data, list) and len(data) > 0:
                print(f"\n   Clave '{key}': {len(data)} elementos")
                print(f"   Ejemplo de primer elemento:")
                first_item = data[0]
                if isinstance(first_item, dict):
                    for k, v in list(first_item.items())[:5]:
                        print(f"      {k}: {v}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Intentar get_dict
    print("\n📋 Probando get_dict()...")
    try:
        raw_dict = game_log.get_dict()
        print(f"   ✅ Dict obtenido")
        print(f"   Claves disponibles: {list(raw_dict.keys())}")
        
        if 'resultSets' in raw_dict:
            print(f"\n   resultSets encontrado: {len(raw_dict['resultSets'])} sets")
            for i, rs in enumerate(raw_dict['resultSets']):
                print(f"      Set {i}: {rs.get('name', 'sin nombre')}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        
except Exception as e:
    print(f"\n❌ Error en llamada a API: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("Prueba completada")
print("=" * 60)
