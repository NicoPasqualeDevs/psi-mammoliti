#!/bin/bash

# Script para configurar SSL con Certbot
# Debe ejecutarse después de deploy.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
DOMAIN_NAME="${DOMAIN_NAME:-global-deer.com}"
APP_NAME="psi-mammoliti"
EMAIL="admin@${DOMAIN_NAME}"

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

# Instalar Certbot y plugin de nginx
log "Instalando Certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Verificar que nginx está instalado y corriendo
if ! systemctl is-active --quiet nginx; then
    error "nginx no está corriendo. Ejecuta deploy.sh primero."
fi

# Obtener certificado SSL
log "Obteniendo certificado SSL para ${DOMAIN_NAME}..."
certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    --domains "${DOMAIN_NAME}" \
    --redirect \
    --keep-until-expiring

# Verificar la instalación
if [ $? -eq 0 ]; then
    log "✅ Certificado SSL instalado correctamente"
    
    # Configurar renovación automática
    log "Configurando renovación automática..."
    systemctl enable certbot.timer
    systemctl start certbot.timer
    
    # Verificar estado de renovación
    certbot certificates
    
    echo -e "\n${GREEN}🔒 ¡Configuración SSL completada!${NC}"
    echo -e "Tu sitio ahora está disponible en: ${GREEN}https://${DOMAIN_NAME}${NC}"
    echo -e "\nPróxima renovación automática: $(systemctl status certbot.timer | grep 'Next')"
else
    error "❌ Error al obtener el certificado SSL"
fi 