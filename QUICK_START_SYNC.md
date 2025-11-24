# 🏀 Guía Rápida: Sincronización NBA

## ⚠️ Requisito Previo: Instalar Python

**Python no está instalado en tu sistema.** Sigue estos pasos:

### 1. Descargar e Instalar

1. Ve a https://www.python.org/downloads/
2. Descarga Python 3.11 o superior
3. **IMPORTANTE**: Durante instalación, marca ☑️ "Add Python to PATH"
4. Completa la instalación

### 2. Verificar

Abre una nueva terminal PowerShell:

```powershell
python --version
```

Debe mostrar: `Python 3.x.x`

## 🚀 Ejecutar Sincronización

Una vez Python instalado:

```powershell
cd "c:\Users\Daniel\Tiren Parleys"
.\sync_nba_data.bat
```

El script hará todo automáticamente:
- ✅ Instalar dependencias
- ✅ Verificar Firebase
- ✅ Ejecutar sincronización

## 📊 Opciones de Sincronización

**Opción 1**: Sincronización completa
- Rellena huecos 2023-24 (PHI, MIA)
- Obtiene temporada completa 2025-26 (30 equipos)
- ⏱️ Tiempo: 2-4 horas

**Opción 2**: Solo rellenar huecos
- Escanea datos existentes
- Solo obtiene lo faltante
- ⏱️ Tiempo: Variable

## 📁 Archivos Creados

- `requirements.txt` - Dependencias Python
- `sync_nba_data.bat` - Script de sincronización
- `sync_nba_data.ps1` - Alternativa PowerShell
- `src/scripts/verify_setup.py` - Verificación de entorno

## 🔍 Verificar Resultados

Después de sincronizar, revisa en Firebase Console:
- Colección: `nba_regular_season_box_scores_2010_2024_part_3`
- Colección: `nba_regular_season_box_scores_2025_26`

Ver `walkthrough.md` para documentación completa.
