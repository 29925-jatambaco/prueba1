class ExpenseForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.categories = [];
  }

  connectedCallback() {
    this.loadCategories();
    this.render();
  }

  async loadCategories() {
    const res = await fetch('/api/categories');
    this.categories = await res.json();
    this.render();
  }

  handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => {
      if(res.ok) {
        e.target.reset();
        window.dispatchEvent(new CustomEvent('expense-updated'));
        alert('Gasto guardado correctamente');
      } else {
        alert('Error al guardar');
      }
    });
  }

  render() {
    const options = this.categories.map(c => 
      `<option value="${c.name}">${c.name}</option>`
    ).join('');

    this.shadowRoot.innerHTML = `
      <style>
        form { display: flex; flex-direction: column; gap: 1rem; }
        input, select, button { padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
        button { background: #2563eb; color: white; border: none; cursor: pointer; font-weight: bold; }
        button:hover { background: #1d4ed8; }
        label { font-weight: 600; font-size: 0.9rem; }
      </style>
      <h3>Nuevo Gasto</h3>
      <form>
        <div>
          <label>Monto ($)</label>
          <input type="number" step="0.01" name="amount" required min="0.01">
        </div>
        <div>
          <label>Categoría</label>
          <select name="category" required>
            <option value="" disabled selected>Seleccionar...</option>
            ${options}
          </select>
        </div>
        <div>
          <label>Fecha</label>
          <input type="date" name="date" required value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div>
          <label>Descripción</label>
          <input type="text" name="description" maxlength="200" placeholder="Opcional">
        </div>
        <button type="submit">Guardar Gasto</button>
      </form>
    `;
    
    this.shadowRoot.querySelector('form').addEventListener('submit', this.handleSubmit.bind(this));
  }
}

customElements.define('expense-form', ExpenseForm);
