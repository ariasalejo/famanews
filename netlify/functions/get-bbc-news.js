// netlify/functions/get-bbc-news.js

// Importa la librería para leer feeds RSS/Atom (debe estar en tus dependencias del package.json principal)
const RSSParser = require('rss-parser');
const parser = new RSSParser();

// URL del feed RSS de BBC News
const feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml';

// --- El handler es la función principal que Netlify ejecutará en respuesta a la petición HTTP ---
// 'event' contiene información sobre la petición (path, headers, etc.)
// 'context' contiene información sobre el entorno de ejecución de la función
exports.handler = async function(event, context) {
  console.log(`[Function] Recibida petición para obtener feed de: ${feedUrl}`); // Log para depuración en el log de Netlify

  // Permitir peticiones OPTIONS (preflight) si es necesario (aunque el header CORS abajo suele bastar)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Permite cualquier origen
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ''
    };
  }

  try {
    // Obtiene el feed de la URL y lo parsea automáticamente
    const feed = await parser.parseURL(feedUrl);

    console.log(`[Function] Feed obtenido y parseado. Número de ítems: ${feed.items.length}`); // Log

    // Mapea los ítems del feed a un formato más simple y busca URLs de imágenes
    const noticias = feed.items.map(item => {
      const imagenUrl = item.enclosure?.url
                        || item['media:content']?.url
                        || item.itunes?.image?.href
                        || null;

      return {
        titulo: item.title,
        link: item.link,
        fecha: item.pubDate,
        contenidoCorto: item.contentSnippet,
        // contenidoHtml: item.content, // Opcional si lo necesitas en el frontend
        imagenUrl: imagenUrl
      };
    });

    // --- Formato de respuesta para Netlify Functions ---
    // La función debe devolver un objeto con statusCode, headers y body (el body debe ser una cadena)
    return {
      statusCode: 200, // Código de éxito HTTP
      headers: {
        "Content-Type": "application/json", // Indica que el contenido es JSON
        "Access-Control-Allow-Origin": "*" // **IMPORTANTE para CORS:** Permite que tu frontend en Netlify acceda a esta función. Puedes restringirlo a tu dominio de Netlify en producción.
      },
      body: JSON.stringify(noticias) // Convierte el array de noticias a una cadena JSON para el cuerpo de la respuesta
    };

  } catch (error) {
    console.error('[Function] Error al obtener o parsear el feed de la BBC:', error); // Log de error

    // --- Formato de respuesta de error para Netlify Functions ---
    return {
      statusCode: 500, // Código de error interno del servidor
      headers: {
         "Content-Type": "application/json",
         "Access-Control-Allow-Origin": "*" // También necesario en la respuesta de error para CORS
      },
      body: JSON.stringify({ // Envía un objeto JSON con detalles del error
        error: 'No se pudieron cargar las noticias en línea',
        details: error.message // Incluye el mensaje de error
      })
    };
  }
};
