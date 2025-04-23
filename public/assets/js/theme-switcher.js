// public/assets/js/theme-switcher.js
class ThemeSwitcher {
  constructor() {
    this.themeToggle = document.querySelector('.theme-toggle');
    this.themes = ['light', 'dark', 'system'];
    this.currentTheme = this.getSavedTheme() || this.getSystemTheme();
    this.init();
  }

  init() {
    this.setTheme(this.currentTheme);
    this.setupEventListeners();
    this.applyThemeOnLoad();
  }

  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  getSavedTheme() {
    return localStorage.getItem('theme');
  }

  setTheme(theme) {
    const validTheme = this.themes.includes(theme) ? theme : 'system';
    const actualTheme = validTheme === 'system' ? this.getSystemTheme() : validTheme;
    
    document.documentElement.setAttribute('data-theme', actualTheme);
    document.documentElement.classList.toggle('dark-mode', actualTheme === 'dark');
    localStorage.setItem('theme', validTheme);
    
    this.updateToggleButton(validTheme);
    this.dispatchThemeChangeEvent(actualTheme);
  }

  updateToggleButton(theme) {
    const icons = {
      system: '🌓',
      light: '🌞',
      dark: '🌙'
    };
    
    this.themeToggle.innerHTML = `
      ${icons[theme]}
      <span class="visually-hidden">Tema ${theme}</span>
    `;
    this.themeToggle.setAttribute('aria-label', `Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`);
  }

  applyThemeOnLoad() {
    document.documentElement.style.transition = 'none';
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.documentElement.style.transition = 'all 0.3s ease';
      }, 10);
    });
  }

  setupEventListeners() {
    // Botón de cambio de tema
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Detectar cambios en el tema del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (this.getSavedTheme() === 'system') {
        this.setTheme('system');
      }
    });
  }

  toggleTheme() {
    const current = this.getSavedTheme();
    const newTheme = current === 'dark' ? 'light' : 
                     current === 'light' ? 'system' : 'dark';
    this.setTheme(newTheme);
  }

  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('themeChanged', {
      detail: { theme }
    });
    document.dispatchEvent(event);
  }
}

// Inicialización con verificación de soporte
if ('querySelector' in document && 'addEventListener' in window) {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeSwitcher();
  });
}
