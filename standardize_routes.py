import os
import re

directories = [
    'american-football',
    'baseball',
    'ice-hockey',
    'tennis',
    'nfl',
    'nhl'
]

base_path = 'web/app/api'

def process_file(file_path):
    if not os.path.exists(file_path):
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update Sync Trigger
    content = content.replace('/api/admin/sync/${SPORT_ID}', '/api/trigger/sofascore')
    content = content.replace('/api/admin/sync/nba', '/api/trigger/sofascore') # edge case
    
    # 2. Update Response Format
    # Find NextResponse.json(games, ...
    content = re.sub(r'NextResponse\.json\(games,', 'NextResponse.json({ events: games },', content)
    content = re.sub(r'NextResponse\.json\(transformedData,', 'NextResponse.json({ events: transformedData },', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Processed: {file_path}")

for dir in directories:
    process_file(os.path.join(base_path, dir, 'live', 'route.ts'))
    process_file(os.path.join(base_path, dir, 'scheduled', 'route.ts'))
