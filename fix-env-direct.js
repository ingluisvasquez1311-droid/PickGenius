const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'web', '.env.local');

if (!fs.existsSync(envPath)) {
    console.error('❌ No se encontró web/.env.local');
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');

// Buscamos el inicio y fin de la llave
const startMarker = 'FIREBASE_PRIVATE_KEY="';
const endMarker = '"';

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.error('❌ No encontré la variable FIREBASE_PRIVATE_KEY en web/.env.local');
    process.exit(1);
}

const afterStart = content.substring(startIndex + startMarker.length);
const endIndex = afterStart.indexOf(endMarker);

if (endIndex === -1) {
    console.error('❌ No encontré el cierre de comillas " para la llave');
    process.exit(1);
}

let rawKey = afterStart.substring(0, endIndex);

// Limpiamos la llave: quitamos saltos de línea reales y ponemos \\n
const singleLineKey = rawKey.replace(/\n/g, '\\\\n').replace(/\r/g, '');

console.log('\n✅ COPIA ESTA LÍNEA COMPLETA:\n');
console.log(`FIREBASE_PRIVATE_KEY="${singleLineKey}"`);
console.log('\n====================================\n');
