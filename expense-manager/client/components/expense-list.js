/**
 * Expense List Web Component
 * Displays a paginated list of expenses with edit/delete functionality
 */
class ExpenseList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.expenses = [];
    this.pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
    this.currentFilter = null;
  }

  static get observedAttributes() {
    return ['filter-category'];
  }

  connectedCallback() {
    this.render();
    this.loadExpenses();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'filter-category') {
      this.currentFilter = newValue ? parseInt(newValue) : null;
      this.pagination.page = 1;
      this.loadExpenses();
    }
  }

  async loadExpenses() {
    try {
      let url = `/api/expenses?page=${this.pagination.page}&limit=${this.pagination.limit}`;
      
      if (this.currentFilter) {
        url += `&category=${this.currentFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      this.expenses = data.data;
      this.pagination = data.pagination;
      
      this.renderList();
      this.renderPagination();
    } catch (error) {
      console.error('Error loading expenses:', error);
      this.showError('Error al cargar los gastos');
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .list-container {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .list-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .expense-count {
          font-size: 0.9rem;
          color: #7f8c8d;
        }
        
        .expense-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .expense-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #ecf0f1;
          transition: background-color 0.3s;
        }
        
        .expense-item:last-child {
          border-bottom: none;
        }
        
        .expense-item:hover {
          background-color: #f8f9fa;
        }
        
        .expense-info {
          flex: 1;
        }
        
        .expense-amount {
          font-size: 1.2rem;
          font-weight: 700;
          color: #e74c3c;
        }
        
        .expense-description {
          font-size: 0.95rem;
          color: #2c3e50;
          margin: 4px 0;
        }
        
        .expense-meta {
          display: flex;
          gap: 12px;
          font-size: 0.85rem;
          color: #7f8c8d;
        }
        
        .category-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
        }
        
        .expense-actions {
          display: flex;
          gap: 8px;
        }
        
        .btn-action {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        
        .btn-edit {
          background: #3498db;
          color: white;
        }
        
        .btn-edit:hover {
          background: #2980b9;
        }
        
        .btn-delete {
          background: #e74c3c;
          color: white;
        }
        
        .btn-delete:hover {
          background: #c0392b;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        .pagination button {
          padding: 8px 16px;
          border: 2px solid #3498db;
          background: white;
          color: #3498db;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .pagination button:hover:not(:disabled) {
          background: #3498db;
          color: white;
        }
        
        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination button.active {
          background: #3498db;
          color: white;
        }
        
        .page-info {
          font-size: 0.9rem;
          color: #7f8c8d;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #7f8c8d;
        }
        
        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        
        .error-message {
          text-align: center;
          padding: 20px;
          color: #e74c3c;
        }
        
        @media (max-width: 600px) {
          .expense-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .expense-actions {
            width: 100%;
          }
          
          .expense-actions button {
            flex: 1;
          }
          
          .list-container {
            padding: 16px;
          }
        }
      </style>
      
      <div class="list-container">
        <div class="list-header">
          <h2 class="list-title">Lista de Gastos</h2>
          <span class="expense-count" id="expenseCount">0 gastos</span>
        </div>
        
        <ul class="expense-list" id="expenseList">
          <!-- Expenses will be rendered here -->
        </ul>
        
        <div class="pagination" id="pagination">
          <!-- Pagination will be rendered here -->
        </div>
      </div>
    `;
  }

  renderList() {
    const listEl = this.shadowRoot.getElementById('expenseList');
    const countEl = this.shadowRoot.getElementById('expenseCount');
    
    countEl.textContent = `${this.pagination.total} gastos`;
    
    if (this.expenses.length === 0) {
      listEl.innerHTML = `
        <li class="empty-state">
          <div class="empty-state-icon">📝</div>
          <p>No hay gastos registrados</p>
          <p style="font-size: 0.9rem;">¡Agrega tu primer gasto!</p>
        </li>
      `;
      return;
    }
    
    listEl.innerHTML = this.expenses.map(expense => `
      <li class="expense-item" data-id="${expense.id}">
        <div class="expense-info">
          <div class="expense-amount">$${parseFloat(expense.amount).toFixed(2)}</div>
          <div class="expense-description">${this.escapeHtml(expense.description)}</div>
          <div class="expense-meta">
            <span class="category-badge" style="background-color: ${expense.category_color}">
              ${expense.category_name}
            </span>
            <span>📅 ${this.formatDate(expense.date)}</span>
          </div>
        </div>
        <div class="expense-actions">
          <button class="btn-action btn-edit" data-action="edit" data-id="${expense.id}">
            ✏️ Editar
          </button>
          <button class="btn-action btn-delete" data-action="delete" data-id="${expense.id}">
            🗑️ Eliminar
          </button>
        </div>
      </li>
    `).join('');
    
    // Add event listeners
    listEl.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleEdit(e));
    });
    
    listEl.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleDelete(e));
    });
  }

  renderPagination() {
    const paginationEl = this.shadowRoot.getElementById('pagination');
    
    if (this.pagination.totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }
    
    const pages = this.getVisiblePages();
    
    paginationEl.innerHTML = `
      <button ${this.pagination.page === 1 ? 'disabled' : ''} data-page="prev">
        ← Anterior
      </button>
      ${pages.map(page => 
        page === '...' 
          ? '<span class="page-info">...</span>'
          : `<button class="${page === this.pagination.page ? 'active' : ''}" data-page="${page}">${page}</button>`
      ).join('')}
      <button ${this.pagination.page === this.pagination.totalPages ? 'disabled' : ''} data-page="next">
        Siguiente →
      </button>
    `;
    
    paginationEl.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => this.handlePageChange(e));
    });
  }

  getVisiblePages() {
    const { page, totalPages } = this.pagination;
    const delta = 2;
    const range = [];
    
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    
    const pages = [1];
    
    if (page - delta > 2) {
      pages.push('...');
    }
    
    pages.push(...range);
    
    if (page + delta < totalPages - 1) {
      pages.push('...');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return [...new Set(pages.filter(p => p !== page))];
  }

  handlePageChange(e) {
    const pageValue = e.target.dataset.page;
    
    if (pageValue === 'prev') {
      this.pagination.page = Math.max(1, this.pagination.page - 1);
    } else if (pageValue === 'next') {
      this.pagination.page = Math.min(this.pagination.totalPages, this.pagination.page + 1);
    } else {
      this.pagination.page = parseInt(pageValue);
    }
    
    this.loadExpenses();
  }

  handleEdit(e) {
    const expenseId = parseInt(e.target.dataset.id);
    const expense = this.expenses.find(exp => exp.id === expenseId);
    
    if (expense) {
      this.dispatchEvent(new CustomEvent('edit-expense', {
        detail: expense,
        bubbles: true,
        composed: true
      }));
    }
  }

  async handleDelete(e) {
    const expenseId = parseInt(e.target.dataset.id);
    
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el gasto');
      }
      
      this.dispatchEvent(new CustomEvent('notification', {
        detail: { message: 'Gasto eliminado', type: 'success' },
        bubbles: true,
        composed: true
      }));
      
      this.loadExpenses();
      
      // Dispatch event to update summary
      this.dispatchEvent(new CustomEvent('expenses-changed', {
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      this.dispatchEvent(new CustomEvent('notification', {
        detail: { message: error.message, type: 'error' },
        bubbles: true,
        composed: true
      }));
    }
  }

  showError(message) {
    const listEl = this.shadowRoot.getElementById('expenseList');
    listEl.innerHTML = `<li class="error-message">${message}</li>`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  refresh() {
    this.loadExpenses();
  }
}

customElements.define('expense-list', ExpenseList);
