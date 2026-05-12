/**
 * Expense Summary Web Component
 * Displays dashboard with statistics, charts, and top expenses
 */
class ExpenseSummary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.summaryData = null;
  }

  connectedCallback() {
    this.render();
    this.loadSummary();
  }

  async loadSummary() {
    try {
      const response = await fetch('/api/summary');
      this.summaryData = await response.json();
      this.renderDashboard();
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .card-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        
        .card-value {
          font-size: 2rem;
          font-weight: 700;
          color: #2c3e50;
        }
        
        .card-change {
          font-size: 0.9rem;
          margin-top: 8px;
        }
        
        .card-change.positive {
          color: #27ae60;
        }
        
        .card-change.negative {
          color: #e74c3c;
        }
        
        .chart-container {
          position: relative;
          height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pie-chart {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          position: relative;
        }
        
        .chart-legend {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 20px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }
        
        .top-expenses {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .top-expense-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #ecf0f1;
        }
        
        .top-expense-item:last-child {
          border-bottom: none;
        }
        
        .top-expense-info {
          flex: 1;
        }
        
        .top-expense-description {
          font-size: 0.9rem;
          color: #2c3e50;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        
        .top-expense-category {
          font-size: 0.8rem;
          color: #7f8c8d;
        }
        
        .top-expense-amount {
          font-weight: 600;
          color: #e74c3c;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #7f8c8d;
        }
        
        .export-import {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        
        .btn-export, .btn-import-label {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-export {
          background: #3498db;
          color: white;
        }
        
        .btn-export:hover {
          background: #2980b9;
        }
        
        .btn-import-label {
          background: #2ecc71;
          color: white;
        }
        
        .btn-import-label:hover {
          background: #27ae60;
        }
        
        #importFile {
          display: none;
        }
        
        @media (max-width: 600px) {
          .dashboard {
            grid-template-columns: 1fr;
          }
          
          .chart-legend {
            grid-template-columns: 1fr;
          }
        }
      </style>
      
      <div class="dashboard">
        <!-- Total Card -->
        <div class="card">
          <h3 class="card-title">Total este Mes</h3>
          <div class="card-value" id="totalAmount">$0.00</div>
          <div class="card-change" id="monthChange"></div>
        </div>
        
        <!-- Category Chart Card -->
        <div class="card">
          <h3 class="card-title">Distribución por Categoría</h3>
          <div class="chart-container" id="chartContainer">
            <div class="pie-chart" id="pieChart"></div>
          </div>
          <div class="chart-legend" id="chartLegend"></div>
        </div>
        
        <!-- Top Expenses Card -->
        <div class="card">
          <h3 class="card-title">Top 5 Gastos</h3>
          <ul class="top-expenses" id="topExpenses">
            <li class="empty-state">No hay datos</li>
          </ul>
        </div>
      </div>
      
      <div class="card">
        <h3 class="card-title">Datos</h3>
        <div class="export-import">
          <button class="btn-export" id="exportBtn">📥 Exportar JSON</button>
          <label class="btn-import-label">
            📤 Importar JSON
            <input type="file" id="importFile" accept=".json">
          </label>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    const exportBtn = this.shadowRoot.getElementById('exportBtn');
    const importFile = this.shadowRoot.getElementById('importFile');
    
    exportBtn.addEventListener('click', () => this.handleExport());
    importFile.addEventListener('change', (e) => this.handleImport(e));
  }

  renderDashboard() {
    if (!this.summaryData) return;
    
    const { currentMonth, categoryBreakdown, topExpenses } = this.summaryData;
    
    // Update total
    const totalEl = this.shadowRoot.getElementById('totalAmount');
    totalEl.textContent = `$${parseFloat(currentMonth.total).toFixed(2)}`;
    
    // Update change indicator
    const changeEl = this.shadowRoot.getElementById('monthChange');
    const change = parseFloat(currentMonth.change);
    
    if (change === 0 && currentMonth.previousTotal === 0) {
      changeEl.textContent = 'Sin datos del mes anterior';
      changeEl.className = 'card-change';
    } else if (change >= 0) {
      changeEl.textContent = `↗ ${change}% vs mes anterior`;
      changeEl.className = 'card-change positive';
    } else {
      changeEl.textContent = `↘ ${Math.abs(change)}% vs mes anterior`;
      changeEl.className = 'card-change negative';
    }
    
    // Render pie chart
    this.renderPieChart(categoryBreakdown);
    
    // Render top expenses
    this.renderTopExpenses(topExpenses);
  }

  renderPieChart(categories) {
    const pieChart = this.shadowRoot.getElementById('pieChart');
    const legend = this.shadowRoot.getElementById('chartLegend');
    
    const total = categories.reduce((sum, cat) => sum + cat.total, 0);
    
    if (total === 0) {
      pieChart.style.background = '#ecf0f1';
      legend.innerHTML = '<div class="empty-state" style="grid-column: span 2;">Sin gastos este mes</div>';
      return;
    }
    
    // Create conic gradient for pie chart
    let gradient = [];
    let currentAngle = 0;
    const validCategories = categories.filter(cat => cat.total > 0);
    
    validCategories.forEach((cat, index) => {
      const percentage = (cat.total / total) * 100;
      const angle = (percentage / 100) * 360;
      
      gradient.push(`${cat.color} ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    });
    
    pieChart.style.background = `conic-gradient(${gradient.join(', ')})`;
    
    // Render legend
    legend.innerHTML = validCategories.map(cat => `
      <div class="legend-item">
        <div class="legend-color" style="background-color: ${cat.color}"></div>
        <span>${cat.name}: $${parseFloat(cat.total).toFixed(2)}</span>
      </div>
    `).join('');
  }

  renderTopExpenses(expenses) {
    const listEl = this.shadowRoot.getElementById('topExpenses');
    
    if (!expenses || expenses.length === 0) {
      listEl.innerHTML = '<li class="empty-state">No hay gastos registrados</li>';
      return;
    }
    
    listEl.innerHTML = expenses.map((expense, index) => `
      <li class="top-expense-item">
        <div class="top-expense-info">
          <div class="top-expense-description">${this.escapeHtml(expense.description)}</div>
          <div class="top-expense-category">${expense.category_name}</div>
        </div>
        <div class="top-expense-amount">$${parseFloat(expense.amount).toFixed(2)}</div>
      </li>
    `).join('');
  }

  async handleExport() {
    try {
      const response = await fetch('/api/expenses/export');
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      this.showNotification('Exportación completada', 'success');
    } catch (error) {
      this.showNotification('Error al exportar', 'error');
    }
  }

  async handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const content = await file.text();
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de archivo inválido');
      }
      
      const response = await fetch('/api/expenses/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }
      
      this.showNotification(`Se importaron ${result.count} gastos`, 'success');
      
      this.dispatchEvent(new CustomEvent('expenses-changed', {
        bubbles: true,
        composed: true
      }));
      
      e.target.value = '';
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  showNotification(message, type) {
    this.dispatchEvent(new CustomEvent('notification', {
      detail: { message, type },
      bubbles: true,
      composed: true
    }));
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  refresh() {
    this.loadSummary();
  }
}

customElements.define('expense-summary', ExpenseSummary);
