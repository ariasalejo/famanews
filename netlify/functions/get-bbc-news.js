// netlify/functions/get-bbc-news.js

const RSSParser = require('rss-parser');
const parser = new RSSParser();

const feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml';

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { /* ... */ };
  }

  try {
    const feed = await parser.parseURL(feedUrl);
    
    const noticias = feed.items.map(item => {
      // 1. Extraer imagen del contenido HTML con regex mejorado
      const contenido = item.content || item.description || '';
      const imagenMatch = contenido.match(/<img[^>]+src=["']([^"']+)["']/i);
      let imagenUrl = imagenMatch ? imagenMatch[1] : '';
      
      // 2. Corregir URLs relativas y protocolo-http
      if (imagenUrl) {
        if (imagenUrl.startsWith('//')) {
          imagenUrl = `https:${imagenUrl}`;  // URLs tipo //ichef.bbci.co.uk/...
        } else if (imagenUrl.startsWith('/')) {
          imagenUrl = `https://www.bbc.com${imagenUrl}`;
        }
      }

      // 3. Prioridad de fuentes de imagen
      const imagenFinal = imagenUrl ||
                         item.enclosure?.url ||
                         item['media:content']?.url ||
                         'https://via.placeholder.com/300';

      console.log('Imagen procesada:', imagenFinal);

      return {
        titulo: item.title,
        link: item.link,
        fecha: item.pubDate,
        contenidoCorto: item.contentSnippet,
        imagenUrl: imagenFinal
      };
    });

    return { /* ... */ };

  } catch (error) { /* ... */ }
};