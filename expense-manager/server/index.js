const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 6666;
const DB_PATH = path.join(__dirname, '../data/db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

const readDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ categories: [], expenses: [] }));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  const db = readDB();
  const newCat = { id: Date.now(), ...req.body };
  db.categories.push(newCat);
  writeDB(db);
  res.status(201).json(newCat);
});

app.get('/api/expenses', (req, res) => {
  const db = readDB();
  db.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(db.expenses);
});

app.post('/api/expenses', (req, res) => {
  try {
    const { amount, category, date, description } = req.body;
    if (!amount || amount <= 0) throw new Error('Monto inválido');
    if (!category) throw new Error('Categoría requerida');
    
    const db = readDB();
    const newExpense = {
      id: Date.now(),
      amount: parseFloat(amount),
      category,
      date,
      description: description ? description.slice(0, 200) : ''
    };
    
    db.expenses.push(newExpense);
    writeDB(db);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', (req, res) => {
  const db = readDB();
  const index = db.expenses.findIndex(e => e.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'No encontrado' });
  
  db.expenses[index] = { ...db.expenses[index], ...req.body };
  writeDB(db);
  res.json(db.expenses[index]);
});

app.delete('/api/expenses/:id', (req, res) => {
  const db = readDB();
  db.expenses = db.expenses.filter(e => e.id != req.params.id);
  writeDB(db);
  res.status(204).send();
});

app.get('/api/summary', (req, res) => {
  const db = readDB();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyExpenses = db.expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const byCategory = {};
  monthlyExpenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  res.json({ total, byCategory, count: monthlyExpenses.length });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📂 Base de datos: ${DB_PATH}`);
});
