import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al obtener la predicción');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>PickGenius AI</h1>
        <p>Predictor de Fútbol con Inteligencia Artificial</p>
      </header>

      <form className="search-form" onSubmit={handlePredict}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Pega el enlace de SofaScore aquí (ej. https://www.sofascore.com/...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="search-button" disabled={loading || !url}>
          {loading ? 'Analizando...' : 'Predecir'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <h3>Analizando Partido...</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Extrayendo H2H, forma reciente y remates totales con IA
          </p>
        </div>
      )}

      {result && result.prediction && (
        <div className="prediction-card">
          <div className="match-header">
            <div className="tournament">{result.match.tournament}</div>
            <div className="teams">
              {result.match.home} vs {result.match.away}
            </div>
          </div>

          <div className="prediction-body">
            <div className="pick-highlight">
              <div className="pick-title">Apuesta Recomendada (Value Bet)</div>
              <div className="pick-value">{result.prediction.pick}</div>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <span className="label">Cuota Sugerida</span>
                <span className="value">{result.prediction.cuota_estimada || '-'}</span>
              </div>
              <div className="stat-box">
                <span className="label">Valor</span>
                <span className={`value value-${result.prediction.valor?.toLowerCase()}`}>
                  {result.prediction.valor}
                </span>
              </div>
              <div className="stat-box">
                <span className="label">Riesgo</span>
                <span className={`value value-${result.prediction.riesgo?.toLowerCase()}`}>
                  {result.prediction.riesgo}
                </span>
              </div>
            </div>

            <div className="analysis-section">
              <h3>🧠 Análisis Táctico</h3>
              <p>{result.prediction.razonamiento}</p>
            </div>

            <div className="analysis-section key-stats">
              <h3>📊 Factores Clave</h3>
              <ul>
                {result.prediction.estadisticas_clave?.map((stat, i) => (
                  <li key={i}>{stat}</li>
                ))}
              </ul>
            </div>

            <div className="confidence-container">
              <div className="confidence-header">
                <span>Nivel de Confianza</span>
                <span>{result.prediction.confianza}%</span>
              </div>
              <div className="confidence-bar-bg">
                <div 
                  className="confidence-bar-fill" 
                  style={{ width: `${result.prediction.confianza}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
