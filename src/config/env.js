module.exports = {
  environment: process.env.NODE_ENV || 'production',
  google: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    apiKey: process.env.GEMINI_API_KEY,
  },
  apis: {
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro',
    nba: 'https://api.balldontlie.io/v1',
    football: 'https://api-football-v1.p.rapidapi.com/v3',
  },
  port: process.env.PORT || 3000,
};
