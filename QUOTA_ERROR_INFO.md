# ⚠️ Error de Cuota Excedida en Firestore

## 🛑 ¿Qué pasó?

El error `429 Quota exceeded` indica que has alcanzado el **límite diario de escrituras** de la capa gratuita (Spark Plan) de Firebase.

### Límites del Plan Gratuito (Spark)
- **Escrituras**: 20,000 documentos al día
- **Lecturas**: 50,000 documentos al día
- **Almacenamiento**: 1 GB total

Debido a las pruebas de sincronización de NBA (miles de documentos) y la generación de datos de prueba, se ha consumido el cupo de hoy.

## 🕒 ¿Qué hacer?

Tienes 2 opciones:

### Opción 1: Esperar (Recomendado)
La cuota se reinicia automáticamente a la **medianoche (hora del Pacífico, PT)**.
- Mañana podrás ejecutar el script de carga de fútbol sin problemas.

### Opción 2: Actualizar Plan (Blaze)
Si necesitas continuar *ya mismo*:
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Clic en ⚙️ > **Usage and Billing**
3. Cambia el plan a **Blaze (Pay as you go)**
   - Es muy barato (centavos por miles de escrituras extra)
   - Te permite continuar inmediatamente

## 🛠️ Corrección de Comando PowerShell

El comando que intentaste ejecutar falló porque `&&` no funciona en PowerShell. Usa este en su lugar:

```powershell
npm install; node load_football_data.js
```

O ejecútalos por separado:

```powershell
npm install
node load_football_data.js
```

## 📊 Estado Actual

✅ **Código Listo**: Todo el sistema de fútbol está implementado.
✅ **Dashboard Actualizado**: Ya soporta fútbol y NBA.
⏳ **Datos**: Pendiente de carga (por cuota).

Mañana solo necesitas ejecutar:
```powershell
python src\scripts\football\process_csv.py
```
Y verás todos los datos en el dashboard.
