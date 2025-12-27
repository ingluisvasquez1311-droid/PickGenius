const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'firebase-service-account.json');
const OUTPUT_PATH = path.join(__dirname, 'web', '.env.local.generated');

console.log('🔧 Firebase Private Key Fixer');
console.log('============================');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ Error: No se encontró firebase-service-account.json en la raíz.');
    console.error('   Por favor descarga tu JSON de credenciales de Firebase Console');
    console.error('   y guárdalo como: ' + SERVICE_ACCOUNT_PATH);
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    const privateKey = serviceAccount.private_key;
    const projectId = serviceAccount.project_id;
    const clientEmail = serviceAccount.client_email;

    if (!privateKey || !projectId || !clientEmail) {
        console.error('❌ Error: El JSON parece incompleto (faltan campos clave).');
        process.exit(1);
    }

    // Formatear la clave para .env (doble backslash)
    const formattedKey = privateKey.replace(/\n/g, '\\\\n');

    const envContent = `# ============================================================================
# FIREBASE ADMIN (Backend en Frontend)
# ============================================================================

FIREBASE_PROJECT_ID=${projectId}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${projectId}

FIREBASE_CLIENT_EMAIL=${clientEmail}

# IMPORTANTE: En UNA SOLA LÍNEA con \\\\n (doble backslash)
FIREBASE_PRIVATE_KEY="${formattedKey}"

FIREBASE_DATABASE_URL=https://${projectId}.firebaseio.com

# ============================================================================
# FIREBASE CLIENT (Frontend) - RELLENA ESTOS VALORES MANUALMENTE SI FALTAN
# ============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIz...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${projectId}.firebaseapp.com
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${projectId}.firebasestorage.app

# ============================================================================
# BACKEND URL
# ============================================================================
NEXT_PUBLIC_API_URL=http://localhost:3001
`;

    fs.writeFileSync(OUTPUT_PATH, envContent);

    console.log('✅ ¡Éxito! Archivo generado: web/.env.local.generated');
    console.log('📋 Instrucciones:');
    console.log('1. Abre web/.env.local.generated');
    console.log('2. Copia su contenido');
    console.log('3. Reemplaza el contenido de web/.env.local');
    console.log('4. Rellena las variables NEXT_PUBLIC_... que falten');

} catch (error) {
    console.error('❌ Error procesando el archivo:', error);
}
