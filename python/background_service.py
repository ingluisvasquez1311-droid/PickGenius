import asyncio
import os
import json
from cache_browser_system import CacheBrowserSystem
from oracle_service import PickGeniusOracle
from sync_service import PickGeniusSync

async def main():
    print("🚀 Iniciando GENIUS-SYNC ENGINE (Anti-Ban + AI + Firebase)...")
    
    # 1. Rutas
    base_path = os.path.dirname(os.path.abspath(__file__))
    service_account = os.path.join(base_path, '..', 'firebase-service-account.json')
    
    try:
        # 2. Inicializar componentes
        system = CacheBrowserSystem(redis_host='localhost', redis_port=6379)
        oracle = PickGeniusOracle()  # Usa GROQ_API_KEY del entorno
        sync = PickGeniusSync(service_account)
        
        SPORTS = ['football', 'basketball', 'tennis', 'baseball', 'nfl', 'nhl']
        
        print("✅ Todos los sistemas inicializados.")
        print("ℹ️  Presiona Ctrl+C para detener")
        
        loop_count = 0
        
        while True:
            try:
                loop_count += 1
                
                # --- PASO 1: SCRAPING (Actualizar Cache) ---
                print(f"\n🔄 [CICLO {loop_count}] Iniciando captura de datos...")
                await system.refresh_all_sports(SPORTS, 'live')
                
                # Cada 10 ciclos refrescamos programados
                if loop_count % 10 == 1:
                    print("📅 Capturando partidos PROGRAMADOS...")
                    await system.refresh_all_sports(SPORTS, 'scheduled')
                
                # --- PASO 2: IA ORACLE (Generar Predicciones) ---
                print("🧠 Consultando al Oráculo para nuevos partidos...")
                for sport in SPORTS:
                    # Obtener partidos de Redis
                    # Buscamos las llaves de cache directamente para procesar
                    pattern = f"sports_cache:*"
                    keys = system.redis_client.keys(pattern)
                    
                    for key in keys:
                        raw_data = system.redis_client.get(key)
                        if not raw_data: continue
                        
                        cache_obj = json.loads(raw_data)
                        if cache_obj.get('sport') != sport: continue
                        
                        matches = cache_obj.get('data', [])
                        for match in matches:
                            match_id = f"{sport}_{match['home_team']}_{match['away_team']}".replace(" ", "_").lower()
                            
                            # Solo predecir si no existe ya una predicción en cache
                            if not system.redis_client.exists(f"prediction:{match_id}"):
                                print(f"🔮 Prediciendo: {match['home_team']} vs {match['away_team']} ({sport})")
                                prediction = await oracle.generate_prediction(
                                    sport, 
                                    match['home_team'], 
                                    match['away_team'],
                                    match.get('home_score'),
                                    match.get('away_score')
                                )
                                # Guardar predicción en Redis (TTL 12 horas)
                                system.redis_client.set(f"prediction:{match_id}", json.dumps(prediction), ex=12*3600)
                
                # --- PASO 3: SYNC (Subir a Firebase) ---
                print("📡 Sincronizando datos con la Nube...")
                for sport in SPORTS:
                    await sync.sync_matches_to_firebase(sport, 'live')
                    if loop_count % 10 == 1:
                        await sync.sync_matches_to_firebase(sport, 'scheduled')
                
                # Mostrar estadísticas
                stats = system.get_stats()
                print(f"📊 Stats: Cache Hits: {stats['cache_hit_rate']} | Peticiones Browser: {stats['browser_requests']}")
                
                print("⏳ Esperando 30 segundos para siguiente ciclo...")
                await asyncio.sleep(30)
                
            except Exception as e:
                print(f"❌ Error en ciclo: {e}")
                await asyncio.sleep(60)
                
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo servicio...")
        if 'system' in locals():
            await system.close_browser()
    except Exception as e:
        print(f"❌ Error fatal: {e}")
        if 'system' in locals():
            await system.close_browser()

if __name__ == "__main__":
    asyncio.run(main())
