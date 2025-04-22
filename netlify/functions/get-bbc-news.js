// netlify/functions/get-bbc-news.js

const RSSParser = require('rss-parser');

// Configurar parser con namespaces personalizados
const parser = new RSSParser({
  customFields: {
    item: [
      ['media:thumbnail', 'media:thumbnail', { keepArray: true }],
      ['media:content', 'media:content', { keepArray: true }]
    ]
  }
});

const feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml';

exports.handler = async function(event, context) {
  // ... (manejo de OPTIONS igual que antes)

  try {
    const feed = await parser.parseURL(feedUrl);
    
    const noticias = feed.items.map(item => {
      // 1. Obtener imagen principal de BBC
      const imagenBBC = item.media:thumbnail?.$?.url ||  // Imagen destacada
                       item.media:content?.$?.url ||     // Contenido multimedia
                       item.enclosure?.url;             // Adjuntos

      // 2. Extraer de HTML como respaldo
      const contenido = item.content || item.description || '';
      const imagenHTML = contenido.match(/<img[^>]+src=["']([^"']*?\.(?:jpg|png|jpeg))["']/i)?.[1] || '';

      // 3. Procesar URLs
      let imagenFinal = imagenBBC || imagenHTML;
      
      if (imagenFinal) {
        // Corregir protocolo y rutas
        imagenFinal = imagenFinal.replace(/^\/\//, 'https://')
                                .replace(/^\/news\//, 'https://www.bbc.com/news/');
      }

      return {
        titulo: item.title,
        link: item.link,
        fecha: item.pubDate,
        contenidoCorto: item.contentSnippet,
        imagenUrl: imagenFinal || 'https://via.placeholder.com/300' // Último fallback
      };
    });

    // ... (respuesta igual que antes)

  } catch (error) { /* ... */ }
};