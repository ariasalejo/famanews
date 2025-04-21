// Datos de Noticias Virales (fake API)
const noticiasVirales = [
    {
        titulo: "🔞 VIDEO PROHIBIDO que Borraron de Twitter",
        imagen: "video-prohibido.jpg",
        shares: 23500
    },
    {
        titulo: "🤯 Este Niño de 12 Años es MILLONARIO en TikTok",
        imagen: "niño-tiktok.jpg",
        shares: 18400
    }
];

// Cargar Noticias Dinámicamente
function cargarNoticias() {
    const container = document.getElementById('noticias-container');
    
    noticiasVirales.forEach(noticia => {
        const html = `
            <article class="noticia-impactante">
                <img src="${noticia.imagen}" class="img-viral" alt="${noticia.titulo}">
                <h2>${noticia.titulo}</h2>
                <p>🔥 ${noticia.shares.toLocaleString()} Compartidos</p>
                <div class="botones-virales">
                    <button class="btn-compartir" onclick="compartir('whatsapp')">Compartir</button>
                </div>
            </article>
        `;
        container.innerHTML += html;
    });
}

// Función Compartir
function compartir(redSocial) {
    const mensaje = encodeURIComponent("¡Mira esto! 😱 " + document.title + " " + window.location.href);
    
    const redes = {
        whatsapp: `https://api.whatsapp.com/send?text=${mensaje}`,
        tiktok: `https://www.tiktok.com/share/item/?text=${mensaje}`
    };

    window.open(redes[redSocial], '_blank');
}

// Iniciar
document.addEventListener('DOMContentLoaded', cargarNoticias);
