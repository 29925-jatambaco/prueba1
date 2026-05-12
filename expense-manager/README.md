# 📊 Gestor de Gastos Personales

Una aplicación web moderna y completa para gestionar tus gastos personales, construida con **Web Components** vanilla y **Node.js/Express**.

## ✨ Características

### Gestión de Gastos
- ✅ Crear nuevos gastos (monto, categoría, fecha, descripción)
- ✅ Editar gastos existentes
- ✅ Eliminar gastos
- ✅ Listado paginado de todos los gastos

### Categorías
- ✅ 8 categorías predefinidas con colores
- ✅ Filtrar gastos por categoría
- ✅ Sistema de badges visuales

### Dashboard
- ✅ Total gastado en el mes actual
- ✅ Gráfico circular de distribución por categoría
- ✅ Top 5 gastos más altos
- ✅ Comparativa con el mes anterior (porcentaje de cambio)

### Persistencia y Datos
- ✅ Base de datos SQLite local
- ✅ Exportar datos a JSON
- ✅ Importar datos desde backup JSON

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Web Components (Vanilla JS) + Shadow DOM |
| Backend | Node.js + Express |
| Base de Datos | SQLite (better-sqlite3) |
| Estilos | CSS Modules en Shadow DOM |
| Puerto | 6666 |

## 📁 Estructura del Proyecto

```
expense-manager/
├── server/
│   ├── index.js              # Entry point del servidor
│   ├── routes/
│   │   ├── expenses.js       # Rutas de gastos
│   │   └── categories.js     # Rutas de categorías
│   ├── models/
│   │   ├── database.js       # Configuración de BD
│   │   ├── Expense.js        # Modelo de gastos
│   │   └── Category.js       # Modelo de categorías
│   └── middleware/           # Middleware personalizado
├── client/
│   ├── components/
│   │   ├── expense-form.js   # Formulario de gastos
│   │   ├── expense-list.js   # Lista de gastos
│   │   ├── expense-summary.js # Dashboard
│   │   └── category-filter.js # Filtro por categoría
│   ├── styles/               # Estilos globales
│   └── index.html            # HTML principal
├── data/                     # Base de datos SQLite
├── package.json
├── .env.example
└── README.md
```

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Node.js >= 18.0.0
- npm o yarn

### Pasos de Instalación

```bash
# Clonar o navegar al directorio del proyecto
cd expense-manager

# Instalar dependencias
npm install

# Copiar archivo de entorno (opcional)
cp .env.example .env
```

### Ejecución

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

La aplicación estará disponible en: **http://localhost:6666**

## 📡 API Endpoints

### Gastos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/expenses` | Listar gastos (con paginación) |
| POST | `/api/expenses` | Crear nuevo gasto |
| GET | `/api/expenses/:id` | Obtener gasto por ID |
| PUT | `/api/expenses/:id` | Actualizar gasto |
| DELETE | `/api/expenses/:id` | Eliminar gasto |
| GET | `/api/expenses/export` | Exportar todos los gastos |
| POST | `/api/expenses/import` | Importar gastos desde JSON |

### Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Listar todas las categorías |
| POST | `/api/categories` | Crear nueva categoría |
| GET | `/api/categories/:id` | Obtener categoría por ID |
| PUT | `/api/categories/:id` | Actualizar categoría |
| DELETE | `/api/categories/:id` | Eliminar categoría |

### Resumen

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/summary` | Obtener resumen estadístico |

## 🔧 Parámetros de Consulta

### GET /api/expenses

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| page | number | Página actual (default: 1) |
| limit | number | Items por página (default: 10) |
| category | number | Filtrar por ID de categoría |
| startDate | string | Fecha inicio (YYYY-MM-DD) |
| endDate | string | Fecha fin (YYYY-MM-DD) |

## 📝 Validaciones

### Gastos
- **Monto**: Debe ser mayor a 0
- **Descripción**: Requerida, máximo 200 caracteres
- **Categoría**: Requerida
- **Fecha**: Formato válido YYYY-MM-DD

### Categorías
- **Nombre**: Requerido, máximo 50 caracteres, único
- **Color**: Formato hexadecimal (#RRGGBB)

## 🎨 Componentes Web

### `<expense-form>`
Formulario para crear y editar gastos.
- **Eventos**: `expense-saved`, `edit-cancelled`, `notification`
- **Métodos**: `editExpense(expense)`, `resetForm()`

### `<expense-list>`
Lista paginada de gastos con acciones.
- **Atributos**: `filter-category`
- **Eventos**: `edit-expense`, `expenses-changed`, `notification`
- **Métodos**: `refresh()`

### `<expense-summary>`
Dashboard con estadísticas y gráficos.
- **Eventos**: `expenses-changed`, `notification`
- **Métodos**: `refresh()`

### `<category-filter>`
Filtro de categorías interactivo.
- **Eventos**: `category-filter`

## 🔒 Seguridad

- Sanitización de inputs (prevención XSS)
- CORS configurado correctamente
- Validación de datos en backend
- Protección contra inyección SQL (SQLite parametrizado)

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Ver cobertura
npm test -- --coverage
```

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Mobile-first** approach
- Diseño adaptable a todos los tamaños de pantalla
- Menú lateral que se convierte en stack en móviles
- Tarjetas y gráficos responsivos

## ♿ Accesibilidad

- Etiquetas semánticas HTML5
- Contraste de colores WCAG 2.1 AA
- Navegación por teclado
- ARIA labels donde sea necesario

## 📄 Licencia

ISC

## 👨‍💻 Autor

Desarrollado como proyecto demostrativo de aplicaciones web modernas con Web Components.

---

**¡Disfruta gestionando tus gastos! 💰**
