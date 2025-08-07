// About页面的简化逻辑
class AboutApp {
  constructor() {
    this.currentLang = 'en';
    this.translations = {};
    this.langSelectEl = null;
    
    this.init();
  }

  async init() {
    await this.loadTranslations();
    await this.loadCommonComponents();
    this.setupEventListeners();
    this.updateTexts();
  }

  async loadTranslations() {
    try {
      const response = await fetch('./locales/translations.json');
      this.translations = await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  async loadCommonComponents() {
    try {
      // 加载头部
      const headerResponse = await fetch('./common/header.html');
      const headerHtml = await headerResponse.text();
      const headerContainer = document.querySelector('.header-container');
      if (headerContainer) {
        headerContainer.innerHTML = headerHtml;
      }

      // 加载页脚
      const footerResponse = await fetch('./common/footer.html');
      const footerHtml = await footerResponse.text();
      const footerContainer = document.querySelector('.footer-container');
      if (footerContainer) {
        footerContainer.innerHTML = footerHtml;
      }

      // 重新获取元素引用
      this.langSelectEl = document.getElementById('langSelect');
    } catch (error) {
      console.error('Error loading common components:', error);
    }
  }

  setupEventListeners() {
    if (this.langSelectEl) {
      this.langSelectEl.addEventListener('change', (e) => {
        this.currentLang = e.target.value;
        this.updateTexts();
      });
    }
  }

  getTranslation(key) {
    return this.translations[this.currentLang] && this.translations[this.currentLang][key] 
      ? this.translations[this.currentLang][key] 
      : key;
  }

  updateTexts() {
    // 更新带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.getTranslation(key);
      el.textContent = translation;
    });

    // 更新占位符文本
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.getTranslation(key);
      el.setAttribute('placeholder', translation);
    });

    // 更新aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const translation = this.getTranslation(key);
      el.setAttribute('aria-label', translation);
    });
  }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new AboutApp();
});
