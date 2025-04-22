// netlify/functions/get-bbc-news.js
const RSSParser = require('rss-parser');

const parser = new RSSParser({
  customFields: {
    item: [
      ['media:thumbnail', 'mediaThumbnail'],
      ['media:content', 'mediaContent']
    ]
  }
});

exports.handler = async (event) => {
  // ... (manejo de OPTIONS previo)

  try {
    const feed = await parser.parseURL('http://feeds.bbci.co.uk/news/rss.xml');
    
    const noticias = feed.items.map(item => {
      // Extracción de imagen BBC
      const imagenBBC = item.mediaThumbnail?.$?.url || item.mediaContent?.$?.url;
      
      // Extracción desde HTML
      const imagenHTML = extractImageFromHTML(item.content || item.description);

      // Procesar URL
      let imagenFinal = procesarURL(imagenBBC || imagenHTML);

      // Fallback con servicio temporal
      if (!imagenFinal) {
        imagenFinal = `https://picsum.photos/300/200?random=${Math.random()}`; // Imagen aleatoria
      }

      return {
        titulo: item.title,
        link: item.link,
        fecha: item.pubDate,
        contenidoCorto: item.contentSnippet,
        imagenUrl: imagenFinal
      };
    });

    return { /* ... (respuesta previa) */ };

  } catch (error) { /* ... */ }
};

// Helpers (igual que antes)
const extractImageFromHTML = (html) => { /* ... */ };
const procesarURL = (url) => { /* ... */ };