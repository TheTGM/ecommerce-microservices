#!/bin/bash
# init-dev.sh

echo "🚀 Inicializando entorno de desarrollo de microservicios..."

# Crear archivos .env si no existen
if [ ! -f orders/.env ]; then
    cp orders/.env.example orders/.env
    echo "✅ Creado archivo .env para servicio de órdenes"
fi

if [ ! -f payments/.env ]; then
    cp payments/.env.example payments/.env
    echo "✅ Creado archivo .env para servicio de pagos"
fi

# Instalar dependencias
echo "📦 Instalando dependencias del servicio de órdenes..."
cd orders && npm install

echo "📦 Instalando dependencias del servicio de pagos..."
cd ../payments && npm install

# Inicializar bases de datos
echo "🗄️ Inicializando base de datos de órdenes..."
cd ../orders && npm run init-db

echo "🗄️ Inicializando base de datos de pagos..."
cd ../payments && npm run init-db

echo "✅ Entorno de desarrollo inicializado correctamente"
echo "🚀 Para iniciar los servicios, ejecuta: docker-compose up"