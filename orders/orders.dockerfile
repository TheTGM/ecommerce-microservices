# orders/Dockerfile
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de configuración de npm
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código de la aplicación
COPY . .

# Crear directorio para la base de datos
RUN mkdir -p data

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "index.js"]