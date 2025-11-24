import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from google.cloud import firestore
from datetime import datetime
import json
import os
import glob

# Configuración de la página
st.set_page_config(
    page_title="Tirens Parleys Dashboard",
    page_icon="🏀⚽",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Inicializar Firestore
@st.cache_resource
def get_db():
    try:
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "firebase-credentials.json"
        return firestore.Client()
    except Exception:
        return None

db = get_db()

# Sidebar
st.sidebar.title("🏀⚽ Tirens Parleys")
sport = st.sidebar.radio("Selecciona Deporte", ["NBA", "Fútbol"])

# --- FUNCIONES AUXILIARES ---
def process_football_row(row):
    """Lógica simplificada para procesar fila de CSV en memoria"""
    try:
        home_goals = int(row.get('FTHG', 0))
        away_goals = int(row.get('FTAG', 0))
        total_goals = home_goals + away_goals
        
        return {
            'date': row.get('Date'),
            'homeTeam': row.get('HomeTeam'),
            'awayTeam': row.get('AwayTeam'),
            'league': row.get('Div', 'Unknown'), # Mapeo simple
            'homeGoals': home_goals,
            'awayGoals': away_goals,
            'totalGoals': total_goals,
            'totalCorners': int(row.get('HC', 0)) + int(row.get('AC', 0)),
            'totalShots': int(row.get('HS', 0)) + int(row.get('AS', 0)),
            'bothTeamsScored': home_goals > 0 and away_goals > 0,
            'result': 'H' if home_goals > away_goals else ('A' if away_goals > home_goals else 'D')
        }
    except:
        return None

# --- FUNCIONES NBA ---
def load_nba_data():
    if not db: return pd.DataFrame()
    
    collections = [
        'nba_regular_season_box_scores_2010_2024_part_3',
        'nba_regular_season_box_scores_2024_25'
    ]
    
    all_data = []
    try:
        for col_name in collections:
            docs = db.collection(col_name).stream()
            for doc in docs:
                data = doc.to_dict()
                data['collection'] = col_name
                all_data.append(data)
    except Exception as e:
        st.error(f"Error leyendo Firestore: {e}")
            
    return pd.DataFrame(all_data)

def render_nba_dashboard():
    st.title("🏀 NBA Data Monitor")
    
    if st.sidebar.button("🔄 Recargar Datos NBA"):
        st.cache_data.clear()
        st.rerun()

    with st.spinner('Cargando datos NBA...'):
        df = load_nba_data()

    if df.empty:
        st.warning("No hay datos de NBA disponibles en Firestore.")
        return

    # KPIs
    col1, col2, col3, col4 = st.columns(4)
    with col1: st.metric("Total Registros", len(df))
    with col2: st.metric("Equipos", df['teamTricode'].nunique() if 'teamTricode' in df.columns else 0)
    with col3: st.metric("Partidos", df['gameId'].nunique() if 'gameId' in df.columns else 0)
    with col4: st.metric("Temporadas", df['season_year'].nunique() if 'season_year' in df.columns else 0)

    # Gráficos
    c1, c2 = st.columns(2)
    with c1:
        if 'teamTricode' in df.columns:
            team_counts = df['teamTricode'].value_counts().reset_index()
            team_counts.columns = ['Equipo', 'Registros']
            st.plotly_chart(px.bar(team_counts, x='Equipo', y='Registros', title="Registros por Equipo"), use_container_width=True)
    with c2:
        if 'season_year' in df.columns:
            season_counts = df['season_year'].value_counts().reset_index()
            season_counts.columns = ['Temporada', 'Registros']
            st.plotly_chart(px.pie(season_counts, values='Registros', names='Temporada', title="Por Temporada"), use_container_width=True)

    st.dataframe(df.head(100), use_container_width=True)

# --- FUNCIONES FÚTBOL ---
def load_football_data(source='firestore'):
    if source == 'firestore' and db:
        try:
            docs = db.collection('football_matches').stream()
            data = [doc.to_dict() for doc in docs]
            return pd.DataFrame(data)
        except Exception:
            return pd.DataFrame()
    else:
        # Modo Local CSV
        all_files = glob.glob("data/football/*_2425.csv")
        data = []
        league_map = {'SP1': 'La Liga', 'E0': 'Premier League', 'I1': 'Serie A', 'D1': 'Bundesliga', 'F1': 'Ligue 1'}
        
        for f in all_files:
            try:
                temp_df = pd.read_csv(f)
                # Determinar liga por nombre de archivo
                filename = os.path.basename(f)
                league_code = filename.split('_')[0]
                league_name = league_map.get(league_code, league_code)
                
                for _, row in temp_df.iterrows():
                    processed = process_football_row(row)
                    if processed:
                        processed['league'] = league_name
                        data.append(processed)
            except Exception as e:
                print(f"Error leyendo {f}: {e}")
                
        return pd.DataFrame(data)

def render_football_dashboard():
    st.title("⚽ Fútbol Analytics")
    
    # Selector de Fuente de Datos
    data_source = st.sidebar.selectbox(
        "Fuente de Datos", 
        ["Firestore (Nube)", "CSV Local (Backup)"],
        index=1 # Default a Local por el error de cuota
    )
    
    if st.sidebar.button("🔄 Recargar Datos Fútbol"):
        st.cache_data.clear()
        st.rerun()

    with st.spinner(f'Cargando datos de Fútbol desde {data_source}...'):
        source_key = 'firestore' if "Firestore" in data_source else 'local'
        df = load_football_data(source_key)

    if df.empty:
        if source_key == 'firestore':
            st.warning("⚠️ No hay datos en Firestore (posiblemente por límite de cuota). Cambia a **CSV Local** en el menú lateral.")
        else:
            st.warning("No se encontraron archivos CSV en data/football.")
        return

    if source_key == 'local':
        st.info("ℹ️ Modo Local Activo: Leyendo directamente de archivos CSV (Bypass de cuota Firestore)")

    # Filtros
    leagues = ['Todas'] + sorted(df['league'].unique().tolist()) if 'league' in df.columns else ['Todas']
    selected_league = st.selectbox("Filtrar por Liga", leagues)
    
    if selected_league != 'Todas':
        df = df[df['league'] == selected_league]

    # KPIs
    st.subheader("📈 Métricas Clave")
    k1, k2, k3, k4 = st.columns(4)
    
    total = len(df)
    avg_goals = df['totalGoals'].mean()
    avg_corners = df['totalCorners'].mean()
    btts = (df['bothTeamsScored'].sum() / total * 100)

    with k1: st.metric("Partidos", total)
    with k2: st.metric("Goles/Partido", f"{avg_goals:.2f}")
    with k3: st.metric("Corners/Partido", f"{avg_corners:.2f}")
    with k4: st.metric("Ambos Marcan", f"{btts:.1f}%")

    # Tabs
    tab1, tab2, tab3 = st.tabs(["Goles", "Corners & Tiros", "Resultados"])
    
    with tab1:
        c1, c2 = st.columns(2)
        with c1:
            overs = {
                'Over 1.5': (df['totalGoals'] > 1.5).mean() * 100,
                'Over 2.5': (df['totalGoals'] > 2.5).mean() * 100,
                'Over 3.5': (df['totalGoals'] > 3.5).mean() * 100
            }
            st.plotly_chart(px.bar(x=list(overs.keys()), y=list(overs.values()), title="Probabilidad Over Goles (%)", color=list(overs.values()), color_continuous_scale='Greens'), use_container_width=True)
        with c2:
            st.plotly_chart(px.histogram(df, x='totalGoals', title="Distribución de Goles", nbins=10), use_container_width=True)

    with tab2:
        c1, c2 = st.columns(2)
        with c1:
            st.plotly_chart(px.scatter(df, x='totalShots', y='totalCorners', color='league', title="Correlación Tiros vs Corners"), use_container_width=True)
        with c2:
            if selected_league == 'Todas':
                avg_league = df.groupby('league')[['totalCorners', 'totalShots']].mean().reset_index()
                st.plotly_chart(px.bar(avg_league, x='league', y=['totalCorners', 'totalShots'], barmode='group', title="Promedios por Liga"), use_container_width=True)

    with tab3:
        res_counts = df['result'].value_counts()
        st.plotly_chart(px.pie(values=res_counts.values, names=res_counts.index, title="Resultados (H=Local, D=Empate, A=Visitante)", color_discrete_map={'H':'#1f77b4', 'D':'#ff7f0e', 'A':'#2ca02c'}), use_container_width=True)

    st.subheader("📋 Detalle de Partidos")
    st.dataframe(df.sort_values('date', ascending=False).head(100), use_container_width=True)

# --- MAIN ---
if sport == "NBA":
    render_nba_dashboard()
else:
    render_football_dashboard()

# Footer
st.sidebar.markdown("---")
st.sidebar.caption(f"Tirens Parleys v2.0 | {datetime.now().strftime('%H:%M')}")
