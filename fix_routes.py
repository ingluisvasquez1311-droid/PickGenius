import os
import re

base_dir = r'c:\Users\Daniel\PickGenius\web\app\api'
target_files = []

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file == 'route.ts':
            target_files.append(os.path.join(root, file))

print(f"Encontrados {len(target_files)} archivos de ruta.")

for file_path in target_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Saltarse archivos que ya usan firebaseReadService correctamente y no tienen el error
        if 'new FirebaseReadService()' not in content and 'import FirebaseReadService' not in content:
            continue
            
        print(f"Procesando: {file_path}")
        
        # 1. Corregir import
        # Antes: import FirebaseReadService from '@/lib/FirebaseReadService';
        # Después: import { firebaseReadService } from '@/lib/FirebaseReadService';
        content = re.sub(
            r"import\s+FirebaseReadService\s+from\s+'@/lib/FirebaseReadService';",
            "import { firebaseReadService } from '@/lib/FirebaseReadService';",
            content
        )
        # Soporte para minúsculas en el path si existiera
        content = re.sub(
            r"import\s+FirebaseReadService\s+from\s+'@/lib/firebaseReadService';",
            "import { firebaseReadService } from '@/lib/FirebaseReadService';",
            content
        )

        # 2. Corregir instanciación
        # Antes: const firebaseService = new FirebaseReadService();
        # Después: (nada, usamos firebaseReadService directamente)
        content = re.sub(
            r"const\s+firebaseService\s+=\s+new\s+FirebaseReadService\(\);",
            "",
            content
        )

        # 3. Corregir llamadas a métodos
        # Antes: firebaseService.hasRecentData(...)
        # Después: firebaseReadService.hasRecentData(...)
        content = content.replace("firebaseService.", "firebaseReadService.")
        
        # 4. Limpieza final de líneas vacías si quedaron dobles por el remove
        content = content.replace("\n\n\n", "\n\n")

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Error procesando {file_path}: {e}")

print("✅ Proceso completado.")
