#!/bin/bash

# Script para actualizar Content Security Policy
# Permite el widget de gentsdev.com en la aplicación

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
APP_NAME="psi-mammoliti"
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

echo -e "${BLUE}🔧 Actualizando Content Security Policy para permitir widget de gentsdev.com${NC}"
echo "======================================================================="

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root (sudo)"
fi

# Verificar que nginx está instalado
if ! command -v nginx >/dev/null 2>&1; then
    error "nginx no está instalado"
fi

# Verificar que el archivo de configuración existe
if [ ! -f "$NGINX_CONFIG" ]; then
    error "Archivo de configuración nginx no encontrado: $NGINX_CONFIG"
fi

log "Realizando backup de la configuración actual..."
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

log "Actualizando Content Security Policy..."

# Crear la nueva configuración CSP
NEW_CSP="add_header Content-Security-Policy \"
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com data:;
        img-src 'self' data: https: blob: http://www.gentsdev.com https://www.gentsdev.com;
        connect-src 'self' wss: https: http://www.gentsdev.com https://www.gentsdev.com;
        frame-src http://www.gentsdev.com https://www.gentsdev.com;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
    \" always;"

# Usar sed para reemplazar la sección CSP completa
sed -i '/add_header Content-Security-Policy/,/\" always;/c\
    # CSP actualizado para widget de gentsdev.com\
    add_header Content-Security-Policy "\
        default-src '\''self'\'';\
        script-src '\''self'\'' '\''unsafe-eval'\'' '\''unsafe-inline'\'';\
        style-src '\''self'\'' '\''unsafe-inline'\'' https://fonts.googleapis.com;\
        font-src '\''self'\'' https://fonts.gstatic.com data:;\
        img-src '\''self'\'' data: https: blob: http://www.gentsdev.com https://www.gentsdev.com;\
        connect-src '\''self'\'' wss: https: http://www.gentsdev.com https://www.gentsdev.com;\
        frame-src http://www.gentsdev.com https://www.gentsdev.com;\
        frame-ancestors '\''none'\'';\
        base-uri '\''self'\'';\
        form-action '\''self'\'';\
        upgrade-insecure-requests;\
    " always;' "$NGINX_CONFIG"

# Verificar que la configuración sea válida
log "Verificando configuración de nginx..."
if nginx -t 2>/dev/null; then
    info "✅ Configuración nginx es válida"
else
    error "❌ Error en la configuración nginx. Restaurando backup..."
    cp "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)" "$NGINX_CONFIG"
    exit 1
fi

# Reiniciar nginx
log "Reiniciando nginx..."
systemctl restart nginx

# Verificar que nginx está funcionando
if systemctl is-active --quiet nginx; then
    info "✅ nginx reiniciado correctamente"
else
    error "❌ nginx no se reinició correctamente"
fi

echo ""
echo -e "${GREEN}🎉 ¡Content Security Policy actualizada exitosamente!${NC}"
echo ""
echo -e "${YELLOW}📋 Cambios realizados:${NC}"
echo -e "  ✅ Permitir conexiones a gentsdev.com (connect-src)"
echo -e "  ✅ Permitir iframes de gentsdev.com (frame-src)"
echo -e "  ✅ Permitir imágenes de gentsdev.com (img-src)"
echo ""
echo -e "${BLUE}🔧 Archivo de configuración: $NGINX_CONFIG${NC}"
echo -e "${BLUE}💾 Backup creado: ${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)${NC}"
echo ""
echo -e "${GREEN}El widget de gentsdev.com ahora debería funcionar correctamente.${NC}"