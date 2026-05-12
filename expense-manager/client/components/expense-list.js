class ExpenseList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.expenses = [];
    this.filteredExpenses = [];
    this.currentPage = 1;
    this.itemsPerPage = 5;
  }

  connectedCallback() {
    this.loadData();
    window.addEventListener('expense-updated', () => this.loadData());
    window.addEventListener('category-filtered', (e) => {
      this.filterByCategory(e.detail);
    });
  }

  async loadData() {
    const res = await fetch('/api/expenses');
    this.expenses = await res.json();
    this.filteredExpenses = this.expenses;
    this.currentPage = 1;
    this.render();
  }

  filterByCategory(category) {
    if (!category) {
      this.filteredExpenses = this.expenses;
    } else {
      this.filteredExpenses = this.expenses.filter(e => e.category === category);
    }
    this.currentPage = 1;
    this.render();
  }

  deleteExpense(id) {
    if(confirm('¿Eliminar este gasto?')) {
      fetch(`/api/expenses/${id}`, { method: 'DELETE' })
        .then(() => this.loadData());
    }
  }

  changePage(delta) {
    this.currentPage += delta;
    this.render();
  }

  render() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageItems = this.filteredExpenses.slice(start, end);
    const totalPages = Math.ceil(this.filteredExpenses.length / this.itemsPerPage);

    let rows = pageItems.map(e => `
      <tr>
        <td>${e.date}</td>
        <td>${e.category}</td>
        <td>${e.description || '-'}</td>
        <td style="font-weight:bold">$${e.amount.toFixed(2)}</td>
        <td><button class="delete-btn" data-id="${e.id}">🗑️</button></td>
      </tr>
    `).join('');

    if (rows === '') rows = '<tr><td colspan="5" style="text-align:center">No hay gastos registrados</td></tr>';

    const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
    const nextDisabled = this.currentPage >= totalPages ? 'disabled' : '';

    this.shadowRoot.innerHTML = `
      <style>
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8fafc; color: #64748b; font-weight: 600; }
        .delete-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
        .pagination { display: flex; justify-content: center; gap: 10px; margin-top: 1rem; align-items: center; }
        button.page-btn { padding: 5px 10px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; }
        button.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      </style>
      <h3>Listado de Gastos</h3>
      <table>
        <thead>
          <tr><th>Fecha</th><th>Categoría</th><th>Desc</th><th>Monto</th><th>Acción</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="pagination">
        <button class="page-btn" ${prevDisabled} id="prevBtn">Anterior</button>
        <span>Página ${this.currentPage} de ${totalPages || 1}</span>
        <button class="page-btn" ${nextDisabled} id="nextBtn">Siguiente</button>
      </div>
    `;

    this.shadowRoot.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteExpense(e.target.dataset.id));
    });
    
    this.shadowRoot.getElementById('prevBtn').addEventListener('click', () => this.changePage(-1));
    this.shadowRoot.getElementById('nextBtn').addEventListener('click', () => this.changePage(1));
  }
}

customElements.define('expense-list', ExpenseList);
