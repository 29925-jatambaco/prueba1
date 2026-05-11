# Expense Manager

A modern, responsive web application for managing personal expenses. Built with Web Components (Vanilla JS) on the frontend and Node.js + Express on the backend.

## 🚀 Features

- **Expense Management**: Create, edit, delete, and list expenses with pagination
- **Categories**: Customizable categories with color coding
- **Dashboard**: 
  - Total spent this month
  - Category distribution chart
  - Top 5 highest expenses
  - Month-over-month comparison
- **Data Export/Import**: Backup and restore your data in JSON format
- **Responsive Design**: Mobile-first approach, works on all devices
- **Accessibility**: WCAG 2.1 AA compliant

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Web Components (Vanilla JS) |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Styles | CSS Modules / Shadow DOM |
| Testing | Jest + Supertest |

## 📁 Project Structure

```
expense-manager/
├── server/
│   ├── index.js              # Main server entry point
│   ├── routes/
│   │   ├── expenses.js       # Expense API routes
│   │   └── categories.js     # Category API routes
│   ├── controllers/
│   │   ├── expenseController.js
│   │   └── categoryController.js
│   ├── models/
│   │   ├── database.js       # Database configuration
│   │   ├── expenseModel.js   # Expense data operations
│   │   └── categoryModel.js  # Category data operations
│   └── middleware/           # Custom middleware
├── client/
│   ├── components/
│   │   ├── expense-form.js   # Form for creating/editing expenses
│   │   ├── expense-list.js   # Paginated expense list
│   │   ├── expense-summary.js # Dashboard with statistics
│   │   └── category-filter.js # Category filter component
│   ├── styles/
│   │   └── main.css          # Global styles
│   └── index.html            # Main HTML file
├── tests/
│   ├── models/               # Model unit tests
│   └── routes/               # API integration tests
├── .env.example              # Environment variables template
├── package.json
└── README.md
```

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables (optional):
```env
PORT=6666
NODE_ENV=development
DATABASE_PATH=./data/expenses.db
```

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

This starts the server with hot-reload enabled using nodemon.

### Production Mode

```bash
npm start
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:6666
```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run linting:
```bash
npm run lint
npm run lint:fix
```

Format code:
```bash
npm run format
```

## 📡 API Endpoints

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List all expenses (paginated) |
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses/:id` | Get a single expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create a new category |
| GET | `/api/categories/:id` | Get a single category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |

### Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/summary` | Get dashboard statistics |

## 📝 Request/Response Examples

### Create Expense

**Request:**
```json
POST /api/expenses
{
  "amount": 50.00,
  "category_id": 1,
  "description": "Grocery shopping",
  "date": "2024-01-15"
}
```

**Response:**
```json
{
  "id": 1,
  "amount": 50.00,
  "category_id": 1,
  "category_name": "Food & Dining",
  "category_color": "#e74c3c",
  "description": "Grocery shopping",
  "date": "2024-01-15",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### Get Summary

**Response:**
```json
{
  "currentMonth": {
    "year": 2024,
    "month": 1,
    "total": 1500.00,
    "expenseCount": 25
  },
  "previousMonth": {
    "year": 2023,
    "month": 12,
    "total": 1200.00
  },
  "comparison": {
    "difference": 300.00,
    "percentageChange": 25.00
  },
  "categoryDistribution": [...],
  "topExpenses": [...]
}
```

## 🎨 Web Components

### `<expense-form>`
Form component for creating and editing expenses.

**Attributes:**
- `edit-mode`: Boolean, enables edit mode
- `expense-id`: ID of expense to edit

**Events:**
- `expense-saved`: Fired when expense is saved
- `cancel-edit`: Fired when edit is cancelled

### `<expense-list>`
Displays paginated list of expenses.

**Attributes:**
- `category-filter`: Filter by category ID

**Events:**
- `edit-expense`: Fired when edit button is clicked
- `expense-deleted`: Fired when expense is deleted

### `<expense-summary>`
Dashboard component with statistics and charts.

### `<category-filter>`
Category filter buttons component.

**Events:**
- `category-change`: Fired when category selection changes

## 🔒 Security Features

- Input sanitization and validation
- XSS protection via content escaping
- CORS configured
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- SQL injection prevention (parameterized queries)

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- High contrast mode support
- Reduced motion support
- Screen reader friendly

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 480px, 768px
- Touch-friendly UI elements
- Responsive typography

## 🗄️ Database Schema

### Categories Table
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3498db',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  category_id INTEGER NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
)
```

## 📦 Default Categories

The application comes with pre-configured categories:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Other

## 🔧 Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 6666 |
| NODE_ENV | Environment mode | development |
| DATABASE_PATH | SQLite database path | ./data/expenses.db |

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using Web Components and Node.js
