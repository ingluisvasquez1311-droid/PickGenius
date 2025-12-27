const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found');
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');
const vars = {};

lines.forEach(line => {
    const idx = line.indexOf('=');
    if (idx !== -1) {
        const key = line.substring(0, idx).trim();
        let val = line.substring(idx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        }
        vars[key] = val;
    }
});

const projectId = vars['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] || vars['FIREBASE_PROJECT_ID'];
const clientEmail = vars['FIREBASE_CLIENT_EMAIL'];
let privateKey = vars['FIREBASE_PRIVATE_KEY'];

console.log('📝 Variables extraídas:');
console.log('   Project ID:', projectId);
console.log('   Client Email:', clientEmail);
console.log('   Raw Private Key length:', privateKey ? privateKey.length : 0);

if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing variables in .env.local');
    process.exit(1);
}

// Limpiar la llave privada y asegurar formato PEM real
// 1. Quitar encabezados conocidos de forma agresiva
let cleanKey = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/BEGIN/g, '')
    .replace(/END/g, '')
    .replace(/PRIVATE/g, '')
    .replace(/KEY/g, '')
    .replace(/[-]/g, '')
    .replace(/\\\\n/g, '')
    .replace(/\\n/g, '');

// 2. Quedarnos SOLO con caracteres Base64
cleanKey = cleanKey.replace(/[^A-Za-z0-9+/=]/g, '').trim();

console.log('📝 Cleaned Key length:', cleanKey.length);
if (cleanKey.length < 100) {
    console.error('❌ Llave demasiado corta después de limpiar. Contenido:', cleanKey);
    process.exit(1);
}

const chunks = cleanKey.match(/.{1,64}/g);
const finalPem = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;

const serviceAccount = {
    project_id: projectId,
    client_email: clientEmail,
    private_key: finalPem,
    type: 'service_account'
};

const base64 = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');

let newContent = content;
if (!content.includes('FIREBASE_SERVICE_ACCOUNT_BASE64')) {
    newContent += `\nFIREBASE_SERVICE_ACCOUNT_BASE64="${base64}"\n`;
} else {
    // Reemplazar la línea existente cuidando de no romper el resto del archivo
    const regex = /^FIREBASE_SERVICE_ACCOUNT_BASE64=.*$/m;
    if (regex.test(content)) {
        newContent = content.replace(regex, `FIREBASE_SERVICE_ACCOUNT_BASE64="${base64}"`);
    } else {
        newContent += `\nFIREBASE_SERVICE_ACCOUNT_BASE64="${base64}"\n`;
    }
}

fs.writeFileSync(envPath, newContent);
console.log('✅ .env.local actualizado con Base64 verificado.');
