const RSSParser = require('rss-parser');
const parser = new RSSParser();

const feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml';

exports.handler = async function (event, context) {
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

    // Obtener parámetros de paginación
    const page = parseInt(event.queryStringParameters?.page || '1', 10);
    const pageSize = 10; // Número de noticias por página
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // Procesar noticias
    const noticias = feed.items.map(item => {
      let imagenUrl = '';

      // Priorizar media:thumbnail
      if (item['media:thumbnail']?.url) {
        imagenUrl = item['media:thumbnail'].url;
      } 
      // Intentar con enclosure.url
      else if (item.enclosure?.url) {
        imagenUrl = item.enclosure.url;
      } 
      // Extraer imagen del contenido HTML
      else if (item.content || item.description) {
        const contenido = item.content || item.description;
        const imagenMatch = contenido.match(/<img[^>]+src=["']([^"']+)["']/i);
        imagenUrl = imagenMatch ? imagenMatch[1] : '';
      }

      // Corregir URLs relativas o sin protocolo
      if (imagenUrl.startsWith('//')) {
        imagenUrl = `https:${imagenUrl}`;
      } else if (imagenUrl.startsWith('/')) {
        imagenUrl = `https://www.bbc.com${imagenUrl}`;
      }

      // Usar marcador de posición si no hay imagen válida
      if (!imagenUrl || !imagenUrl.startsWith('http')) {
        imagenUrl = 'https://via.placeholder.com/300';
      }

      // Log para depuración
      console.log('Imagen procesada:', imagenUrl);

      return {
        titulo: item.title || 'Sin título',
        link: item.link || '#',
        fecha: item.pubDate || 'Fecha no disponible',
        contenidoCorto: item.contentSnippet || 'Contenido no disponible',
        imagenUrl,
      };
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