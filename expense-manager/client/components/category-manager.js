/**
 * Componente: Category Manager
 * Gestiona las categorías disponibles con sus colores
 */

class CategoryManager extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.categories = [];
  }

  static get observedAttributes() {
    return ['data-categories'];
  }

  connectedCallback() {
    this.render();
    this.loadCategories();
  }

  /**
   * Carga las categorías desde la API
   */
  async loadCategories() {
    try {
      const response = await fetch('/api/stats/categories');
      const result = await response.json();
      
      if (result.success) {
        this.categories = result.data;
        this.render();
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  /**
   * Renderiza el componente
   */
  render() {
    const styles = `
      <style>
        :host {
          display: block;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #bdc3c7;
        }
        
        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .category-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.75rem;
        }
        
        .category-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
          transition: transform 0.15s ease;
        }
        
        .category-item:hover {
          transform: translateX(4px);
        }
        
        .category-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .category-name {
          font-size: 0.9rem;
          color: #2c3e50;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          color: #7f8c8d;
        }
      </style>
    `;

    const content = this.categories.length > 0
      ? `
        <div class="card-header">
          <h2 class="card-title">📁 Categorías</h2>
        </div>
        <div class="category-list">
          ${this.categories.map(cat => `
            <div class="category-item">
              <span class="category-color" style="background-color: ${cat.color}"></span>
              <span class="category-name">${this.escapeHtml(cat.name)}</span>
            </div>
          `).join('')}
        </div>
      `
      : `<div class="loading">Cargando categorías...</div>`;

    this.shadowRoot.innerHTML = styles + content;
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('category-manager', CategoryManager);
