// netlify/functions/get-bbc-news.js

const RSSParser = require('rss-parser');
const parser = new RSSParser();

const feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml';

exports.handler = async function(event, context) {
  console.log(`[Function] Recibida petición para obtener feed de: ${feedUrl}`);

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ''
    };
  }

  try {
    const feed = await parser.parseURL(feedUrl);
    console.log(`[Function] Feed obtenido. Items: ${feed.items.length}`);

    const noticias = feed.items.map(item => {
      // Extraer imagen del contenido HTML
      const contenido = item.content || item.description || '';
      const imagenFromContent = contenido.match(/<img[^>]+src="([^">]+)"/)?.[1] || '';
      
      // Convertir URLs relativas a absolutas si es necesario
      const imagenUrlRelativa = imagenFromContent.startsWith('/') 
        ? `https://www.bbc.com${imagenFromContent}` 
        : imagenFromContent;

      // Orden de prioridad para imágenes
      const imagenUrl = item.enclosure?.url ||
                       item['media:content']?.url ||
                       item['media:thumbnail']?.url ||
                       imagenUrlRelativa || // Usamos la URL convertida
                       item.itunes?.image?.href ||
                       'https://via.placeholder.com/300';

      console.log('Imagen detectada:', imagenUrl); // Para depuración

      return {
        titulo: item.title,
        link: item.link,
        fecha: item.pubDate,
        contenidoCorto: item.contentSnippet,
        imagenUrl: imagenUrl
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(noticias)
    };

  } catch (error) {
    console.error('[Function] Error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: 'Error cargando noticias',
        details: error.message
      })
    };
  }
};