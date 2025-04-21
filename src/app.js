// src/app.js

// Importa los módulos necesarios
const express = require('express');
const path = require('path');
const RSSParser = require('rss-parser'); // Para leer feeds RSS/Atom
const cors = require('cors'); // Middleware para permitir peticiones desde el frontend

// Crea una instancia de la aplicación express
const app = express();
// Define el puerto en el que se ejecutará el servidor
const port = process.env.PORT || 3000; // Usa el puerto de entorno si está disponible (para despliegue), sino 3000

// Crea una instancia del parser de RSS
const parser = new RSSParser();

// --- Middleware ---

// Middleware para permitir CORS (permite que el frontend acceda a la API, especialmente útil en desarrollo)
// En producción, podrías querer configurar CORS para permitir solo tu dominio específico.
app.use(cors());

// Middleware para servir archivos estáticos desde la carpeta 'public'
// Esto hace que cualquier archivo dentro de 'public' sea accesible directamente
// a través de la URL base de tu servidor (ej: http://localhost:3000/index.html, http://localhost:3000/css/styles.css)
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Rutas de la API ---

// Endpoint para obtener las noticias de la BBC
app.get('/api/noticias-bbc', async (req, res) => {
  // URL del feed RSS de BBC News (Este es el feed principal de noticias, puede haber otros feeds temáticos)
  const feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml';

  console.log(`Intentando obtener feed de: ${feedUrl}`); // Log para depuración en el servidor

  try {
    // Obtiene el feed de la URL y lo parsea automáticamente
    const feed = await parser.parseURL(feedUrl);

    console.log(`Feed obtenido y parseado. Número de ítems: ${feed.items.length}`); // Log

    // Mapea los ítems del feed a un formato más simple y busca URLs de imágenes
    const noticias = feed.items.map(item => {
      // Lógica para encontrar la URL de la imagen:
      // RSS feeds varían mucho en cómo incluyen imágenes. Intentamos varias ubicaciones comunes:
      // 1. item.enclosure: Usado para adjuntos, a veces incluye imágenes.
      // 2. item['media:content']: Usado en el namespace Media RSS, muy común para imágenes/videos.
      // 3. item.itunes?.image?.href: Menos común en noticias generales, más en podcasts, pero vale la pena revisar.
      // Puedes inspeccionar el XML del feed de la BBC directamente para ver la estructura exacta si necesitas más precisión.

      const imagenUrl = item.enclosure?.url // Intenta obtener URL del enclosure
                        || item['media:content']?.url // Intenta obtener URL de media:content
                        || item.itunes?.image?.href // Intenta obtener URL de itunes:image
                        || null; // Si no se encuentra en ninguna parte, la URL de imagen es null

      return {
        titulo: item.title,
        link: item.link, // Enlace a la noticia original
        fecha: item.pubDate, // Fecha de publicación
        contenidoCorto: item.contentSnippet, // Un resumen del contenido
        contenidoHtml: item.content, // Contenido completo (puede incluir HTML)
        imagenUrl: imagenUrl // La URL de la imagen encontrada (o null)
        // Otros campos interesantes del feed podrían ser item.author, item.categories, etc.
      };
    });

    // Envía el array de noticias en formato JSON como respuesta
    res.json(noticias);

  } catch (error) {
    console.error('Error al obtener o parsear el feed de la BBC:', error); // Log de error en el servidor
    // Envía una respuesta de error al cliente con un estado 500 (Error Interno del Servidor)
    res.status(500).json({
      error: 'No se pudieron cargar las noticias',
      details: error.message, // Incluye el mensaje de error para depuración (considera omitirlo en producción por seguridad)
      feedUrl: feedUrl // Incluye la URL del feed para saber cuál falló
    });
  }
});

// --- Inicio del Servidor ---

// Inicia el servidor y lo pone a escuchar en el puerto especificado
app.listen(port, () => {
  console.log(`🚀 Servidor FamaNews (BBC) corriendo en http://localhost:${port}`);
  console.log(`Sirviendo archivos estáticos desde: ${path.join(__dirname, '..', 'public')}`);
  console.log(`Endpoint de noticias: http://localhost:${port}/api/noticias-bbc`); // Muestra el endpoint de la API
});

console.log('Iniciando servidor...');
