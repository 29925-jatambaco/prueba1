# Gestor de Gastos Personales - Versión Ligera

Una aplicación web moderna y ligera para gestionar gastos personales, construida con **Web Components** y **Node.js/Express**, utilizando un archivo JSON como base de datos para máxima compatibilidad.

## 🚀 Características

- **Arquitectura Modular**: Web Components nativos sin frameworks
- **Base de Datos Ligera**: Archivo JSON (sin dependencias nativas)
- **100% Compatible**: Funciona en Windows, Mac y Linux sin errores de compilación
- **Responsive Design**: Mobile-first
- **Shadow DOM**: Encapsulamiento total de estilos
- **API RESTful**: Endpoints completos para CRUD

## 📁 Estructura del Proyecto

```
expense-manager/
├── client/
│   ├── components/
│   │   ├── expense-form.js
│   │   ├── expense-list.js
│   │   ├── expense-summary.js
│   │   └── category-filter.js
│   └── index.html
├── server/
│   └── index.js
├── data/
│   └── db.json (generado automáticamente)
├── package.json
└── README.md
```

## 🛠️ Instalación

### Requisitos Previos
- Node.js v18 o superior

### Pasos de Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor
npm start

# O para desarrollo con auto-recarga
npm run dev
```

La aplicación estará disponible en: **http://localhost:6666**

## 📊 Funcionalidades

### Gestión de Gastos
- ✅ Crear nuevo gasto (monto, categoría, fecha, descripción)
- ✅ Editar gastos existentes
- ✅ Eliminar gastos
- ✅ Listar con paginación (5 por página)

### Categorías
- ✅ 5 categorías predefinidas
- ✅ Filtro por categoría
- ✅ Colores distintivos

### Dashboard
- ✅ Total gastado en el mes actual
- ✅ Distribución por categoría
- ✅ Contador de gastos

### Exportación
- ✅ Exportar datos a JSON
- ✅ Backup automático

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/expenses` | Listar todos los gastos |
| POST | `/api/expenses` | Crear nuevo gasto |
| PUT | `/api/expenses/:id` | Actualizar gasto |
| DELETE | `/api/expenses/:id` | Eliminar gasto |
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| GET | `/api/summary` | Resumen estadístico |

## 🧪 Uso de la Aplicación

1. **Abrir el navegador** en `http://localhost:6666`
2. **Ver el dashboard** con el resumen del mes
3. **Agregar un gasto** usando el formulario
4. **Filtrar por categoría** desde el selector
5. **Exportar datos** con el botón "Exportar JSON"

## 📝 Validaciones

- Monto debe ser mayor a 0
- Categoría es obligatoria
- Fecha válida requerida
- Descripción máxima 200 caracteres

## 🔒 Seguridad

- Sanitización de inputs
- Protección contra XSS
- CORS configurado
- Validaciones en cliente y servidor

## 📦 Publicar en GitHub

```bash
git init
git add .
git commit -m "feat: Initial commit - Expense Manager Lite"
git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git
git branch -M main
git push -u origin main
```

## ⚠️ Notas Importantes

- La base de datos (`data/db.json`) se genera automáticamente si no existe
- El archivo `.gitignore` excluye `node_modules/` y `data/db.json`
- No requiere compilación ni pasos adicionales
- Compatible con Node.js v18+

## 📄 Licencia

MIT License
