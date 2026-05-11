/**
 * Category Filter Web Component
 * Allows filtering expenses by category
 */
class CategoryFilter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._categories = [];
    this._selectedCategory = null;
  }

  static get observedAttributes() {
    return ['selected-category'];
  }

  connectedCallback() {
    this.render();
    this.loadCategories();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'selected-category') {
      this._selectedCategory = newValue ? parseInt(newValue) : null;
      this.render();
    }
  }

  /**
   * Load categories from API
   */
  async loadCategories() {
    try {
      const response = await fetch('/api/categories');
      this._categories = await response.json();
      this.render();
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  /**
   * Handle category selection
   * @param {number|null} categoryId - Selected category ID or null for all
   */
  selectCategory(categoryId) {
    this._selectedCategory = categoryId;
    if (categoryId === null) {
      this.removeAttribute('selected-category');
    } else {
      this.setAttribute('selected-category', categoryId);
    }
    
    this.dispatchEvent(new CustomEvent('category-change', {
      bubbles: true,
      detail: { categoryId }
    }));
    
    this.render();
  }

  /**
   * Render component
   */
  render() {
    const categoryButtons = this._categories.map(cat => `
      <button 
        class="category-btn ${this._selectedCategory === cat.id ? 'active' : ''}"
        data-id="${cat.id}"
        style="--category-color: ${cat.color}"
      >
        <span class="color-indicator" style="background-color: ${cat.color}"></span>
        ${cat.name}
      </button>
    `).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 20px;
        }

        .filter-container {
          background: #fff;
          border-radius: 8px;
          padding: 15px 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .filter-title {
          font-size: 0.9rem;
          color: #7f8c8d;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 2px solid #eee;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          color: #555;
        }

        .category-btn:hover {
          border-color: var(--category-color);
          background-color: #f8f9fa;
        }

        .category-btn.active {
          border-color: var(--category-color);
          background-color: var(--category-color);
          color: white;
        }

        .color-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .category-btn.active .color-indicator {
          background-color: white !important;
        }

        @media (max-width: 480px) {
          .category-buttons {
            gap: 6px;
          }

          .category-btn {
            padding: 6px 10px;
            font-size: 0.85rem;
          }
        }
      </style>

      <div class="filter-container">
        <div class="filter-title">Filter by Category</div>
        <div class="category-buttons">
          <button 
            class="category-btn ${this._selectedCategory === null ? 'active' : ''}"
            data-id="all"
          >
            <span class="color-indicator" style="background-color: #95a5a6"></span>
            All
          </button>
          ${categoryButtons}
        </div>
      </div>
    `;

    // Attach event listeners
    this.shadowRoot.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.selectCategory(id === 'all' ? null : parseInt(id));
      });
    });
  }
}

customElements.define('category-filter', CategoryFilter);
