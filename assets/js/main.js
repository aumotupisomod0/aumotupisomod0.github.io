// 主应用逻辑
class QuotesApp {
  constructor() {
    this.currentLang = 'en';
    this.translations = {};
    this.quotesData = {};
    this.quoteListEl = null;
    this.searchInputEl = null;
    this.langSelectEl = null;
    
    this.init();
  }

  async init() {
    await this.loadTranslations();
    await this.loadQuotesData();
    await this.loadCommonComponents();
    this.setupEventListeners();
    
    // 只在首页显示引用
    if (this.quoteListEl) {
      this.displayQuotes(this.quotesData[this.currentLang]);
    }
    
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

  async loadQuotesData() {
    try {
      // 由于quotes-data.js已经定义了quotesData变量，我们直接使用它
      if (typeof quotesData !== 'undefined') {
        this.quotesData = quotesData;
      } else {
        console.error('Quotes data not loaded');
      }
    } catch (error) {
      console.error('Error loading quotes data:', error);
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
        
        // 修正导航链接的路径（确保指向正确的路径）
        const homeLink = headerContainer.querySelector('a[data-i18n="nav.home"]');
        const aboutLink = headerContainer.querySelector('a[data-i18n="nav.about"]');
        const sponsorsLink = headerContainer.querySelector('a[data-i18n="nav.sponsors"]');
        
        if (homeLink) homeLink.href = 'index.html';
        if (aboutLink) aboutLink.href = 'about.html';
        if (sponsorsLink) sponsorsLink.href = 'sponsors/index.html';
      }

      // 加载页脚
      const footerResponse = await fetch('./common/footer.html');
      const footerHtml = await footerResponse.text();
      const footerContainer = document.querySelector('.footer-container');
      if (footerContainer) {
        footerContainer.innerHTML = footerHtml;
      }

      // 重新获取元素引用
      this.quoteListEl = document.getElementById('quoteList');
      this.searchInputEl = document.getElementById('searchInput');
      this.langSelectEl = document.getElementById('langSelect');
    } catch (error) {
      console.error('Error loading common components:', error);
    }
  }

  setupEventListeners() {
    if (this.searchInputEl) {
      this.searchInputEl.addEventListener('input', () => this.filterQuotes());
    }

    if (this.langSelectEl) {
      this.langSelectEl.addEventListener('change', (e) => {
        this.currentLang = e.target.value;
        if (this.quoteListEl && this.searchInputEl) {
          this.filterQuotes();
          this.searchInputEl.value = '';
        }
        this.updateTexts();
      });
    }
  }

  displayQuotes(list) {
    if (!this.quoteListEl) return;
    
    this.quoteListEl.innerHTML = '';
    if (list.length === 0) {
      const noQuotesText = this.getTranslation('no_quotes_found');
      this.quoteListEl.innerHTML = `<li>${noQuotesText}</li>`;
      return;
    }
    
    for (const q of list) {
      const li = document.createElement('li');
      li.textContent = q.text;
      const authorDiv = document.createElement('div');
      authorDiv.className = 'author';
      authorDiv.textContent = q.author;
      li.appendChild(authorDiv);
      this.quoteListEl.appendChild(li);
    }
  }

  filterQuotes() {
    if (!this.searchInputEl || !this.quoteListEl) return;
    
    const keyword = this.searchInputEl.value.trim().toLowerCase();
    if (!keyword) {
      this.displayQuotes(this.quotesData[this.currentLang]);
      return;
    }
    
    const filtered = this.quotesData[this.currentLang].filter(q =>
      q.text.toLowerCase().includes(keyword) || 
      q.author.toLowerCase().includes(keyword)
    );
    this.displayQuotes(filtered);
  }

  getTranslation(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // 返回原始key如果翻译不存在
      }
    }
    
    return typeof value === 'string' ? value : key;
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
  new QuotesApp();
});
