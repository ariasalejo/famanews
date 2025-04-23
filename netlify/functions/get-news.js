// netlify/functions/get-news.js
const fetch = require('node-fetch');

// Configuración de feeds con respaldo alternativo
const FEEDS = {
  deportes: [
    "http://www.espn.com/espn/rss/news",
    "https://feeds.bbci.co.uk/sport/rss.xml" // Backup
  ],
  tecnologia: [
    "http://feeds.feedburner.com/TechCrunch/",
    "https://www.theverge.com/rss/index.xml" // Backup
  ],
  politica: [
    "https://www.politico.com/rss/politicopicks.xml",
    "https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/politics/rss.xml" // Backup
  ],
  medioambiente: [
    "https://grist.org/feed/",
    "https://www.greenpeace.org/international/publication/rss/" // Backup
  ],
  entretenimiento: [
    "https://variety.com/feed/",
    "https://www.hollywoodreporter.com/feed/" // Backup
  ]
};

// Tiempo máximo de espera para cada request (8 segundos)
const TIMEOUT = 8000;

exports.handler = async (event) => {
  const category = event.queryStringParameters?.category;
  
  // Validar categoría
  if (!FEEDS[category]) {
