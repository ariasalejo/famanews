// netlify/functions/get-bbc-news.js
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  // 1. Configuración inicial
  const FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";
  const TIMEOUT_MS = 9000; // 9 segundos (antes del límite de 10s de Netlify)
  const USER_AGENT = "FamaNews/1.0 (+https://famanews.netlify.app)";

  try {
    // 2. Timeout automático
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout de ${TIMEOUT_MS}ms excedido`));
      }, TIMEOUT_MS);
    });

    // 3. Fetch con User-Agent y timeout
    const response = await Promise.race([
      fetch(FEED_URL, {
        headers: { "User-Agent": USER_AGENT },
        redirect: "follow",
      }),
      timeoutPromise,
    ]);

    // 4. Verificar respuesta HTTP
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status} - ${response.statusText}`);
    }

    // 5. Validar contenido XML
    const data = await response.text();
    if (!data.startsWith("<?xml") || !data.includes("<rss")) {
      throw new Error("Respuesta no es un XML/RSS válido");
    }

    // 6. Respuesta exitosa
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/rss+xml",
        "Access-Control-Allow-Origin": "*",
        "X-FamaNews-Cache": "60", // Caché de 1 minuto
      },
      body: data,
    };

  } catch (error) {
    // 7. Manejo centralizado de errores
    console.error(`[ERROR] ${error.message}`);
    
    return {
      statusCode: error.message.includes("Timeout") ? 504 : 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Error obteniendo el feed",
        details: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};