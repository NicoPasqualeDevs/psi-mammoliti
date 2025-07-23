#!/bin/bash

# Script para configurar la base de datos SQLite
# Debe ejecutarse después de deploy.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
APP_NAME="psi-mammoliti"
APP_DIR="/var/www/$APP_NAME"
DB_DIR="$APP_DIR/backend"
DB_FILE="$DB_DIR/database.sqlite"

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root (sudo)"
fi

# Instalar SQLite
log "Instalando SQLite..."
apt-get update
apt-get install -y sqlite3

# Crear directorio de base de datos si no existe
log "Configurando directorio de base de datos..."
mkdir -p "$DB_DIR"
chown -R www-data:www-data "$DB_DIR"
chmod 755 "$DB_DIR"

# Verificar si la base de datos existe
if [ ! -f "$DB_FILE" ]; then
    log "Inicializando base de datos..."
    cd "$APP_DIR"
    
    # Instalar dependencias del backend
    log "Instalando dependencias del backend..."
    npm install sqlite3
    
    # Ejecutar script de migración
    log "Ejecutando migración inicial..."
    node backend/migrate.js
    
    # Ajustar permisos de la base de datos
    chown www-data:www-data "$DB_FILE"
    chmod 644 "$DB_FILE"
else
    log "Base de datos ya existe en $DB_FILE"
fi

# Verificar que la base de datos es accesible
if sqlite3 "$DB_FILE" "SELECT 1;" &>/dev/null; then
    log "✅ Base de datos configurada correctamente"
else
    error "❌ Error al acceder a la base de datos"
fi

echo -e "\n${GREEN}🎉 Configuración de base de datos completada${NC}" 