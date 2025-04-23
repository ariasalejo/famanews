// news-loader.js
class NewsLoader {
    constructor() {
        this.categories = [
            'deportes', 
            'tecnologia', 
            'politica', 
            'medioambiente', 
            'entretenimiento'
        ];
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupIntersectionObserver();
            this.loadInitialNews();
            this.setupEventListeners();
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const category = entry.target.id;
                    this.loadNews(category);
                }
            });
        }, { threshold: 0.1 });

        this.categories.forEach(category => {
            const element = document.getElementById(`${category}-news`);
            if (element) observer.observe(element);
        });
    }

    async loadNews(category) {
        const container = document.getElementById(`${category}-news`);
        if (!container || container.dataset.loaded) return;

        this.showLoader();
        container.dataset.loaded = true;

        try {
            const response = await fetch(`/.netlify/functions/get-news?category=${category}`);
            if (!response.ok) throw new Error(response.statusText);
            
            const xmlData = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlData, "text/xml");
            
            this.renderNews(xmlDoc, container);
        } catch (error) {
            this.showError(category, error);
        } finally {
            this.hideLoader();
        }
    }

    renderNews(xmlDoc, container) {
        const items = xmlDoc.getElementsByTagName('item');
        container.innerHTML = Array.from(items).slice(0, 6).map(item => {
            const title = this.sanitizeText(item.getElementsByTagName('title')[0]?.textContent);
            const link = item.getElementsByTagName('link')[0]?.textContent || '#';
            const description = this.sanitizeText(item.getElementsByTagName('description')[0]?.textContent);
            const pubDate = new Date(item.getElementsByTagName('pubDate')[0]?.textContent).toLocaleDateString();

            return `
                <article class="news-card">
                    <div class="news-content">
                        <h3 class="news-title">
                            <a href="${link}" class="news-link" target="_blank" rel="noopener">${title}</a>
                        </h3>
                        <p class="news-description">${description}</p>
                        <div class="news-meta">
                            <span>${pubDate}</span>
                            <span>Fuente: ${this.getSourceName(link)}</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    getSourceName(url) {
        const domains = {
            'bbc.com': 'BBC',
            'nytimes.com': 'NY Times',
            'reuters.com': 'Reuters',
            'techcrunch.com': 'TechCrunch',
            'espn.com': 'ESPN'
        };
        
        const domain = new URL(url).hostname.replace('www.', '');
        return domains[domain] || 'Fuente';
    }

    sanitizeText(text) {
        return text?.replace(/<[^>]*>?/gm, '') || '';
    }

    showLoader() {
        document.querySelector('.loader-container').style.display = 'flex';
    }

    hideLoader() {
        document.querySelector('.loader-container').style.display = 'none';
    }

    showError(category, error) {
        const container = document.getElementById(`${category}-news`);
        container.innerHTML = `
            <div class="error-message">
                ❌ Error al cargar noticias de ${category}: ${error.message}
                <button onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }

    setupEventListeners() {
        // Scroll para mostrar botón de subir
        window.addEventListener('scroll', () => {
            const button = document.querySelector('.back-to-top');
            button.classList.toggle('visible', window.scrollY > 1000);
        });

        // Navegación suave
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }

    loadInitialNews() {
        this.loadNews(this.categories[0]);
    }
}

// Inicializar
new NewsLoader();
