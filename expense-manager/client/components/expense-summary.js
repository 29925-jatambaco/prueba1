/**
 * Expense Summary Web Component
 * Displays dashboard with statistics, charts, and top expenses
 */
class ExpenseSummary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._summary = null;
    this._loading = false;
  }

  connectedCallback() {
    this.render();
    this.loadSummary();
  }

  /**
   * Load summary data from API
   */
  async loadSummary() {
    this._loading = true;
    this.render();

    try {
      const response = await fetch('/api/summary');
      this._summary = await response.json();
      this.render();
    } catch (error) {
      console.error('Failed to load summary:', error);
      this._loading = false;
      this.render();
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
   * Render component
   */
  render() {
    if (this._loading) {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; padding: 20px; }
          .loading { text-align: center; padding: 40px; color: #7f8c8d; }
        </style>
        <div class="loading">Loading summary...</div>
      `;
      return;
    }

    if (!this._summary) {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; padding: 20px; }
          .error { text-align: center; padding: 40px; color: #e74c3c; }
        </style>
        <div class="error">Failed to load summary data</div>
      `;
      return;
    }

    const { currentMonth, previousMonth, comparison, categoryDistribution, topExpenses } = this._summary;
    
    const changeClass = comparison.percentageChange >= 0 ? 'increase' : 'decrease';
    const changeIcon = comparison.percentageChange >= 0 ? '↑' : '↓';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .stat-change {
          font-size: 0.85rem;
          margin-top: 5px;
        }

        .stat-change.increase {
          color: #e74c3c;
        }

        .stat-change.decrease {
          color: #27ae60;
        }

        .section {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .section h2 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.25rem;
        }

        .category-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .category-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }

        .category-item:last-child {
          border-bottom: none;
        }

        .category-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          margin-right: 10px;
        }

        .category-name {
          flex: 1;
          color: #555;
        }

        .category-amount {
          font-weight: bold;
          color: #2c3e50;
        }

        .category-count {
          font-size: 0.85rem;
          color: #7f8c8d;
          margin-left: 10px;
        }

        .top-expense {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .top-expense:last-child {
          border-bottom: none;
        }

        .top-expense-info {
          flex: 1;
        }

        .top-expense-amount {
          font-weight: bold;
          color: #e74c3c;
        }

        .top-expense-desc {
          font-size: 0.9rem;
          color: #555;
        }

        .top-expense-category {
          font-size: 0.85rem;
          color: #7f8c8d;
        }

        .chart-container {
          position: relative;
          height: 200px;
          margin-top: 20px;
        }

        .bar-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 150px;
          padding: 10px 0;
        }

        .bar {
          flex: 1;
          margin: 0 5px;
          border-radius: 4px 4px 0 0;
          transition: opacity 0.2s;
          cursor: pointer;
          position: relative;
        }

        .bar:hover {
          opacity: 0.8;
        }

        .bar-label {
          text-align: center;
          font-size: 0.75rem;
          color: #7f8c8d;
          margin-top: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bar-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #2c3e50;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.85rem;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }

        .bar:hover .bar-tooltip {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .dashboard {
            grid-template-columns: 1fr;
          }

          .stat-value {
            font-size: 1.5rem;
          }
        }
      </style>

      <div class="dashboard">
        <div class="stat-card">
          <h3>Current Month Total</h3>
          <div class="stat-value">${this.formatCurrency(currentMonth.total)}</div>
          <div class="stat-change ${changeClass}">
            ${changeIcon} ${Math.abs(comparison.percentageChange)}% vs last month
          </div>
        </div>

        <div class="stat-card">
          <h3>Expenses This Month</h3>
          <div class="stat-value">${currentMonth.expenseCount}</div>
          <div class="stat-change" style="color: #7f8c8d;">
            transactions
          </div>
        </div>

        <div class="stat-card">
          <h3>Previous Month</h3>
          <div class="stat-value">${this.formatCurrency(previousMonth.total)}</div>
          <div class="stat-change" style="color: #7f8c8d;">
            ${previousMonth.month}/${previousMonth.year}
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Spending by Category</h2>
        ${this.renderBarChart(categoryDistribution)}
        <ul class="category-list">
          ${categoryDistribution.filter(c => c.total > 0).map(cat => `
            <li class="category-item">
              <div class="category-color" style="background-color: ${cat.color}"></div>
              <span class="category-name">${cat.name}</span>
              <span class="category-amount">${this.formatCurrency(cat.total)}</span>
              <span class="category-count">(${cat.count})</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>Top 5 Highest Expenses</h2>
        ${topExpenses.length === 0 
          ? '<p style="color: #7f8c8d; text-align: center;">No expenses yet</p>'
          : topExpenses.map(expense => `
              <div class="top-expense">
                <div class="top-expense-info">
                  <div class="top-expense-amount">${this.formatCurrency(expense.amount)}</div>
                  <div class="top-expense-desc">${expense.description || 'No description'}</div>
                  <div class="top-expense-category">${expense.category_name} • ${new Date(expense.date).toLocaleDateString()}</div>
                </div>
              </div>
            `).join('')
        }
      </div>
    `;
  }

  /**
   * Render bar chart for category distribution
   * @param {Array} categories - Category data
   * @returns {string} HTML for bar chart
   */
  renderBarChart(categories) {
    const activeCategories = categories.filter(c => c.total > 0);
    if (activeCategories.length === 0) return '';

    const maxAmount = Math.max(...activeCategories.map(c => c.total));
    
    return `
      <div class="chart-container">
        <div class="bar-chart">
          ${activeCategories.slice(0, 6).map(cat => {
            const height = (cat.total / maxAmount) * 100;
            return `
              <div class="bar-wrapper" style="flex: 1; margin: 0 3px; display: flex; flex-direction: column; align-items: center;">
                <div class="bar" style="height: ${height}px; background-color: ${cat.color}; width: 100%;">
                  <div class="bar-tooltip">${this.formatCurrency(cat.total)}</div>
                </div>
                <div class="bar-label">${cat.name.substring(0, 8)}${cat.name.length > 8 ? '...' : ''}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Refresh summary data
   */
  refresh() {
    this.loadSummary();
  }
}

customElements.define('expense-summary', ExpenseSummary);
