#!/bin/bash

# Script de verificación para psi-mammoliti
# Comprueba que todos los servicios estén funcionando correctamente

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables de configuración
APP_NAME="psi-mammoliti"
APP_DIR="/var/www/$APP_NAME"
SERVICE_PORT="3000"
DOMAIN_NAME="${DOMAIN_NAME:-localhost}"

echo -e "${BLUE}🔍 Verificando despliegue de $APP_NAME${NC}"
echo "============================================"

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0

# Función para tests
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

# Función para mostrar información
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Verificar que nginx está instalado y corriendo
echo -e "\n${BLUE}📋 Verificando nginx...${NC}"
if systemctl is-active --quiet nginx; then
    test_result 0 "nginx está corriendo"
    nginx_version=$(nginx -v 2>&1 | cut -d' ' -f3)
    info "Versión de nginx: $nginx_version"
else
    test_result 1 "nginx no está corriendo"
fi

# Test 2: Verificar configuración de nginx
if nginx -t &>/dev/null; then
    test_result 0 "Configuración de nginx es válida"
else
    test_result 1 "Error en configuración de nginx"
fi

# Test 3: Verificar que el sitio está habilitado
if [ -L "/etc/nginx/sites-enabled/$APP_NAME" ]; then
    test_result 0 "Sitio nginx está habilitado"
else
    test_result 1 "Sitio nginx no está habilitado"
fi

# Test 4: Verificar Node.js y npm
echo -e "\n${BLUE}📋 Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    node_version=$(node --version)
    test_result 0 "Node.js está instalado"
    info "Versión de Node.js: $node_version"
else
    test_result 1 "Node.js no está instalado"
fi

if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    test_result 0 "npm está instalado"
    info "Versión de npm: $npm_version"
else
    test_result 1 "npm no está instalado"
fi

# Test 5: Verificar PM2
echo -e "\n${BLUE}📋 Verificando PM2...${NC}"
if command -v pm2 &> /dev/null; then
    test_result 0 "PM2 está instalado"
    pm2_version=$(pm2 --version)
    info "Versión de PM2: $pm2_version"
else
    test_result 1 "PM2 no está instalado"
fi

# Test 6: Verificar aplicación con PM2
if pm2 list | grep -q "$APP_NAME"; then
    if pm2 list | grep "$APP_NAME" | grep -q "online"; then
        test_result 0 "Aplicación está corriendo en PM2"
    else
        test_result 1 "Aplicación existe en PM2 pero no está online"
    fi
else
    test_result 1 "Aplicación no está registrada en PM2"
fi

# Test 7: Verificar directorio de aplicación
echo -e "\n${BLUE}📋 Verificando archivos de aplicación...${NC}"
if [ -d "$APP_DIR" ]; then
    test_result 0 "Directorio de aplicación existe"
    
    if [ -f "$APP_DIR/package.json" ]; then
        test_result 0 "package.json existe"
    else
        test_result 1 "package.json no existe"
    fi
    
    if [ -d "$APP_DIR/build" ]; then
        test_result 0 "Directorio build existe"
    else
        test_result 1 "Directorio build no existe"
    fi
    
    if [ -f "$APP_DIR/ecosystem.config.js" ]; then
        test_result 0 "Configuración PM2 existe"
    else
        test_result 1 "Configuración PM2 no existe"
    fi
else
    test_result 1 "Directorio de aplicación no existe"
fi

# Test 8: Verificar conectividad interna
echo -e "\n${BLUE}📋 Verificando conectividad...${NC}"
if curl -s -f "http://localhost:$SERVICE_PORT" > /dev/null; then
    test_result 0 "Aplicación responde en puerto $SERVICE_PORT"
else
    test_result 1 "Aplicación no responde en puerto $SERVICE_PORT"
fi

# Test 9: Verificar proxy nginx
if curl -s -f "http://localhost" > /dev/null; then
    test_result 0 "nginx proxy funciona correctamente"
else
    test_result 1 "nginx proxy no funciona"
fi

# Test 10: Verificar logs
echo -e "\n${BLUE}📋 Verificando logs...${NC}"
if [ -d "/var/log/$APP_NAME" ]; then
    test_result 0 "Directorio de logs existe"
    
    if [ -f "/var/log/$APP_NAME/combined.log" ]; then
        test_result 0 "Log combinado existe"
    else
        test_result 1 "Log combinado no existe"
    fi
else
    test_result 1 "Directorio de logs no existe"
fi

# Test 11: Verificar firewall
echo -e "\n${BLUE}📋 Verificando firewall...${NC}"
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        test_result 0 "Firewall está activo"
        
        if ufw status | grep -q "80"; then
            test_result 0 "Puerto 80 está abierto"
        else
            test_result 1 "Puerto 80 no está abierto"
        fi
    else
        test_result 1 "Firewall no está activo"
    fi
else
    test_result 1 "ufw no está instalado"
fi

# Test 12: Verificar script de gestión
echo -e "\n${BLUE}📋 Verificando scripts de gestión...${NC}"
if [ -f "/usr/local/bin/$APP_NAME-manage" ]; then
    if [ -x "/usr/local/bin/$APP_NAME-manage" ]; then
        test_result 0 "Script de gestión existe y es ejecutable"
    else
        test_result 1 "Script de gestión no es ejecutable"
    fi
else
    test_result 1 "Script de gestión no existe"
fi

# Información del sistema
echo -e "\n${BLUE}📊 Información del sistema:${NC}"
echo "============================================"
info "Sistema operativo: $(lsb_release -d | cut -f2)"
info "Memoria disponible: $(free -h | awk '/^Mem:/ {print $7}')"
info "Espacio en disco: $(df -h / | awk 'NR==2 {print $4}')"
info "Uptime: $(uptime -p)"

# Información de la aplicación
echo -e "\n${BLUE}📱 Información de la aplicación:${NC}"
echo "============================================"
info "URL de la aplicación: http://$DOMAIN_NAME"
info "Puerto interno: $SERVICE_PORT"
info "Directorio: $APP_DIR"

# Estado de servicios
echo -e "\n${BLUE}🔧 Estado de servicios:${NC}"
echo "============================================"
echo "nginx:"
systemctl status nginx --no-pager -l | head -3

echo -e "\nPM2:"
pm2 status

# Logs recientes
echo -e "\n${BLUE}📋 Logs recientes (últimas 5 líneas):${NC}"
echo "============================================"
if [ -f "/var/log/$APP_NAME/combined.log" ]; then
    echo "Aplicación:"
    tail -5 "/var/log/$APP_NAME/combined.log" 2>/dev/null || echo "No hay logs disponibles"
fi

if [ -f "/var/log/nginx/${APP_NAME}_error.log" ]; then
    echo -e "\nnginx errores:"
    tail -5 "/var/log/nginx/${APP_NAME}_error.log" 2>/dev/null || echo "No hay errores recientes"
fi

# Resumen final
echo -e "\n${BLUE}📊 Resumen de verificación:${NC}"
echo "============================================"
echo -e "Tests pasados: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests fallidos: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ¡Todos los tests pasaron! El despliegue está funcionando correctamente.${NC}"
    exit 0
elif [ $TESTS_FAILED -le 2 ]; then
    echo -e "\n${YELLOW}⚠️  Algunos tests fallaron pero el sistema parece funcional. Revisa los errores.${NC}"
    exit 1
else
    echo -e "\n${RED}💥 Múltiples tests fallaron. El despliegue requiere atención.${NC}"
    exit 2
fi 