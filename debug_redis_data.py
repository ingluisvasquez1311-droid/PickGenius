import redis
import json

# Conectar a Redis Local
r = redis.Redis(host='localhost', port=6379, db=0)

print("🔍 Buscando llaves de fútbol en Redis...")

# Buscar llave de fútbol en vivo
keys = r.keys("*football_live*")

if not keys:
    print("❌ No se encontraron llaves de fútbol en vivo.")
    # Intentar buscar cualquier llave
    keys = r.keys("*")

if keys:
    key = keys[0]
    print(f"✅ Llave encontrada: {key}")
    
    data = r.get(key)
    parsed = json.loads(data)
    
    print("\n📦 ESTRUCTURA DE DATOS (Primer evento):")
    if 'data' in parsed and len(parsed['data']) > 0:
        event = parsed['data'][0]
        print(json.dumps(event, indent=2))
    else:
        print("La llave existe pero no tiene eventos o formato desconocido.")
else:
    print("❌ Redis está vacío. Asegúrate de que el scraper esté corriendo.")
