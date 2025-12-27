import os
import re

base_dir = r'c:\Users\Daniel\PickGenius\web\app\api'
processed_count = 0

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file == 'route.ts':
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # 1. Normalizar FirebaseReadService
                # Cambiar imports de clase/default a instancia nombrada
                content = re.sub(
                    r"import\s+FirebaseReadService\s+from\s+'@/lib/FirebaseReadService';",
                    "import { firebaseReadService } from '@/lib/FirebaseReadService';",
                    content
                )
                
                # Quitar el 'new FirebaseReadService()' y usar la instancia directamente
                if 'new FirebaseReadService()' in content:
                    content = re.sub(
                        r"const\s+\w+\s+=\s+new\s+FirebaseReadService\(\);",
                        "",
                        content
                    )
                    # Cambiar referencias variables a la instancia global
                    # Asumiendo que se llamaba firebaseService o similar
                    content = content.replace("firebaseService.", "firebaseReadService.")
                
                # 2. Restaurar/Garantizar imports de Next.js
                uses_response = 'NextResponse' in content
                uses_request = 'NextRequest' in content
                
                # Limpiar cualquier import existente de next/server para reconstruirlo
                content = re.sub(r"import\s+\{[^}]*Next(Response|Request)[^}]*\}\s+from\s+'next/server';", "", content)
                content = re.sub(r"import\s+NextResponse\s+from\s+'next/server';", "", content)
                
                next_imports = []
                if uses_request: next_imports.append('NextRequest')
                if uses_response: next_imports.append('NextResponse')
                
                if next_imports:
                    import_line = f"import {{ {', '.join(next_imports)} }} from 'next/server';\n"
                    # Insertar al principio pero después de cualquier 'use' directiva (opcional)
                    content = import_line + content.strip()

                # 3. Limpieza de líneas vacías excesivas
                content = re.sub(r'\n{3,}', '\n\n', content)
                
                if content != original_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    processed_count += 1
                    
            except Exception as e:
                print(f"Error en {path}: {e}")

print(f"✅ Se han reparado {processed_count} archivos.")
