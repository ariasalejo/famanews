const RSSParser = require('rss-parser');
const parser = new RSSParser();

const feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml';

exports.handler = async function(event, context) {
  // Manejo de solicitudes OPTIONS para CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  try {
    // Parsear el feed RSS
    const feed = await parser.parseURL(feedUrl);

    // Obtener parámetros de paginación de la solicitud
    const page = parseInt(event.queryStringParameters?.page || '1', 10);
    const pageSize = 10; // Número de noticias por página
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // Mapear noticias y priorizar imágenes desde media:thumbnail
    const noticias = feed.items.map(item => {
      const titulo = item.title || 'Sin título';
      const link = item.link || '#';
      const fecha = item.pubDate || 'Fecha no disponible';
      const contenidoCorto = item.contentSnippet || 'Contenido no disponible';
      const imagenUrl = item['media:thumbnail']?.url || 'https://via.placeholder.com/300';

      return { titulo, link, fecha, contenidoCorto, imagenUrl };
    });

    // Aplicar paginación
    const noticiasPaginadas = noticias.slice(start, end);

    // Devolver el resultado
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=300', // Cache de 5 minutos
      },
      body: JSON.stringify(noticiasPaginadas),
    };

  } catch (error) {
    console.error('Error al procesar las noticias:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
};