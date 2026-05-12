class CategoryFilter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.categories = [];
  }

  connectedCallback() {
    this.loadCategories();
  }

  async loadCategories() {
    const res = await fetch('/api/categories');
    this.categories = await res.json();
    this.render();
  }

  handleFilter(e) {
    window.dispatchEvent(new CustomEvent('category-filtered', { detail: e.target.value }));
  }

  render() {
    const options = this.categories.map(c => 
      `<option value="${c.name}">${c.name}</option>`
    ).join('');

    this.shadowRoot.innerHTML = `
      <style>
        div { margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; }
        select { padding: 8px; border-radius: 4px; border: 1px solid #ddd; }
      </style>
      <div>
        <label>Filtrar por:</label>
        <select id="categorySelect">
          <option value="">Todas las categorías</option>
          ${options}
        </select>
      </div>
    `;
    
    this.shadowRoot.getElementById('categorySelect').addEventListener('change', this.handleFilter.bind(this));
  }
}

customElements.define('category-filter', CategoryFilter);
