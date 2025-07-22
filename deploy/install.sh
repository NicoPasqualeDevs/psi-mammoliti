#!/bin/bash

# Script de instalación rápida para psi-mammoliti
# Descarga el repositorio y ejecuta el despliegue completo

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables por defecto
REPO_URL=""
BRANCH="main"
DOMAIN_NAME="${DOMAIN_NAME:-localhost}"
INSTALL_DIR="/tmp/psi-mammoliti-deploy"

echo -e "${BLUE}🚀 Instalador rápido de Psi Mammoliti${NC}"
echo "==========================================="

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

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root (sudo)"
fi

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Uso: $0 <URL_DEL_REPOSITORIO> [rama] [dominio]${NC}"
    echo ""
    echo "Ejemplos:"
    echo "  $0 https://github.com/usuario/psi-mammoliti.git"
    echo "  $0 https://github.com/usuario/psi-mammoliti.git main mi-dominio.com"
    echo ""
    exit 1
fi

REPO_URL="$1"
if [ ! -z "$2" ]; then
    BRANCH="$2"
fi
if [ ! -z "$3" ]; then
    DOMAIN_NAME="$3"
fi

log "Configuración:"
echo "  📁 Repositorio: $REPO_URL"
echo "  🌿 Rama: $BRANCH"
echo "  🌐 Dominio: $DOMAIN_NAME"
echo ""

# Verificar git
if ! command -v git &> /dev/null; then
    log "Instalando git..."
    apt-get update -y
    apt-get install -y git
fi

# Limpiar directorio temporal si existe
if [ -d "$INSTALL_DIR" ]; then
    log "Limpiando instalación anterior..."
    rm -rf "$INSTALL_DIR"
fi

# Clonar repositorio
log "Clonando repositorio..."
git clone -b "$BRANCH" "$REPO_URL" "$INSTALL_DIR"

# Verificar que existe el script de despliegue
if [ ! -f "$INSTALL_DIR/deploy/deploy.sh" ]; then
    error "No se encontró el script de despliegue en $INSTALL_DIR/deploy/deploy.sh"
fi

# Hacer ejecutables los scripts
chmod +x "$INSTALL_DIR/deploy/deploy.sh"
chmod +x "$INSTALL_DIR/deploy/verify.sh"

# Configurar variables de entorno
export DOMAIN_NAME="$DOMAIN_NAME"

# Cambiar al directorio del proyecto
cd "$INSTALL_DIR"

log "Iniciando despliegue automatizado..."
echo ""

# Ejecutar script de despliegue
./deploy/deploy.sh

echo ""
log "Ejecutando verificación del sistema..."
echo ""

# Ejecutar verificación
./deploy/verify.sh

# Limpiar archivos temporales
log "Limpiando archivos temporales..."
rm -rf "$INSTALL_DIR"

echo ""
echo -e "${GREEN}🎉 ¡Instalación completada!${NC}"
echo ""
echo -e "${YELLOW}📋 Resumen:${NC}"
echo -e "  🌐 Tu aplicación está disponible en: ${BLUE}http://$DOMAIN_NAME${NC}"
echo -e "  📁 Directorio de aplicación: ${BLUE}/var/www/psi-mammoliti${NC}"
echo -e "  📊 Logs: ${BLUE}/var/log/psi-mammoliti/${NC}"
echo ""
echo -e "${YELLOW}🛠️ Comandos útiles:${NC}"
echo "  psi-mammoliti-manage status    # Ver estado"
echo "  psi-mammoliti-manage restart   # Reiniciar"
echo "  psi-mammoliti-manage logs      # Ver logs"
echo "" 