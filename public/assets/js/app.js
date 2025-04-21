class ViralNews {
    constructor() {
        this.newsContainer = document.getElementById('content');
        this.init();
    }

    async init() {
        await this.loadNews();
        this.setupIntersectionObserver();
        this.addSocialListeners();
    }

    async loadNews() {
        try {
            // Simular API
            const fakeNews = await this.fetchFakeNews();
            this.renderNews(fakeNews);
        } catch (error) {
            console.error('Error cargando noticias:', error);
        }
    }

    async fetchFakeNews() {
        return [
            {
                title: "🔞 VIDEO PROHIBIDO que Borraron de TikTok",
                views: "2.5M",
                shares: "45K",
                image: "viral-1.webp"
            },
            {
                title: "🤯 Este Niño de 12 Años es MILLONARIO en YouTube",
                views: "1.8M",
                shares: "32K",
                image: "viral-2.webp"
            }
        ];
    }

    renderNews(news) {
        this.newsContainer.innerHTML = news.map(item => `
            <article class="noticia-viral">
                <div class="badge-viral">🔥 TRENDING</div>
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="contenido">
                    <h3>${item.title}</h3>
                    <div class="stats">
                        <span>👁️ ${item.views}</span>
                        <span>📌 ${item.shares}</span>
                    </div>
                    <div class="social-buttons">
                        <button class="btn-share" data-platform="whatsapp">WhatsApp</button>
                        <button class="btn-share" data-platform="tiktok">TikTok</button>
                    </div>
                </div>
            </article>
        `).join('');
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.noticia-viral').forEach(item => {
            observer.observe(item);
        });
    }

    addSocialListeners() {
        document.querySelectorAll('.btn-share').forEach(button => {
            button.addEventListener('click', (e) => {
                const platform = e.target.dataset.platform;
                this.shareContent(platform);
            });
        });
    }

    shareContent(platform) {
        const currentNews = document.querySelector('.noticia-viral:hover');
        const title = currentNews?.querySelector('h3')?.textContent || document.title;
        const url = window.location.href;
        
        const shareUrls = {
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
            tiktok: `https://www.tiktok.com/share/item/?text=${encodeURIComponent(title)}`
        };

        window.open(shareUrls[platform], '_blank');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new ViralNews();
});
