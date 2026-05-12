FROM node:20-alpine

# Instalar dependencias del sistema necesarias para better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de package
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto de la aplicación
COPY . .

# Crear directorio de datos
RUN mkdir -p data && chmod 755 data

# Exponer puerto
EXPOSE 6666

# Variable de entorno para producción
ENV NODE_ENV=production
ENV PORT=6666
ENV DATABASE_PATH=/app/data/expenses.db

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:6666/api/summary || exit 1

# Comando de inicio
CMD ["node", "server/index.js"]
