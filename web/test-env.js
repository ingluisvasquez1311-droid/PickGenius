/* eslint-disable */
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico Manual de Entorno (Sin dependencias)...\n');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
    console.error('❌ Error: No se encontró .env.local en la carpeta actual.');
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');
const env = {};

lines.forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let key = match[1];
        let value = match[2] ? match[2].trim() : '';
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
        }
        env[key] = value;
    }
});

const checks = {
    'FIREBASE_PROJECT_ID': env['FIREBASE_PROJECT_ID'] || env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
    'FIREBASE_CLIENT_EMAIL': env['FIREBASE_CLIENT_EMAIL'],
    'FIREBASE_PRIVATE_KEY': env['FIREBASE_PRIVATE_KEY'] ? '✅ (exists)' : '❌',
};

Object.entries(checks).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`${status} ${key}: ${value}`);
});

if (env['FIREBASE_PRIVATE_KEY']) {
    const key = env['FIREBASE_PRIVATE_KEY'];
    console.log('\n🔑 Análisis de PRIVATE_KEY:');
    console.log(`  - Longitud: ${key.length} caracteres`);
    console.log(`  - Empieza con "-----BEGIN": ${key.startsWith('-----BEGIN') ? '✅' : '❌'}`);
    console.log(`  - Termina con "-----END": ${key.includes('-----END') ? '✅' : '❌'}`);
    console.log(`  - Contiene \\\\n (doble escape): ${key.includes('\\\\n') ? '✅' : '❌'}`);
    console.log(`  - Contiene \\n (escape simple): ${key.includes('\\n') ? '✅' : '❌'}`);
    console.log(`  - Contiene saltos reales: ${key.includes('\n') ? '⚠️ SÍ' : '✅ NO'}`);
}
