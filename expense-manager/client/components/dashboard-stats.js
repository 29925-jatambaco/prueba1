/**
 * Componente: Dashboard Stats
 * Muestra estadísticas, totales y gráficos de gastos
 */

class DashboardStats extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stats = null;
    this.chartInstance = null;
  }

  connectedCallback() {
    this.render();
    this.loadStats();
    
    // Escuchar evento de actualización desde otros componentes
    document.addEventListener('stats-updated', () => this.loadStats());
  }

  disconnectedCallback() {
    document.removeEventListener('stats-updated', this.loadStats);
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  /**
   * Carga las estadísticas desde la API
   */
  async loadStats() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;

      const response = await fetch(`/api/stats/summary?startDate=${startDate}&endDate=${endDate}`);
      const result = await response.json();

      if (result.success) {
        this.stats = result.data;
        this.render();
        this.initChart();
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  /**
   * Inicializa el gráfico de dona con Chart.js
   */
  initChart() {
    const ctx = this.shadowRoot.querySelector('#categoryChart');
    if (!ctx || !this.stats || !this.stats.byCategory.length) return;

    // Destruir instancia anterior si existe
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const labels = this.stats.byCategory.map(cat => cat.name);
    const data = this.stats.byCategory.map(cat => cat.amount);
    const colors = this.stats.byCategory.map(cat => cat.color);

    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
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
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .stat-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #3498db;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .stat-variation {
          font-size: 0.85rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }
        
        .stat-variation.positive {
          color: #2ecc71;
        }
        
        .stat-variation.negative {
          color: #e74c3c;
        }
        
        .charts-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .charts-section {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .chart-card,
        .top-expenses-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #ecf0f1;
        }
        
        .chart-container {
          position: relative;
          height: 250px;
        }
        
        .top-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .top-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #ecf0f1;
        }
        
        .top-item:last-child {
          border-bottom: none;
        }
        
        .top-info {
          flex: 1;
        }
        
        .top-description {
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 0.25rem;
        }
        
        .top-category {
          font-size: 0.8rem;
          color: #7f8c8d;
        }
        
        .top-amount {
          font-weight: 700;
          color: #e74c3c;
          font-size: 1rem;
        }
        
        .loading {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }
        
        .empty-chart {
          text-align: center;
          padding: 2rem;
          color: #7f8c8d;
        }
      </style>
    `;

    if (!this.stats) {
      return `
        ${styles}
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      `;
    }

    const variationClass = this.stats.comparison.variation >= 0 ? 'positive' : 'negative';
    const variationIcon = this.stats.comparison.variation >= 0 ? '↑' : '↓';
    const variationText = this.stats.comparison.variation >= 0 
      ? 'más que el mes anterior' 
      : 'menos que el mes anterior';

    return `
      ${styles}
      
      <!-- Tarjetas de Estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">${this.formatCurrency(this.stats.total)}</div>
          <div class="stat-label">Total del Mes</div>
          <div class="stat-variation ${variationClass}">
            <span>${variationIcon} ${Math.abs(this.stats.comparison.variation).toFixed(1)}%</span>
            <span>${variationText}</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">${this.formatCurrency(this.stats.averageDaily)}</div>
          <div class="stat-label">Promedio Diario</div>
          <div class="stat-label" style="margin-top: 0.5rem; font-size: 0.8rem;">
            ${this.stats.daysInPeriod} días en el periodo
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-value">${this.stats.byCategory.reduce((sum, cat) => sum + cat.count, 0)}</div>
          <div class="stat-label">Gastos Registrados</div>
          <div class="stat-label" style="margin-top: 0.5rem; font-size: 0.8rem;">
            ${this.stats.byCategory.length} categorías usadas
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-value">${this.formatCurrency(this.stats.comparison.previousMonth)}</div>
          <div class="stat-label">Mes Anterior</div>
        </div>
      </div>
      
      <!-- Gráficos y Top Gastos -->
      <div class="charts-section">
        <!-- Gráfico por Categoría -->
        <div class="chart-card">
          <h3 class="card-title">🥧 Distribución por Categoría</h3>
          ${this.stats.byCategory.length > 0
            ? `
              <div class="chart-container">
                <canvas id="categoryChart"></canvas>
              </div>
            `
            : `
              <div class="empty-chart">
                <p>No hay datos para mostrar</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Agrega gastos para ver la distribución</p>
              </div>
            `
          }
        </div>
        
        <!-- Top 5 Gastos -->
        <div class="top-expenses-card">
          <h3 class="card-title">🏆 Top 5 Gastos Más Altos</h3>
          ${this.stats.topExpenses.length > 0
            ? `
              <ul class="top-list">
                ${this.stats.topExpenses.map((expense, index) => `
                  <li class="top-item">
                    <div class="top-info">
                      <div class="top-description">#${index + 1} - ${this.escapeHtml(expense.description)}</div>
                      <div class="top-category">${this.escapeHtml(expense.category_name)}</div>
                    </div>
                    <div class="top-amount">${this.formatCurrency(expense.amount)}</div>
                  </li>
                `).join('')}
              </ul>
            `
            : `
              <div class="empty-chart">
                <p>No hay gastos registrados</p>
              </div>
            `
          }
        </div>
      </div>
    `;
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

customElements.define('dashboard-stats', DashboardStats);
