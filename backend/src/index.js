const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ruta al script de Python (motor del predictor)
const PYTHON_SCRIPT_PATH = path.join(__dirname, '..', '..', 'python', 'predict_match.py');
// Asumiendo que .venv está en PickGenius
const PYTHON_EXEC = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');

app.post('/api/predict', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'La URL del partido es requerida.' });
  }

  console.log(`[Predictor] Iniciando predicción para: ${url}`);
  
  // Ejecutar el script de Python
  const command = `"${PYTHON_EXEC}" "${PYTHON_SCRIPT_PATH}" "${url}"`;
  
  exec(command, { encoding: 'utf-8' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Error de Ejecución]: ${error.message}`);
      return res.status(500).json({ error: 'Fallo interno al ejecutar el motor de IA.' });
    }
    
    try {
      // El script de Python imprime el JSON resultante
      const jsonStart = stdout.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('Respuesta inválida del motor de Python.');
      }
      
      const jsonString = stdout.substring(jsonStart);
      const data = JSON.parse(jsonString);
      
      if (data.error) {
        return res.status(400).json(data);
      }
      
      console.log(`[Predictor] Éxito. Pronóstico generado.`);
      res.json(data);
    } catch (parseError) {
      console.error(`[Error Parseando JSON]:`, parseError);
      console.error(`[Stdout]:`, stdout);
      res.status(500).json({ error: 'Fallo al interpretar los resultados de la IA.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PickGenius Predictor API corriendo en http://localhost:${PORT}`);
});
