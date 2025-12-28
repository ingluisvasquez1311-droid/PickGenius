# 🤖 Modo de Archivo Local para Betplay (Kambi)

Debido a que Betplay utiliza Cloudflare, a veces el puente proxy puede ser bloqueado (Error 403). Para solucionar esto, el "Robot" ahora soporta el uso de archivos JSON manuales.

## 📝 Cómo usarlo

Si el robot falla con error 403, puedes subir o crear el archivo JSON manualmente en la carpeta:
`data/betplay/`

El nombre del archivo debe ser el ID de Kambi + `.json`. 

### Ejemplo:
Si el log dice que falló:
`https://tienda.betplay.com.co/.../group/1000093190.json`

Crea o guarda el JSON correcto en:
`data/betplay/1000093190.json`

## 🚀 Ventajas
1. **Sin Bloqueos**: El robot leerá instantáneamente el archivo sin hacer peticiones externas.
2. **Caché Inteligente**: El archivo se cargará en memoria por 5 minutos para máxima velocidad.
3. **Control Total**: Puedes usar datos de pruebas o raspados manualmente si la API está caída.

> [!TIP]
> Si logras obtener un JSON válido desde tu navegador, simplemente pégalo en esa carpeta y el robot lo procesará automáticamente en la próxima sincronización.
