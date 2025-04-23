import Parser from 'rss-parser';

const parser = new Parser();

/**
 * Sección 1: Configuración de feeds y categorías
 * Configura las URLs de los feeds RSS en las categorías deseadas.
 */
const FEEDS = {
  deportes: [
    "http://www.espn.com/espn/rss/news",
    "https://feeds.bbci.co.uk/sport/rss.xml"
  ],
  tecnologia: [
    "http://feeds.feedburner.com/TechCrunch/",
    "https://www.theverge.com/rss/index.xml"
  ],
  entretenimiento: [
    "https://www.hollywoodreporter.com/feed/",
    "https://www.rollingstone.com/music/music-news/feed/"
  ],
  salud: [
    "https://www.medicalnewstoday.com/rss",
    "https://rss.cnn.com/rss/cnn_health.rss"
  ],
  negocios: [
    "https://www.forbes.com/business/feed/",
    "https://www.reuters.com/business/rss"
  ]
};

/**
 * Sección 2: Manejo de parámetros y validación
 * Valida la categoría proporcionada en la consulta.
 */
export async function handler(event) {
  const category = event.queryStringParameters?.category;

  if (!category || !FEEDS[category]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Categoría inválida. Usa una categoría válida como 'deportes', 'tecnologia', 'entretenimiento', 'salud' o 'negocios'." })
    };
  }

  /**
   * Sección 3: Obtención de noticias desde el feed RSS
   * Intenta obtener las noticias de las URLs configuradas.
   */
  const urls = FEEDS[category];
  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);
      const articles = feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        image: item.enclosure?.url || item.media?.url || extractImageFromContent(item.content),
        description: item.contentSnippet || item.summary || item.description
      }));

      return {
        statusCode: 200,
        body: JSON.stringify(articles)
      };
    } catch (error) {
      console.error(`Error al procesar el feed: ${url}`, error);
    }
  }

  /**
   * Sección 4: Manejo de errores
   * Devuelve un error si no se pueden obtener noticias de los feeds configurados.
   */
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "No se pudieron obtener noticias de las fuentes configuradas." })
  };
}

/**
 * Función auxiliar: Extraer imagen desde el contenido HTML del feed.
 */
function extractImageFromContent(content) {
  const regex = /<img[^>]+src="([^">]+)"/i;
  const match = content?.match(regex);
  return match ? match[1] : null;
}