/**
 * Category Filter Web Component
 * Allows filtering expenses by category
 */
class CategoryFilter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.categories = [];
    this.selectedCategory = null;
  }

  connectedCallback() {
    this.render();
    this.loadCategories();
  }

  async loadCategories() {
    try {
      const response = await fetch('/api/categories');
      this.categories = await response.json();
      this.renderFilters();
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .filter-container {
          background: #fff;
          border-radius: 12px;
          padding: 20px 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }
        
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .filter-title {
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .clear-filter {
          font-size: 0.85rem;
          color: #3498db;
          cursor: pointer;
          text-decoration: underline;
        }
        
        .clear-filter:hover {
          color: #2980b9;
        }
        
        .filter-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 2px solid transparent;
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          background: #f8f9fa;
          color: #2c3e50;
        }
        
        .filter-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .filter-chip.active {
          border-color: currentColor;
          transform: scale(1.05);
        }
        
        .chip-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .all-categories {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        
        @media (max-width: 600px) {
          .filter-container {
            padding: 16px;
          }
          
          .filter-list {
            gap: 8px;
          }
          
          .filter-chip {
            padding: 6px 12px;
            font-size: 0.85rem;
          }
        }
      </style>
      
      <div class="filter-container">
        <div class="filter-header">
          <h3 class="filter-title">Filtrar por Categoría</h3>
          <span class="clear-filter" id="clearFilter" style="display: none;">Limpiar filtro</span>
        </div>
        <div class="filter-list" id="filterList">
          <!-- Filter chips will be rendered here -->
        </div>
      </div>
    `;
  }

  renderFilters() {
    const filterList = this.shadowRoot.getElementById('filterList');
    const clearFilter = this.shadowRoot.getElementById('clearFilter');
    
    // "All Categories" chip
    const allChip = document.createElement('div');
    allChip.className = `filter-chip all-categories ${this.selectedCategory === null ? 'active' : ''}`;
    allChip.innerHTML = `
      <span>📊 Todas</span>
    `;
    allChip.addEventListener('click', () => this.selectCategory(null));
    filterList.appendChild(allChip);
    
    // Category chips
    this.categories.forEach(cat => {
      const chip = document.createElement('div');
      chip.className = `filter-chip ${this.selectedCategory === cat.id ? 'active' : ''}`;
      chip.style.color = cat.color;
      chip.innerHTML = `
        <div class="chip-color" style="background-color: ${cat.color}"></div>
        <span>${cat.name}</span>
      `;
      chip.addEventListener('click', () => this.selectCategory(cat.id));
      filterList.appendChild(chip);
    });
    
    // Show/hide clear filter button
    clearFilter.style.display = this.selectedCategory !== null ? 'block' : 'none';
    clearFilter.addEventListener('click', () => this.selectCategory(null));
  }

  selectCategory(categoryId) {
    this.selectedCategory = categoryId;
    
    this.dispatchEvent(new CustomEvent('category-filter', {
      detail: { categoryId },
      bubbles: true,
      composed: true
    }));
    
    this.renderFilters();
  }
}

customElements.define('category-filter', CategoryFilter);
