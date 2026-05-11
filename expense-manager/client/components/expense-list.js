/**
 * Expense List Web Component
 * Displays a paginated list of expenses with edit/delete functionality
 */
class ExpenseList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._expenses = [];
    this._pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
    this._loading = false;
    this._categoryFilter = null;
  }

  static get observedAttributes() {
    return ['category-filter'];
  }

  connectedCallback() {
    this.render();
    this.loadExpenses();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'category-filter') {
      this._categoryFilter = newValue ? parseInt(newValue) : null;
      this._pagination.page = 1;
      this.loadExpenses();
    }
  }

  /**
   * Load expenses from API
   */
  async loadExpenses() {
    this._loading = true;
    this.render();

    try {
      const params = new URLSearchParams({
        page: this._pagination.page,
        limit: this._pagination.limit
      });

      if (this._categoryFilter) {
        params.append('category', this._categoryFilter);
      }

      const response = await fetch(`/api/expenses?${params}`);
      const data = await response.json();
      
      this._expenses = data.data;
      this._pagination = data.pagination;
      
      this.render();
    } catch (error) {
      console.error('Failed to load expenses:', error);
      this._loading = false;
      this.render();
    }
  }

  /**
   * Handle pagination
   * @param {number} page - Page number
   */
  goToPage(page) {
    if (page < 1 || page > this._pagination.totalPages) return;
    this._pagination.page = page;
    this.loadExpenses();
  }

  /**
   * Edit expense
   * @param {number} id - Expense ID
   */
  editExpense(id) {
    this.dispatchEvent(new CustomEvent('edit-expense', {
      bubbles: true,
      detail: { id }
    }));
  }

  /**
   * Delete expense
   * @param {number} id - Expense ID
   */
  async deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.dispatchEvent(new CustomEvent('expense-deleted', {
          bubbles: true,
          detail: { success: true }
        }));
        this.loadExpenses();
      } else {
        alert('Failed to delete expense');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete expense');
    }
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date
   * @param {string} dateStr - Date string
   * @returns {string} Formatted date string
   */
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Render component
   */
  render() {
    const expensesHtml = this._loading 
      ? '<div class="loading">Loading...</div>'
      : this._expenses.length === 0
        ? '<div class="empty-state">No expenses found. Add your first expense!</div>'
        : this._expenses.map(expense => `
            <div class="expense-item" style="border-left-color: ${expense.category_color}">
              <div class="expense-info">
                <div class="expense-amount">${this.formatCurrency(expense.amount)}</div>
                <div class="expense-category" style="background-color: ${expense.category_color}">${expense.category_name}</div>
                <div class="expense-date">${this.formatDate(expense.date)}</div>
                ${expense.description ? `<div class="expense-description">${this.escapeHtml(expense.description)}</div>` : ''}
              </div>
              <div class="expense-actions">
                <button class="btn-edit" aria-label="Edit expense" data-id="${expense.id}">✏️</button>
                <button class="btn-delete" aria-label="Delete expense" data-id="${expense.id}">🗑️</button>
              </div>
            </div>
          `).join('');

    const paginationHtml = this._pagination.totalPages > 1 ? `
      <div class="pagination">
        <button class="btn-page" ?disabled=${this._pagination.page === 1}>← Prev</button>
        <span class="page-info">Page ${this._pagination.page} of ${this._pagination.totalPages}</span>
        <button class="btn-page" ?disabled=${this._pagination.page === this._pagination.totalPages}>Next →</button>
      </div>
    ` : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 20px;
        }

        h2 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .expense-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #eee;
          border-left: 4px solid;
          transition: background-color 0.2s;
        }

        .expense-item:hover {
          background-color: #f8f9fa;
        }

        .expense-item:last-child {
          border-bottom: none;
        }

        .expense-info {
          flex: 1;
        }

        .expense-amount {
          font-size: 1.25rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .expense-category {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          color: white;
          margin-top: 5px;
        }

        .expense-date {
          font-size: 0.85rem;
          color: #7f8c8d;
          margin-top: 5px;
        }

        .expense-description {
          font-size: 0.9rem;
          color: #555;
          margin-top: 5px;
          max-width: 400px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .expense-actions {
          display: flex;
          gap: 8px;
        }

        .btn-edit, .btn-delete {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.2s, background-color 0.2s;
        }

        .btn-edit {
          background-color: #f39c12;
        }

        .btn-edit:hover {
          background-color: #e67e22;
          transform: scale(1.05);
        }

        .btn-delete {
          background-color: #e74c3c;
        }

        .btn-delete:hover {
          background-color: #c0392b;
          transform: scale(1.05);
        }

        .loading, .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #7f8c8d;
        }

        .empty-state {
          font-style: italic;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .btn-page {
          padding: 8px 16px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-page:hover:not([disabled]) {
          background-color: #2980b9;
        }

        .btn-page[disabled] {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }

        .page-info {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        @media (max-width: 480px) {
          .expense-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .expense-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .expense-description {
            max-width: 100%;
            white-space: normal;
          }
        }
      </style>

      <h2>Expenses</h2>
      
      <div class="expense-list">
        ${expensesHtml}
      </div>

      ${paginationHtml}
    `;

    // Attach event listeners
    this.shadowRoot.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => this.editExpense(parseInt(btn.dataset.id)));
    });

    this.shadowRoot.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => this.deleteExpense(parseInt(btn.dataset.id)));
    });

    const pageButtons = this.shadowRoot.querySelectorAll('.btn-page');
    if (pageButtons.length === 2) {
      pageButtons[0].addEventListener('click', () => this.goToPage(this._pagination.page - 1));
      pageButtons[1].addEventListener('click', () => this.goToPage(this._pagination.page + 1));
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Refresh the expense list
   */
  refresh() {
    this.loadExpenses();
  }
}

customElements.define('expense-list', ExpenseList);
