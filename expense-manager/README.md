# 💰 Gestor de Gastos Personales

Aplicación web completa para gestionar tus finanzas diarias. Desarrollada con **Node.js**, **Express**, **SQLite** y **Web Components nativos** (sin frameworks como React o Vue).

## 🚀 Características

- ✅ **CRUD completo** de gastos (Crear, Leer, Actualizar, Eliminar)
- ✅ **Persistencia real** con SQLite (los datos no se pierden al recargar)
- ✅ **Dashboard en tiempo real** con totales y estadísticas
- ✅ **Gráficos interactivos** de distribución por categorías
- ✅ **Filtros avanzados** por fecha y categoría
- ✅ **Paginación** de resultados
- ✅ **Validación** de datos en frontend y backend
- ✅ **Diseño responsive** (mobile-first)
- ✅ **Web Components nativos** con Shadow DOM
- ✅ **API REST** documentada y segura

## 📂 Estructura del Proyecto

```
expense-manager/
├── server/
│   ├── index.js              # Punto de entrada (PUERTO 3001)
│   ├── db.js                 # Configuración SQLite y migraciones
│   ├── routes/
│   │   ├── expenses.js       # CRUD de gastos
│   │   └── stats.js          # Estadísticas y cálculos
│   └── utils/
│       └── validators.js     # Validación de inputs
├── client/
│   ├── index.html            # Estructura principal
│   ├── styles/
│   │   └── global.css        # Estilos globales
│   └── components/
│       ├── expense-form.js   # Formulario de gastos
│       ├── expense-list.js   # Lista con paginación
│       ├── dashboard-stats.js# Dashboard y gráficos
│       └── category-manager.js# Gestor de categorías
├── package.json
└── README.md
```

## 🛠️ Requisitos Previos

- **Node.js** versión 16.x o superior
- **npm** (incluido con Node.js)

## 📥 Instalación

1. **Navega al directorio del proyecto:**
   ```bash
   cd expense-manager
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Inicia el servidor:**
   ```bash
   npm start
   ```

4. **Abre tu navegador en:**
   ```
   http://localhost:3001
   ```

## 🔧 Modos de Ejecución

### Producción
```bash
npm start
```
Arranca el servidor en el puerto **3001**.

### Desarrollo (con auto-reload)
```bash
npm run dev
```
Requiere tener instalado `nodemon` (incluido en devDependencies).

## 📡 Endpoints de la API

### Gastos (`/api/expenses`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/expenses` | Listar gastos (con filtros) |
| GET | `/api/expenses/:id` | Obtener un gasto por ID |
| POST | `/api/expenses` | Crear nuevo gasto |
| PUT | `/api/expenses/:id` | Actualizar gasto existente |
| DELETE | `/api/expenses/:id` | Eliminar gasto |

**Parámetros de consulta para GET:**
- `startDate` - Fecha inicial (YYYY-MM-DD)
- `endDate` - Fecha final (YYYY-MM-DD)
- `categoryId` - Filtrar por categoría
- `limit` - Número de resultados (default: 50)
- `offset` - Paginación (default: 0)

### Estadísticas (`/api/stats`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/stats/summary` | Resumen estadístico del periodo |
| GET | `/api/stats/categories` | Listar categorías disponibles |

**Ejemplo de respuesta de `/api/stats/summary`:**
```json
{
  "success": true,
  "data": {
    "period": { "start": "2024-01-01", "end": "2024-01-31" },
    "total": 1500.50,
    "averageDaily": 48.40,
    "daysInPeriod": 31,
    "byCategory": [...],
    "topExpenses": [...],
    "comparison": {
      "previousMonth": 1200.00,
      "variation": 25.04
    }
  }
}
```

## 🎯 Uso de la Aplicación

### 1. Agregar un Gasto
1. Completa el formulario "Nuevo Gasto":
   - **Descripción**: Qué gastaste (ej: "Compra en supermercado")
   - **Monto**: Cantidad gastada (debe ser > 0)
   - **Categoría**: Selecciona una categoría
   - **Fecha**: Cuándo ocurrió el gasto
2. Haz clic en "Guardar Gasto"

### 2. Ver y Filtrar Gastos
- La lista muestra todos los gastos registrados
- Usa los filtros para buscar por:
  - Rango de fechas
  - Categoría específica
- Navega entre páginas con los botones "Anterior" y "Siguiente"

### 3. Editar un Gasto
1. Haz clic en el botón ✏️ junto al gasto que quieras editar
2. El formulario se cargará con los datos existentes
3. Modifica los campos necesarios
4. Haz clic en "Actualizar"

### 4. Eliminar un Gasto
1. Haz clic en el botón 🗑️ junto al gasto
2. Confirma la eliminación en el diálogo emergente
3. ⚠️ **Nota**: Esta acción es irreversible

### 5. Ver Estadísticas
El dashboard muestra automáticamente:
- **Total del mes**: Suma de todos los gastos del mes actual
- **Promedio diario**: Gasto promedio por día
- **Distribución por categoría**: Gráfico de dona interactivo
- **Top 5 gastos**: Los gastos más altos del periodo
- **Comparativa mensual**: Variación respecto al mes anterior

## 🔒 Seguridad y Validación

- **Backend**: Validación estricta de todos los inputs
- **SQLite**: Prepared statements para prevenir inyecciones SQL
- **Frontend**: Sanitización de HTML para prevenir XSS
- **Códigos HTTP**: Respuestas apropiadas (200, 201, 400, 404, 500)

## 🎨 Tecnologías Utilizadas

### Backend
- **Node.js** + **Express**: Servidor web
- **better-sqlite3**: Base de datos SQLite síncrona
- **cors**: Middleware CORS

### Frontend
- **Web Components API**: Custom Elements v1, Shadow DOM
- **Chart.js**: Gráficos interactivos (CDN)
- **CSS3**: Variables CSS, Grid, Flexbox

## 📝 Notas Importantes

1. **Puerto**: La aplicación corre exclusivamente en el puerto **3001**
2. **Base de datos**: El archivo `expenses.db` se crea automáticamente en la raíz del proyecto
3. **Categorías por defecto**: 8 categorías predefinidas (Alimentación, Transporte, Vivienda, etc.)
4. **Datos persistentes**: Los gastos se guardan permanentemente en SQLite

## 🐛 Solución de Problemas

### El servidor no arranca
- Verifica que el puerto 3001 no esté siendo usado por otra aplicación
- Asegúrate de haber ejecutado `npm install`

### Los datos no persisten
- Verifica que el archivo `expenses.db` exista en el directorio raíz
- Comprueba los permisos de escritura en la carpeta del proyecto

### Error al cargar Chart.js
- Verifica tu conexión a internet (Chart.js se carga desde CDN)
- Alternativamente, descarga Chart.js localmente

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto para aprender o en producción.

---

**¡Disfruta gestionando tus finanzas!** 💰✨
