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

// Función para realizar fetch con timeout
const fetchWithTimeout = (url, options) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), TIMEOUT)
    )
  ]);
};

exports.handler = async (event) => {
  const category = event.queryStringParameters?.category;

  // Validar categoría
  if (!FEEDS[category]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Categoría inválida. Usa una categoría válida." })
    };
  }

  const urls = FEEDS[category];
  let response;

  // Intentar obtener noticias de las URLs configuradas
  for (const url of urls) {
    try {
      response = await fetchWithTimeout(url);
      if (response.ok) {
        const data = await response.text();
        return {
          statusCode: 200,
          body: data
        };
      }
    } catch (error) {
      console.error(`Error al obtener datos del feed: ${url}`, error);
    }
  }

  // Si todas las URLs fallan
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "No se pudieron obtener noticias de las fuentes configuradas." })
  };
};
