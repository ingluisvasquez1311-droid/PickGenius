// src/services/pythonRunner.js
const { spawn } = require('child_process');
const path = require('path');

/**
 * Ejecuta un script Python y devuelve una promesa que se resuelve
 * cuando el proceso termina.
 *
 * @param {string} scriptPath - Ruta relativa al script Python (ej. 'src/scripts/fetch_missing_data.py')
 * @returns {Promise<string>} - Salida estándar del script
 */
function runPythonScript(scriptPath) {
    return new Promise((resolve, reject) => {
        const absolutePath = path.resolve(process.cwd(), scriptPath);
        const py = spawn('py', [absolutePath]);

        let stdout = '';
        let stderr = '';

        py.stdout.on('data', (data) => (stdout += data.toString()));
        py.stderr.on('data', (data) => (stderr += data.toString()));

        py.on('close', (code) => {
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(`Python script exited with code ${code}: ${stderr}`));
            }
        });
    });
}

module.exports = { runPythonScript };