// public/js/main.js

// Este script se ejecuta en el navegador del usuario.
// Es responsable de interactuar con el DOM (el HTML de la página)
// y de comunicarse con el servidor backend (en este caso, la Netlify Function) para obtener datos.

document.addEventListener('DOMContentLoaded', () => {
    // Obtiene los elementos HTML donde se mostrarán las noticias y los contadores.
    const gridNoticias = document.getElementById('gridNoticias');
    const contadorVistas = document.getElementById('vistas');
    const contadorCompartidos = document.getElementById('compartidos');

    // --- Función asíncrona para cargar y mostrar las noticias desde la Netlify Function ---
    async function cargarNoticias() {
        try {
            // Muestra mensajes de carga iniciales en el grid y los contadores
            gridNoticias.innerHTML = '<p>Cargando noticias de la BBC...</p>';
            if(contadorVistas) contadorVistas.textContent = '...';
            if(contadorCompartidos) contadorCompartidos.textContent = '...';

            // *** ¡ACTUALIZACIÓN CRUCIAL PARA NETLIFY FUNCTIONS! ***
            // Realiza la llamada al endpoint de la Netlify Function que obtiene el feed de la BBC.
            // La URL es /.netlify/functions/ + el nombre del archivo de tu función (sin .js)
            const response = await fetch('/.netlify/functions/get-bbc-news');

            // Verifica si la respuesta del servidor fue exitosa (código de estado 2xx)
            if (!response.ok) {
                // Si la respuesta no es OK, lanza un error con el estado HTTP y el mensaje de la respuesta si está disponible
                 const errorBody = await response.text(); // Intenta leer el cuerpo del error
                throw new Error(`HTTP error! status: ${response.status}. Body: ${errorBody.substring(0, 200)}...`); // Limita el cuerpo para evitar logs enormes
            }

            // Parsea el cuerpo de la respuesta como JSON para obtener el array de noticias
            const noticias = await response.json();

            // Limpia el contenido actual del grid (remueve el mensaje de carga)
            gridNoticias.innerHTML = '';

            // Verifica si se recibieron noticias
            if (!noticias || noticias.length === 0) {
                 // Si no hay noticias, muestra un mensaje indicándolo
                 gridNoticias.innerHTML = '<p>No se encontraron noticias en este momento.</p>';
                 // Reinicia o muestra 0 en los contadores fake si no hay noticias
                 if(contadorVistas) contadorVistas.textContent = '0';
                 if(contadorCompartidos) contadorCompartidos.textContent = '0';
                 return; // Sale de la función
            }

            // Itera sobre cada noticia recibida y crea su elemento HTML (la tarjeta)
            noticias.forEach(noticia => {
                const articleElement = document.createElement('article');
                articleElement.classList.add('noticia-viral'); // Agrega la clase CSS para estilizar

                // Formatea la fecha si está disponible en el formato deseado
                // Date(noticia.fecha) convierte la fecha del feed a un objeto Date.
                // toLocaleDateString() la formatea según la configuración regional del navegador.
                // Manejo de posible fecha inválida
                const fechaObj = new Date(noticia.fecha);
                const fecha = noticia.fecha && !isNaN(fechaObj) ? fechaObj.toLocaleDateString() : 'Fecha desconocida';


                // Construye el HTML interno de la tarjeta de noticias
                articleElement.innerHTML = `
                    <span class="badge-urgente">BBC News</span>
                    <h3 class="titulo-click">${noticia.titulo}</h3>
                    ${noticia.contenidoCorto ? `<p>${noticia.contenidoCorto}</p>` : ''}

                    ${noticia.imagenUrl ? // <-- Verifica si hay una URL de imagen
                        // Si hay imagenUrl, crea una etiqueta <img>
                        // Estilo inline básico para asegurar que la imagen se ajuste.
                        // Considera mover este estilo a styles.css para mayor limpieza.
                        `<img src="${noticia.imagenUrl}" alt="${noticia.titulo || 'Imagen de noticia'}" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem;">`
                        : '' // <-- Si no hay imagenUrl, no agrega la etiqueta <img>
                    }

                    <div class="stats-virales">
                        <span>🗓️ ${fecha}</span> </div>

                    <div class="botones-virales">
                        <a href="${noticia.link}" target="_blank" class="boton-compartir">
                            <i class="fas fa-external-link-alt"></i> Leer Noticia
                        </a>
                        <a href="#" class="boton-compartir" onclick="alert('Compartir en TikTok (funcionalidad no implementada)'); return false;"><i class="fab fa-tiktok"></i> TikTok</a>
                        <a href="#" class="boton-compartir" onclick="alert('Compartir en WhatsApp (funcionalidad no implementada)'); return false;"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    </div>
                `;

                // Agrega la tarjeta de noticia creada al contenedor principal en el HTML
                gridNoticias.appendChild(articleElement);
            });

            // Una vez que las noticias se han cargado, inicia o actualiza el contador fake global
             actualizarContadorFake();

        } catch (error) {
            // Si ocurre un error durante la carga o procesamiento
            console.error('Error al cargar las noticias:', error); // Log del error en la consola del navegador
            // Muestra un mensaje de error al usuario en el grid
            gridNoticias.innerHTML = `<p style="color: red;">Error al cargar las noticias: ${error.message}. Inténtalo de nuevo más tarde.</p>`;
            // Muestra indicadores de error en los contadores fake
            if(contadorVistas) contadorVistas.textContent = '???';
            if(contadorCompartidos) contadorCompartidos.textContent = '???';
        }
    }

    // --- Función para el contador fake (simula actividad) ---
    // Usa una variable global (window._contadorFakeInterval) para asegurarse de no
    // iniciar múltiples intervalos si la función se llama varias veces.
    function actualizarContadorFake() {
        // Solo inicia el intervalo si aún no ha sido iniciado
        if (!window._contadorFakeInterval) {
             let vistas = 2456789; // Valores iniciales (puedes ajustarlos)
             let compartidos = 156234;

             window._contadorFakeInterval = setInterval(() => {
                 vistas += Math.floor(Math.random() * 1000); // Incrementa vistas aleatoriamente
                 compartidos += Math.floor(Math.random() * 500); // Incrementa compartidos aleatoriamente
                 // Actualiza el texto en el DOM si los elementos existen
                 if(contadorVistas) contadorVistas.textContent = vistas.toLocaleString(); // toLocaleString añade comas
                 if(contadorCompartidos) contadorCompartidos.textContent = compartidos.toLocaleString();
             }, 3000); // Actualiza cada 3000 milisegundos (3 segundos)
        }
         // Llama a la función una vez al inicio para mostrar los valores iniciales inmediatamente
         if(contadorVistas) contadorVistas.textContent = (2456789).toLocaleString();
         if(contadorCompartidos) contadorCompartidos.textContent = (156234).toLocaleString();
    }

    // --- Registro del Service Worker (para caché u offline, opcional) ---
    // Asegúrate que tienes un archivo sw.js en la raíz de tu carpeta 'public'.
    // Si no lo necesitas o no tienes el archivo, puedes comentar o eliminar este bloque.
    if ('serviceWorker' in navigator) {
        // La ruta '/sw.js' es relativa a la raíz que sirve tu servidor Express (la carpeta public).
        // En Netlify, '/sw.js' buscará el archivo sw.js en la raíz del directorio publicado (public).
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch(error => {
                console.error('Fallo el registro del Service Worker:', error);
            });
    }

    // --- Inicialización ---
    // Ejecuta estas funciones cuando todo el contenido HTML (el DOM) esté cargado
    // sin esperar a que carguen las imágenes u otros recursos.
    cargarNoticias(); // Llama a la función para obtener y mostrar las noticias
    // actualizarContadorFake(); // Esta función ahora se llama dentro de cargarNoticias()
});
