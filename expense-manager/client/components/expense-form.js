/**
 * Expense Form Web Component
 * Allows creating and editing expenses
 */
class ExpenseForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._editMode = false;
    this._expenseId = null;
    this._categories = [];
  }

  static get observedAttributes() {
    return ['edit-mode', 'expense-id'];
  }

  connectedCallback() {
    this.render();
    this.loadCategories();
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'edit-mode') {
      this._editMode = newValue === 'true';
    }
    if (name === 'expense-id' && this._editMode) {
      this._expenseId = newValue;
      this.loadExpenseData(newValue);
    }
  }

  /**
   * Load categories from API
   */
  async loadCategories() {
    try {
      const response = await fetch('/api/categories');
      this._categories = await response.json();
      this.renderForm();
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  /**
   * Load expense data for editing
   * @param {string} id - Expense ID
   */
  async loadExpenseData(id) {
    try {
      const response = await fetch(`/api/expenses/${id}`);
      if (response.ok) {
        const expense = await response.json();
        this.populateForm(expense);
      }
    } catch (error) {
      console.error('Failed to load expense:', error);
    }
  }

  /**
   * Populate form with expense data
   * @param {Object} expense - Expense data
   */
  populateForm(expense) {
    const form = this.shadowRoot.querySelector('#expense-form');
    if (form) {
      form.querySelector('#amount').value = expense.amount;
      form.querySelector('#category').value = expense.category_id;
      form.querySelector('#date').value = expense.date;
      form.querySelector('#description').value = expense.description || '';
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const form = this.shadowRoot.querySelector('#expense-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    const cancelButton = this.shadowRoot.querySelector('#cancel-btn');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('cancel-edit'));
      });
    }
  }

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  async handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const amount = parseFloat(formData.get('amount'));
    const category_id = parseInt(formData.get('category'));
    const date = formData.get('date');
    const description = formData.get('description').trim();

    // Validation
    if (amount <= 0) {
      this.showError('Amount must be greater than 0');
      return;
    }

    if (!date) {
      this.showError('Date is required');
      return;
    }

    if (description.length > 200) {
      this.showError('Description must not exceed 200 characters');
      return;
    }

    const expenseData = { amount, category_id, date, description };

    try {
      let response;
      if (this._editMode && this._expenseId) {
        response = await fetch(`/api/expenses/${this._expenseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData)
        });
      } else {
        response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData)
        });
      }

      if (response.ok) {
        this.dispatchEvent(new CustomEvent('expense-saved', { 
          bubbles: true,
          detail: { success: true }
        }));
        this.resetForm();
      } else {
        const error = await response.json();
        this.showError(error.details ? error.details.join(', ') : error.error);
      }
    } catch (error) {
      this.showError('Failed to save expense');
      console.error('Save error:', error);
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorEl = this.shadowRoot.querySelector('#error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Reset form to default state
   */
  resetForm() {
    const form = this.shadowRoot.querySelector('#expense-form');
    if (form) {
      form.reset();
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      form.querySelector('#date').value = today;
    }
    this._editMode = false;
    this._expenseId = null;
    this.removeAttribute('edit-mode');
    this.removeAttribute('expense-id');
  }

  /**
   * Render component
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 20px;
          margin-bottom: 20px;
        }

        h2 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-weight: 500;
        }

        input, select, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        button {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
          flex: 1;
        }

        .btn-primary:hover {
          background-color: #2980b9;
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #7f8c8d;
        }

        #error-message {
          display: none;
          background-color: #fee;
          color: #c00;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
          border: 1px solid #fcc;
        }

        @media (max-width: 480px) {
          .button-group {
            flex-direction: column;
          }
        }
      </style>

      <h2>${this._editMode ? 'Edit Expense' : 'Add New Expense'}</h2>
      
      <div id="error-message"></div>
      
      ${this.renderForm()}
    `;
  }

  /**
   * Render form HTML
   * @returns {string} Form HTML
   */
  renderForm() {
    const today = new Date().toISOString().split('T')[0];
    const categoryOptions = this._categories.map(cat => 
      `<option value="${cat.id}" style="background-color: ${cat.color};">${cat.name}</option>`
    ).join('');

    return `
      <form id="expense-form">
        <div class="form-group">
          <label for="amount">Amount *</label>
          <input type="number" id="amount" name="amount" step="0.01" min="0.01" required placeholder="0.00">
        </div>

        <div class="form-group">
          <label for="category">Category *</label>
          <select id="category" name="category" required>
            <option value="">Select a category</option>
            ${categoryOptions}
          </select>
        </div>

        <div class="form-group">
          <label for="date">Date *</label>
          <input type="date" id="date" name="date" value="${today}" required>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" name="description" maxlength="200" placeholder="Enter description (max 200 characters)"></textarea>
        </div>

        <div class="button-group">
          <button type="submit" class="btn-primary">${this._editMode ? 'Update' : 'Add'} Expense</button>
          ${this._editMode ? '<button type="button" id="cancel-btn" class="btn-secondary">Cancel</button>' : ''}
        </div>
      </form>
    `;
  }
}

customElements.define('expense-form', ExpenseForm);
