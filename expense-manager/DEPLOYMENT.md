# 🚀 Guía de Despliegue - Gestor de Gastos Personales

Esta guía te ayudará a desplegar la aplicación en diferentes entornos.

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm o yarn
- Acceso a un servidor o servicio de hosting

## 🌐 Opciones de Despliegue

### 1. Despliegue en Servidor VPS (Ubuntu/Debian)

#### Instalación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2
```

#### Configurar la Aplicación

```bash
# Clonar o subir el proyecto
cd /var/www/expense-manager

# Instalar dependencias
npm install --production

# Crear archivo .env
cp .env.example .env
nano .env  # Editar configuración
```

#### Configurar PM2

```bash
# Iniciar aplicación con PM2
pm2 start server/index.js --name expense-manager

# Guardar configuración de PM2
pm2 save

# Configurar inicio automático
pm2 startup systemd
```

#### Configurar Nginx como Reverse Proxy

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/expense-manager
```

Contenido del archivo de configuración:

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:6666;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/expense-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurar firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

#### SSL con Let's Encrypt (Opcional pero recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tudominio.com

# Renovación automática (ya configurada por defecto)
sudo certbot renew --dry-run
```

---

### 2. Despliegue en Docker

#### Crear Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 6666

CMD ["node", "server/index.js"]
```

#### Crear docker-compose.yml

```yaml
version: '3.8'

services:
  expense-manager:
    build: .
    container_name: expense-manager
    restart: unless-stopped
    ports:
      - "6666:6666"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=6666
      - DATABASE_PATH=/app/data/expenses.db
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:6666/api/summary"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Ejecutar con Docker

```bash
# Construir imagen
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener aplicación
docker-compose down
```

---

### 3. Despliegue en Render

1. Crear cuenta en [Render](https://render.com)

2. Crear nuevo Web Service

3. Conectar repositorio de GitHub

4. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     PORT=6666
     DATABASE_PATH=./data/expenses.db
     ```

5. Deploy automático en cada push

---

### 4. Despliegue en Railway

1. Crear cuenta en [Railway](https://railway.app)

2. Nuevo proyecto → Deploy from GitHub repo

3. Configurar variables de entorno en Railway Dashboard

4. Railway detectará automáticamente el package.json

---

### 5. Despliegue en Heroku

#### Crear Procfile

```
web: node server/index.js
```

#### Comandos de Despliegue

```bash
# Instalar Heroku CLI
# Luego:

heroku login
heroku create expense-manager-app
heroku config:set NODE_ENV=production
heroku config:set PORT=6666
git push heroku main
heroku open
```

---

## 🔧 Configuración de Producción

### Variables de Entorno (.env)

```env
# Server Configuration
PORT=6666
NODE_ENV=production

# Database Configuration
DATABASE_PATH=./data/expenses.db

# Security (opcional)
CORS_ORIGIN=https://tudominio.com
```

### Optimizaciones de Producción

```bash
# Instalar solo dependencias de producción
npm ci --only=production

# Habilitar cache de Node.js
export NODE_ENV=production

# Usar cluster mode en PM2
pm2 start server/index.js -i max --name expense-manager
```

---

## 📊 Monitoreo y Logs

### PM2 Logs

```bash
# Ver logs en tiempo real
pm2 logs expense-manager

# Ver información detallada
pm2 show expense-manager

# Reiniciar aplicación
pm2 restart expense-manager

# Detener aplicación
pm2 stop expense-manager
```

### Logs de Nginx

```bash
# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de error
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 Seguridad en Producción

### Firewall (UFW)

```bash
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable
```

### Actualizaciones Automáticas

```bash
# Instalar unattended-upgrades
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Backup de Base de Datos

```bash
# Script de backup (backup.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/expense-manager/data/expenses.db /backups/expenses_$DATE.db
find /backups -name "expenses_*.db" -mtime +7 -delete
```

```bash
# Agregar a crontab
crontab -e
# 0 2 * * * /var/www/expense-manager/backup.sh
```

---

## 🧪 Testing Post-Despliegue

```bash
# Verificar que la API responde
curl http://tudominio.com/api/summary

# Verificar endpoints principales
curl http://tudominio.com/api/expenses
curl http://tudominio.com/api/categories

# Verificar frontend
curl http://tudominio.com
```

---

## 🆘 Troubleshooting

### La aplicación no inicia

```bash
# Verificar logs
pm2 logs expense-manager --lines 50

# Verificar puerto
netstat -tulpn | grep 6666

# Verificar permisos
ls -la data/
chmod 755 data/
```

### Errores de base de datos

```bash
# Verificar que SQLite está instalado
node -e "require('better-sqlite3')"

# Re-inicializar BD (backup primero!)
rm data/expenses.db
npm start  # Se creará automáticamente
```

### Problemas de CORS

Verificar configuración en `server/index.js`:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
```

---

## 📈 Escalamiento

### Horizontal con Load Balancer

```nginx
upstream expense_manager {
    server localhost:6666;
    server localhost:6667;
    server localhost:6668;
}

server {
    location / {
        proxy_pass http://expense_manager;
    }
}
```

### Base de Datos Externa

Para escalar, considerar migrar a:
- PostgreSQL
- MySQL
- MongoDB

Actualizar conexión en `server/models/database.js`

---

**¡Tu aplicación está lista para producción! 🎉**
