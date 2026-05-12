# Changelog

Todos los cambios notables a este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adherido a versionado semántico [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2024-01-XX

### Added
- ✨ Implementación completa del gestor de gastos personales
- 🎨 Frontend con Web Components (Vanilla JS) y Shadow DOM
- 🔧 Backend RESTful con Node.js y Express
- 💾 Persistencia de datos con SQLite (better-sqlite3)
- 📊 Dashboard con estadísticas y gráficos
- 🏷️ Sistema de categorías personalizables con colores
- ➕ CRUD completo de gastos (crear, leer, actualizar, eliminar)
- 📤 Exportación de datos a JSON
- 📥 Importación de datos desde backup
- 🔍 Filtrado por categoría y paginación
- 🎯 Validaciones de formulario (monto, fecha, descripción)
- 📱 Diseño responsive mobile-first
- ♿ Accesibilidad WCAG 2.1 AA
- 🔒 Seguridad: sanitización de inputs, CORS, protección XSS
- 🧪 Tests unitarios y de integración (Jest + Supertest)
- 📝 Documentación completa (README, DEPLOYMENT)
- 🐳 Configuración Docker y docker-compose
- 🚀 Scripts de inicialización y seed de datos
- ⚙️ Configuración ESLint y Prettier
- 🔄 CI/CD con GitHub Actions
- 📄 Archivos para despliegue en Render, Heroku, Railway

### Technical Details
- Puerto: 6666
- Node.js >= 18.0.0
- Express 5.x
- better-sqlite3 para base de datos embebida
- Web Components nativos sin frameworks
- CSS encapsulado con Shadow DOM

---

## [Unreleased]
- Planificado: Autenticación de usuarios
- Planificado: Multi-moneda
- Planificado: Presupuestos mensuales
- Planificado: Notificaciones push
- Planificado: Modo oscuro
