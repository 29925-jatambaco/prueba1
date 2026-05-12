# Instrucciones para Ejecutar en Windows

## ✅ Cambios Realizados

El proyecto ha sido actualizado para ser compatible con Windows:

1. **Base de datos cambiada**: De `better-sqlite3` (nativo, incompatible con algunos sistemas Windows) a `sql.js` (JavaScript puro, 100% compatible)
2. **Todos los modelos actualizados** para usar la nueva API de sql.js
3. **Servidor configurado** para inicialización asíncrona

## 📋 Requisitos Previos

- Node.js v18 o superior ([Descargar aquí](https://nodejs.org/))
- PowerShell o CMD

## 🚀 Pasos de Instalación y Ejecución

### 1. Abrir PowerShell o CMD como administrador (opcional pero recomendado)

```powershell
cd C:\PIC\ProyectoP1\prueba1-main\prueba1-main\expense-manager
```

### 2. Instalar dependencias

```powershell
npm install
```

### 3. (Opcional) Configurar variables de entorno

```powershell
Copy-Item .env.example .env
```

### 4. Iniciar el servidor

**Para desarrollo:**
```powershell
npm run dev
```

**Para producción:**
```powershell
npm start
```

### 5. Abrir en el navegador

Visita: http://localhost:6666

## 🗄️ Base de Datos

- **Tipo**: SQLite (usando sql.js)
- **Ubicación**: `data/expenses.db`
- **Datos iniciales**: El sistema crea automáticamente 8 categorías por defecto y datos de prueba

## 🔧 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala todas las dependencias |
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor en modo desarrollo con auto-recarga |
| `npm test` | Ejecuta los tests |
| `npm run lint` | Verifica el estilo de código |
| `npm run seed` | Inserta datos de prueba en la base de datos |

## 📊 Endpoints de la API

Una vez iniciado el servidor, puedes probar:

- `GET http://localhost:6666/api/categories` - Listar categorías
- `GET http://localhost:6666/api/expenses` - Listar gastos
- `GET http://localhost:6666/api/summary` - Resumen estadístico

## ❓ Solución de Problemas

### Error: "Cannot find module 'sql.js'"
```powershell
npm install sql.js
```

### Error: "Port 6666 already in use"
```powershell
# Detener procesos en el puerto 6666
netstat -ano | findstr :6666
taskkill /PID <PID> /F
```

### Error: "Database not initialized"
Reinicia el servidor. La base de datos se crea automáticamente en la primera ejecución.

### Error: Permisos en Windows
Ejecuta PowerShell como Administrador o cambia los permisos de la carpeta `data`.

## 📝 Notas Importantes

- La base de datos se guarda en `data/expenses.db`
- Los datos se persisten automáticamente después de cada operación
- El servidor usa CORS habilitado para permitir conexiones desde cualquier origen
- Todos los inputs son sanitizados para prevenir XSS

## 🎉 ¡Listo!

Tu aplicación de gestión de gastos debería estar funcionando correctamente en Windows.
