const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

class GeminiService {
    constructor() {
        this.apiKey = config.google.apiKey || process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            console.warn('⚠️ Gemini API Key is missing!');
        } else {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        }
    }

    async analyzeMatch(matchData) {
        try {
            if (!this.model) {
                throw new Error('Gemini model not initialized. Check API Key.');
            }

            const prompt = `
                Actúa como un experto analista deportivo de apuestas (Parleys).
                Analiza el siguiente partido y dame una predicción corta y concisa:
                
                Datos del partido: ${JSON.stringify(matchData)}
                
                Formato de respuesta:
                - Ganador probable:
                - Probabilidad:
                - Razón clave:
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error in Gemini analysis:', error.message);
            return `Error: ${error.message}`;
        }
    }
}

module.exports = new GeminiService();
