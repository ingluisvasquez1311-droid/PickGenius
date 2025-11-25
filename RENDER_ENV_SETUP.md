# Configuración de Variables de Entorno para Render

## 📋 Variables Requeridas

Copia y pega estas variables en Render Dashboard → Environment Variables

### 1. Firebase (REQUERIDO)

```
GOOGLE_CLOUD_PROJECT=tu-proyecto-firebase-id
```
👉 **Dónde encontrarlo**: Firebase Console → Project Settings → Project ID

```
FIREBASE_API_KEY=tu-firebase-web-api-key
```
👉 **Dónde encontrarlo**: Firebase Console → Project Settings → Web API Key

### 2. API-Football (REQUERIDO)

```
FOOTBALL_API_KEY_1=89366504adcb0bd1a9aabc84eaf6838e
```
✅ **Ya la tienes** - Esta es tu clave actual

**Opcional - Agregar más claves para rotación:**
```
FOOTBALL_API_KEY_2=tu-segunda-clave
FOOTBALL_API_KEY_3=tu-tercera-clave
```
👉 Si tienes más claves en https://dashboard.api-football.com/, agrégalas aquí

### 3. NBA API (Opcional)

```
NBA_API_KEY=tu-nba-api-key
```
👉 Si tienes clave de balldontlie.io o similar

### 4. Gemini AI (Opcional)

```
GEMINI_API_KEY=tu-gemini-api-key
```
👉 Para análisis con IA (opcional por ahora)

### 5. Configuración del Servidor

```
NODE_ENV=production
PORT=10000
```
✅ **Siempre usa estos valores en Render**

---

## 🔑 Firebase Credentials (MUY IMPORTANTE)

Necesitas agregar el contenido completo de `firebase-credentials.json`:

### Paso 1: Copiar el archivo

1. Abre `firebase-credentials.json` en tu computadora
2. Selecciona TODO el contenido (Ctrl+A)
3. Copia (Ctrl+C)

### Paso 2: Agregar en Render

En Render, agrega una nueva variable:

**Key**: `FIREBASE_CREDENTIALS`

**Value**: Pega todo el JSON que copiaste. Debe verse así:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  ...
}
```

---

## 📝 Resumen de Variables Mínimas para Funcionar

Para que el sistema funcione, NECESITAS al menos:

✅ **Obligatorias:**
- `FOOTBALL_API_KEY_1` (ya la tienes)
- `FIREBASE_CREDENTIALS` (contenido de firebase-credentials.json)
- `GOOGLE_CLOUD_PROJECT` (tu project ID de Firebase)
- `NODE_ENV=production`
- `PORT=10000`

⚠️ **Opcionales (pero recomendadas):**
- `FIREBASE_API_KEY` (para frontend)
- `GEMINI_API_KEY` (para IA)
- `NBA_API_KEY` (para NBA)

---

## 🎯 Pasos en Render Dashboard

### 1. Ir a Environment

Una vez creado tu Web Service en Render:

1. Click en tu servicio
2. Click en **"Environment"** en el menú izquierdo
3. Scroll hasta **"Environment Variables"**

### 2. Agregar Variables

Para cada variable:

1. Click **"Add Environment Variable"**
2. **Key**: Nombre de la variable (ej: `FOOTBALL_API_KEY_1`)
3. **Value**: El valor (ej: `89366504adcb0bd1a9aabc84eaf6838e`)
4. Click **"Save Changes"**

### 3. Deploy Automático

Render automáticamente re-desplegará tu servicio cuando guardes las variables.

---

## 📋 Checklist de Configuración

Marca cada variable que agregues:

**Firebase:**
- [ ] `GOOGLE_CLOUD_PROJECT`
- [ ] `FIREBASE_API_KEY`
- [ ] `FIREBASE_CREDENTIALS` (JSON completo)

**API-Football:**
- [ ] `FOOTBALL_API_KEY_1` (89366504adcb0bd1a9aabc84eaf6838e)
- [ ] `FOOTBALL_API_KEY_2` (opcional)
- [ ] `FOOTBALL_API_KEY_3` (opcional)

**Otras APIs:**
- [ ] `NBA_API_KEY` (opcional)
- [ ] `GEMINI_API_KEY` (opcional)

**Configuración:**
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`

---

## 🔍 Verificar Configuración

Después de agregar las variables, verifica que funcione:

```bash
# Health check
curl https://tu-app.onrender.com/health

# Debe responder:
{
  "status": "ok",
  "timestamp": "...",
  "service": "PickGenius - Sports Sync with Intelligent Cache"
}
```

Si hay errores, revisa los **Logs** en Render para ver qué variable falta.

---

## ⚠️ Notas Importantes

1. **NO subas el archivo `.env` a GitHub** - Ya está en `.gitignore`
2. **Firebase Credentials**: El JSON debe estar en UNA SOLA línea o con `\n` para saltos de línea
3. **API Keys**: Nunca compartas tus claves públicamente
4. **Render Free Tier**: Las variables persisten incluso cuando el servicio se duerme

---

## 🆘 Troubleshooting

### Error: "Firebase credentials not found"

✅ **Solución**: Verifica que `FIREBASE_CREDENTIALS` tenga el JSON completo

### Error: "API key not configured"

✅ **Solución**: Verifica que `FOOTBALL_API_KEY_1` esté correcta

### Error: "Cannot connect to Firestore"

✅ **Solución**: 
1. Verifica `GOOGLE_CLOUD_PROJECT`
2. Asegúrate que Firestore esté habilitado en Firebase Console
3. Revisa las reglas de seguridad de Firestore

---

¿Necesitas ayuda para obtener alguna de estas claves? Avísame cuál te falta y te guío.
