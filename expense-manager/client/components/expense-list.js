/**
 * Componente: Expense List
 * Lista de gastos con paginación, filtros y acciones CRUD
 */

class ExpenseList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.expenses = [];
    this.pagination = { total: 0, limit: 10, offset: 0 };
    this.filters = {
      startDate: '',
      endDate: '',
      categoryId: ''
    };
    this.categories = [];
    this.isLoading = false;
  }

  connectedCallback() {
    this.render();
    this.loadCategories();
    this.loadExpenses();
    
    // Escuchar evento de actualización desde otros componentes
    document.addEventListener('expenses-updated', () => {
      this.loadExpenses();
      document.dispatchEvent(new CustomEvent('stats-updated'));
    });
  }

  disconnectedCallback() {
    document.removeEventListener('expenses-updated', this.loadExpenses);
  }

  /**
   * Carga las categorías para los filtros
   */
  async loadCategories() {
    try {
      const response = await fetch('/api/stats/categories');
      const result = await response.json();
      
      if (result.success) {
        this.categories = result.data;
        this.render();
        this.setupEventListeners();
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  /**
   * Carga los gastos desde la API
   */
  async loadExpenses() {
    this.isLoading = true;
    this.render();

    try {
      const params = new URLSearchParams({
        limit: this.pagination.limit.toString(),
        offset: this.pagination.offset.toString()
      });

      if (this.filters.startDate) params.append('startDate', this.filters.startDate);
      if (this.filters.endDate) params.append('endDate', this.filters.endDate);
      if (this.filters.categoryId) params.append('categoryId', this.filters.categoryId);

      const response = await fetch(`/api/expenses?${params}`);
      const result = await response.json();

      if (result.success) {
        this.expenses = result.data;
        this.pagination = result.pagination;
      } else {
        this.expenses = [];
      }
    } catch (error) {
      console.error('Error al cargar gastos:', error);
      this.expenses = [];
    } finally {
      this.isLoading = false;
      this.render();
      this.setupEventListeners();
    }
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Filtros
    const filterForm = this.shadowRoot.querySelector('#filter-form');
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.pagination.offset = 0;
        this.loadExpenses();
      });
    }

    // Limpiar filtros
    const clearFiltersBtn = this.shadowRoot.querySelector('#clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.filters = { startDate: '', endDate: '', categoryId: '' };
        this.pagination.offset = 0;
        this.loadExpenses();
      });
    }

    // Paginación
    const prevBtn = this.shadowRoot.querySelector('#prev-page');
    const nextBtn = this.shadowRoot.querySelector('#next-page');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.pagination.offset > 0) {
          this.pagination.offset -= this.pagination.limit;
          this.loadExpenses();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.pagination.offset + this.pagination.limit < this.pagination.total) {
          this.pagination.offset += this.pagination.limit;
          this.loadExpenses();
        }
      });
    }

    // Acciones de edición y eliminación
    this.shadowRoot.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        this.editExpense(id);
      });
    });

    this.shadowRoot.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        this.deleteExpense(id);
      });
    });
  }

  /**
   * Edita un gasto
   */
  editExpense(id) {
    const expense = this.expenses.find(e => e.id === id);
    if (expense) {
      document.dispatchEvent(new CustomEvent('expense-edit', { detail: expense }));
    }
  }

  /**
   * Elimina un gasto con confirmación
   */
  async deleteExpense(id) {
    const confirmed = confirm('¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.');
    
    if (!confirmed) return;

    try {
      this.isLoading = true;
      this.render();

      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // Mostrar notificación
        this.showNotification('Gasto eliminado correctamente', 'success');
        
        // Recargar lista y estadísticas
        document.dispatchEvent(new CustomEvent('expenses-updated'));
      } else {
        this.showNotification(result.message || 'Error al eliminar el gasto', 'error');
        this.isLoading = false;
        this.render();
        this.setupEventListeners();
      }
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      this.showNotification('Error de conexión con el servidor', 'error');
      this.isLoading = false;
      this.render();
      this.setupEventListeners();
    }
  }

  /**
   * Muestra notificaciones
   */
  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    
    container.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 4000);
  }

  /**
   * Formatea una fecha a formato legible
   */
  formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Formatea un número como moneda
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .filter-form {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .filter-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #7f8c8d;
        }
        
        .form-input,
        .form-select {
          padding: 0.5rem;
          border: 1px solid #bdc3c7;
          border-radius: 6px;
          font-size: 0.9rem;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .btn-primary {
          background-color: #3498db;
          color: white;
        }
        
        .btn-secondary {
          background-color: #ecf0f1;
          color: #2c3e50;
          border: 1px solid #bdc3c7;
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table th,
        .data-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }
        
        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .data-table tr:hover {
          background: #f8f9fa;
        }
        
        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
        }
        
        .category-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #ecf0f1;
        }
        
        .pagination-info {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .pagination-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .loading,
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }
        
        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
          .data-table {
            font-size: 0.85rem;
          }
          
          .data-table th,
          .data-table td {
            padding: 0.5rem;
          }
          
          .filter-form {
            flex-direction: column;
          }
        }
      </style>
    `;

    const content = `
      <div class="card-header">
        <h2 class="card-title">📋 Lista de Gastos</h2>
      </div>
      
      <!-- Filtros -->
      <form id="filter-form" class="filter-form">
        <div class="filter-group">
          <label class="filter-label">Desde</label>
          <input
            type="date"
            name="startDate"
            class="form-input"
            value="${this.filters.startDate}"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Hasta</label>
          <input
            type="date"
            name="endDate"
            class="form-input"
            value="${this.filters.endDate}"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Categoría</label>
          <select name="categoryId" class="form-select">
            <option value="">Todas</option>
            ${this.categories.map(cat => `
              <option value="${cat.id}" ${cat.id.toString() === this.filters.categoryId ? 'selected' : ''}>
                ${this.escapeHtml(cat.name)}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="filter-group" style="justify-content: flex-end;">
          <button type="submit" class="btn btn-primary">Filtrar</button>
        </div>
        
        <div class="filter-group" style="justify-content: flex-end;">
          <button type="button" id="clear-filters" class="btn btn-secondary">Limpiar</button>
        </div>
      </form>
      
      <!-- Tabla de gastos -->
      ${this.isLoading 
        ? '<div class="loading"><div class="spinner"></div><p>Cargando gastos...</p></div>'
        : this.expenses.length > 0
          ? `
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.expenses.map(expense => `
                    <tr>
                      <td>${this.formatDate(expense.date)}</td>
                      <td>${this.escapeHtml(expense.description)}</td>
                      <td>
                        <span class="category-badge" style="background: ${expense.category_color}20">
                          <span class="category-dot" style="background: ${expense.category_color}"></span>
                          ${this.escapeHtml(expense.category_name)}
                        </span>
                      </td>
                      <td style="font-weight: 600; color: #e74c3c;">
                        ${this.formatCurrency(expense.amount)}
                      </td>
                      <td class="actions">
                        <button class="btn btn-sm btn-secondary btn-edit" data-id="${expense.id}">
                          ✏️
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${expense.id}">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <!-- Paginación -->
            <div class="pagination">
              <div class="pagination-info">
                Mostrando ${this.expenses.length} de ${this.pagination.total} gastos
              </div>
              <div class="pagination-buttons">
                <button 
                  id="prev-page" 
                  class="btn btn-secondary btn-sm" 
                  ${this.pagination.offset === 0 ? 'disabled' : ''}
                >
                  ← Anterior
                </button>
                <button 
                  id="next-page" 
                  class="btn btn-secondary btn-sm"
                  ${this.pagination.offset + this.pagination.limit >= this.pagination.total ? 'disabled' : ''}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          `
          : `
            <div class="empty-state">
              <div class="empty-state-icon">📭</div>
              <h3>No hay gastos registrados</h3>
              <p>Comienza agregando tu primer gasto usando el formulario.</p>
            </div>
          `
      }
    `;

    this.shadowRoot.innerHTML = styles + content;
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('expense-list', ExpenseList);
