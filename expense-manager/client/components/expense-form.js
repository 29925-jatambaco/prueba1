/**
 * Componente: Expense Form
 * Formulario para crear y editar gastos con validación en tiempo real
 */

class ExpenseForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.categories = [];
    this.editingId = null;
    this.formData = {
      description: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0]
    };
    this.errors = {};
  }

  connectedCallback() {
    this.render();
    this.loadCategories();
    this.setupEventListeners();
    
    // Escuchar eventos de edición desde otros componentes
    document.addEventListener('expense-edit', (e) => this.handleEdit(e));
    document.addEventListener('expense-form-reset', () => this.resetForm());
  }

  disconnectedCallback() {
    document.removeEventListener('expense-edit', this.handleEdit);
    document.removeEventListener('expense-form-reset', this.resetForm);
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
        this.setupEventListeners();
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      this.showNotification('Error al cargar categorías', 'error');
    }
  }

  /**
   * Configura los listeners del formulario
   */
  setupEventListeners() {
    const form = this.shadowRoot.querySelector('#expense-form');
    if (!form) return;

    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => this.validateField(e.target));
      input.addEventListener('blur', (e) => this.validateField(e.target));
    });
  }

  /**
   * Valida un campo específico
   */
  validateField(input) {
    const name = input.name;
    const value = input.value.trim();
    
    delete this.errors[name];

    switch (name) {
      case 'description':
        if (value.length === 0) {
          this.errors[name] = 'La descripción es requerida';
        } else if (value.length > 255) {
          this.errors[name] = 'Máximo 255 caracteres';
        }
        break;
        
      case 'amount':
        const numValue = parseFloat(value);
        if (value.length === 0) {
          this.errors[name] = 'El monto es requerido';
        } else if (isNaN(numValue) || numValue <= 0) {
          this.errors[name] = 'Debe ser un número mayor a 0';
        }
        break;
        
      case 'categoryId':
        if (!value) {
          this.errors[name] = 'Selecciona una categoría';
        }
        break;
        
      case 'date':
        if (!value) {
          this.errors[name] = 'La fecha es requerida';
        }
        break;
    }

    this.render();
    this.setupEventListeners();
  }

  /**
   * Maneja el envío del formulario
   */
  async handleSubmit(e) {
    e.preventDefault();
    
    // Validar todos los campos
    const inputs = this.shadowRoot.querySelectorAll('input, select');
    inputs.forEach(input => this.validateField(input));

    if (Object.keys(this.errors).length > 0) {
      this.showNotification('Por favor corrige los errores', 'error');
      return;
    }

    const payload = {
      description: this.formData.description.trim(),
      amount: parseFloat(this.formData.amount),
      categoryId: parseInt(this.formData.categoryId, 10),
      date: this.formData.date
    };

    try {
      this.toggleLoading(true);
      
      let response;
      if (this.editingId) {
        // Actualizar gasto existente
        response = await fetch(`/api/expenses/${this.editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Crear nuevo gasto
        response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();

      if (result.success) {
        this.showNotification(
          this.editingId ? 'Gasto actualizado correctamente' : 'Gasto creado exitosamente',
          'success'
        );
        
        // Notificar a otros componentes que recarguen datos
        document.dispatchEvent(new CustomEvent('expenses-updated'));
        
        this.resetForm();
      } else {
        this.showNotification(result.message || 'Error al guardar el gasto', 'error');
      }
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      this.showNotification('Error de conexión con el servidor', 'error');
    } finally {
      this.toggleLoading(false);
    }
  }

  /**
   * Maneja la edición de un gasto
   */
  handleEdit(e) {
    const expense = e.detail;
    this.editingId = expense.id;
    this.formData = {
      description: expense.description,
      amount: expense.amount.toString(),
      categoryId: expense.category_id.toString(),
      date: expense.date
    };
    
    this.render();
    this.setupEventListeners();
    
    // Scroll al formulario
    this.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Resetea el formulario
   */
  resetForm() {
    this.editingId = null;
    this.formData = {
      description: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0]
    };
    this.errors = {};
    this.render();
    this.setupEventListeners();
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
   * Muestra/oculta loading overlay
   */
  toggleLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.toggle('hidden', !show);
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
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 500;
          color: #2c3e50;
        }
        
        .form-input,
        .form-select {
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid #bdc3c7;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        
        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }
        
        .form-input.error {
          border-color: #e74c3c;
        }
        
        .form-error {
          color: #e74c3c;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .btn-primary {
          background-color: #3498db;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #2980b9;
        }
        
        .btn-secondary {
          background-color: #ecf0f1;
          color: #2c3e50;
          border: 1px solid #bdc3c7;
        }
        
        .btn-secondary:hover {
          background-color: #bdc3c7;
        }
        
        .form-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        
        .editing-badge {
          background: #f39c12;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
        }
      </style>
    `;

    const content = `
      <div class="card-header">
        <h2 class="card-title">${this.editingId ? '✏️ Editar Gasto' : '➕ Nuevo Gasto'}</h2>
        ${this.editingId ? '<span class="editing-badge">Editando</span>' : ''}
      </div>
      
      <form id="expense-form">
        <div class="form-group">
          <label class="form-label" for="description">Descripción</label>
          <input
            type="text"
            id="description"
            name="description"
            class="form-input ${this.errors.description ? 'error' : ''}"
            placeholder="Ej: Compra en supermercado"
            value="${this.escapeHtml(this.formData.description)}"
            maxlength="255"
          />
          ${this.errors.description ? `<div class="form-error">${this.errors.description}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label class="form-label" for="amount">Monto ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            class="form-input ${this.errors.amount ? 'error' : ''}"
            placeholder="0.00"
            value="${this.formData.amount}"
            step="0.01"
            min="0.01"
          />
          ${this.errors.amount ? `<div class="form-error">${this.errors.amount}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label class="form-label" for="categoryId">Categoría</label>
          <select
            id="categoryId"
            name="categoryId"
            class="form-select ${this.errors.categoryId ? 'error' : ''}"
          >
            <option value="">Seleccionar categoría</option>
            ${this.categories.map(cat => `
              <option value="${cat.id}" ${cat.id.toString() === this.formData.categoryId ? 'selected' : ''}>
                ${this.escapeHtml(cat.name)}
              </option>
            `).join('')}
          </select>
          ${this.errors.categoryId ? `<div class="form-error">${this.errors.categoryId}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label class="form-label" for="date">Fecha</label>
          <input
            type="date"
            id="date"
            name="date"
            class="form-input ${this.errors.date ? 'error' : ''}"
            value="${this.formData.date}"
          />
          ${this.errors.date ? `<div class="form-error">${this.errors.date}</div>` : ''}
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            ${this.editingId ? 'Actualizar' : 'Guardar'} Gasto
          </button>
          ${this.editingId ? `
            <button type="button" class="btn btn-secondary" id="cancel-edit">
              Cancelar
            </button>
          ` : ''}
        </div>
      </form>
    `;

    this.shadowRoot.innerHTML = styles + content;

    // Listener para cancelar edición
    const cancelBtn = this.shadowRoot.querySelector('#cancel-edit');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.resetForm());
    }
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

customElements.define('expense-form', ExpenseForm);
