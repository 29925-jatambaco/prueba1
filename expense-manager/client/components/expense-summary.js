class ExpenseSummary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.loadData();
    window.addEventListener('expense-updated', () => this.loadData());
  }

  async loadData() {
    const res = await fetch('/api/summary');
    const data = await res.json();
    this.render(data);
  }

  render(data) {
    const items = Object.entries(data.byCategory || {}).map(([cat, amount]) => `
      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
        <span>${cat}</span>
        <strong>$${amount.toFixed(2)}</strong>
      </div>
    `).join('');

    this.shadowRoot.innerHTML = `
      <style>
        .total { font-size: 2.5rem; color: #2563eb; font-weight: bold; margin: 10px 0; }
        .detail { margin-top: 20px; border-top: 1px solid #eee; paddingTop: 10px; }
      </style>
      <h3>Resumen del Mes</h3>
      <div class="total">$${data.total.toFixed(2)}</div>
      <p>${data.count} gastos registrados</p>
      <div class="detail">
        <h4>Por Categoría</h4>
        ${items || '<p>Sin datos</p>'}
      </div>
    `;
  }
}

customElements.define('expense-summary', ExpenseSummary);
