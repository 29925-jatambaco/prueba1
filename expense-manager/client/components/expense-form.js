/**
 * Expense Form Web Component
 * Allows creating and editing expenses
 */
class ExpenseForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.editingId = null;
    this.categories = [];
  }

  static get observedAttributes() {
    return ['edit-mode'];
  }

  connectedCallback() {
    this.render();
    this.loadCategories();
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'edit-mode' && newValue === 'false') {
      this.editingId = null;
      this.resetForm();
    }
  }

  async loadCategories() {
    try {
      const response = await fetch('/api/categories');
      this.categories = await response.json();
      this.renderCategoryOptions();
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
        
        .form-container {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .form-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #555;
          font-size: 0.9rem;
        }
        
        input, select, textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box;
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 0.85rem;
          margin-top: 4px;
          display: none;
        }
        
        .error-message.visible {
          display: block;
        }
        
        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        
        button {
          flex: 1;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #2980b9, #1c6ea4);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }
        
        .btn-secondary {
          background: #ecf0f1;
          color: #2c3e50;
        }
        
        .btn-secondary:hover {
          background: #bdc3c7;
        }
        
        input.invalid, select.invalid, textarea.invalid {
          border-color: #e74c3c;
        }
        
        @media (max-width: 600px) {
          .form-container {
            padding: 16px;
          }
          
          .button-group {
            flex-direction: column;
          }
        }
      </style>
      
      <div class="form-container">
        <h2 class="form-title" id="formTitle">Nuevo Gasto</h2>
        
        <form id="expenseForm" novalidate>
          <div class="form-group">
            <label for="amount">Monto ($)</label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              step="0.01" 
              min="0.01" 
              required
              placeholder="0.00"
            >
            <span class="error-message" id="amountError">El monto debe ser mayor a 0</span>
          </div>
          
          <div class="form-group">
            <label for="category">Categoría</label>
            <select id="category" name="category" required>
              <option value="">Seleccionar categoría</option>
            </select>
            <span class="error-message" id="categoryError">La categoría es requerida</span>
          </div>
          
          <div class="form-group">
            <label for="date">Fecha</label>
            <input 
              type="date" 
              id="date" 
              name="date" 
              required
            >
            <span class="error-message" id="dateError">Fecha válida requerida</span>
          </div>
          
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea 
              id="description" 
              name="description" 
              maxlength="200"
              required
              placeholder="Describe el gasto..."
            ></textarea>
            <span class="error-message" id="descriptionError">Descripción requerida (máx 200 caracteres)</span>
          </div>
          
          <div class="button-group">
            <button type="submit" class="btn-primary" id="submitBtn">Guardar Gasto</button>
            <button type="button" class="btn-secondary" id="cancelBtn" style="display: none;">Cancelar</button>
          </div>
        </form>
      </div>
    `;
  }

  renderCategoryOptions() {
    const select = this.shadowRoot.getElementById('category');
    select.innerHTML = '<option value="">Seleccionar categoría</option>';
    
    this.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      option.style.color = cat.color;
      select.appendChild(option);
    });
  }

  setupEventListeners() {
    const form = this.shadowRoot.getElementById('expenseForm');
    const cancelBtn = this.shadowRoot.getElementById('cancelBtn');

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    cancelBtn.addEventListener('click', () => this.handleCancel());

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) {
          this.validateField(input);
        }
      });
    });
  }

  validateField(field) {
    const errorEl = this.shadowRoot.getElementById(`${field.id}Error`);
    let isValid = true;

    switch (field.id) {
      case 'amount':
        isValid = field.value && parseFloat(field.value) > 0;
        break;
      case 'category':
        isValid = field.value !== '';
        break;
      case 'date':
        isValid = field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value);
        break;
      case 'description':
        isValid = field.value && field.value.trim().length > 0 && field.value.length <= 200;
        break;
    }

    field.classList.toggle('invalid', !isValid);
    if (errorEl) {
      errorEl.classList.toggle('visible', !isValid);
    }

    return isValid;
  }

  validateForm() {
    const fields = ['amount', 'category', 'date', 'description'];
    return fields.every(id => {
      const field = this.shadowRoot.getElementById(id);
      return this.validateField(field);
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const formData = {
      amount: parseFloat(this.shadowRoot.getElementById('amount').value),
      categoryId: parseInt(this.shadowRoot.getElementById('category').value),
      date: this.shadowRoot.getElementById('date').value,
      description: this.shadowRoot.getElementById('description').value.trim()
    };

    try {
      const url = this.editingId 
        ? `/api/expenses/${this.editingId}` 
        : '/api/expenses';
      
      const method = this.editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar el gasto');
      }

      this.dispatchEvent(new CustomEvent('expense-saved', {
        detail: result,
        bubbles: true,
        composed: true
      }));

      this.resetForm();
      this.showNotification(
        this.editingId ? 'Gasto actualizado' : 'Gasto creado',
        'success'
      );
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  handleCancel() {
    this.editingId = null;
    this.resetForm();
    this.removeAttribute('edit-mode');
    this.dispatchEvent(new CustomEvent('edit-cancelled', {
      bubbles: true,
      composed: true
    }));
  }

  resetForm() {
    const form = this.shadowRoot.getElementById('expenseForm');
    form.reset();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    this.shadowRoot.getElementById('date').value = today;
    
    // Clear validation states
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    form.querySelectorAll('.error-message.visible').forEach(el => el.classList.remove('visible'));
    
    // Update title
    this.shadowRoot.getElementById('formTitle').textContent = 'Nuevo Gasto';
    this.shadowRoot.getElementById('submitBtn').textContent = 'Guardar Gasto';
    this.shadowRoot.getElementById('cancelBtn').style.display = 'none';
  }

  editExpense(expense) {
    this.editingId = expense.id;
    
    this.shadowRoot.getElementById('amount').value = expense.amount;
    this.shadowRoot.getElementById('category').value = expense.category_id;
    this.shadowRoot.getElementById('date').value = expense.date;
    this.shadowRoot.getElementById('description').value = expense.description;
    
    this.shadowRoot.getElementById('formTitle').textContent = 'Editar Gasto';
    this.shadowRoot.getElementById('submitBtn').textContent = 'Actualizar';
    this.shadowRoot.getElementById('cancelBtn').style.display = 'block';
    
    this.setAttribute('edit-mode', 'true');
  }

  showNotification(message, type = 'info') {
    const event = new CustomEvent('notification', {
      detail: { message, type },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

customElements.define('expense-form', ExpenseForm);
