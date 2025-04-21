document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/noticias')
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById('noticias-container');
      contenedor.innerHTML = '';

      data.forEach(noticia => {
        const div = document.createElement('div');
        div.classList.add('noticia');
        div.innerHTML = `
          <h3>${noticia.titulo}</h3>
          <img src="${noticia.imagen}" alt="Imagen noticia">
          <p>${noticia.descripcion}</p>
          <span>👁️ ${noticia.vistas} vistas</span>
          <span>📤 ${noticia.compartidos} compartidos</span>
        `;
        contenedor.appendChild(div);
      });
    })
    .catch(err => console.error('Error cargando noticias:', err));
});
