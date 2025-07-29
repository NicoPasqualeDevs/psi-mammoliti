#!/bin/bash

# Script de diagnóstico SSL simplificado
# Detecta problemas comunes de configuración SSL

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
DOMAIN_NAME="${DOMAIN_NAME:-global-deer.com}"
APP_NAME="psi-mammoliti"
NGINX_SSL_DIR="/etc/nginx/ssl"

echo -e "${BLUE}🔍 Diagnóstico SSL Simplificado para $DOMAIN_NAME${NC}"
echo "=================================================="

# Contadores
ISSUES_FOUND=0

# Función para reportar problemas
report_issue() {
    echo -e "${RED}❌ $1${NC}"
    ((ISSUES_FOUND++))
}

# Función para reportar éxito
report_ok() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para reportar información
report_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Verificar nginx
echo -e "\n${BLUE}📋 Verificando nginx...${NC}"
if systemctl is-active --quiet nginx; then
    report_ok "nginx está corriendo"
else
    report_issue "nginx no está corriendo"
fi

if nginx -t &>/dev/null; then
    report_ok "Configuración nginx es válida"
else
    report_issue "Error en configuración nginx"
    echo "Ejecuta 'nginx -t' para ver detalles"
fi

# 2. Verificar archivos SSL
echo -e "\n${BLUE}📋 Verificando archivos SSL...${NC}"
if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" ]; then
    report_ok "Certificado existe"
    
    # Verificar validez del certificado
    if openssl x509 -in "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" -noout -text >/dev/null 2>&1; then
        report_ok "Certificado es válido"
        
        # Mostrar información del certificado
        expiry=$(openssl x509 -noout -enddate -in "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" 2>/dev/null | sed 's/notAfter=//')
        report_info "Expira: $expiry"
    else
        report_issue "Certificado no es válido"
    fi
else
    report_issue "Certificado no existe en $NGINX_SSL_DIR/${DOMAIN_NAME}.crt"
fi

if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.key" ]; then
    report_ok "Clave privada existe"
    
    # Verificar permisos
    perms=$(stat -c %a "$NGINX_SSL_DIR/${DOMAIN_NAME}.key" 2>/dev/null || echo "000")
    if [ "$perms" = "600" ]; then
        report_ok "Permisos de clave privada correctos (600)"
    else
        report_issue "Permisos de clave privada incorrectos ($perms, debería ser 600)"
    fi
    
    # Verificar validez de la clave
    if openssl rsa -in "$NGINX_SSL_DIR/${DOMAIN_NAME}.key" -check -noout >/dev/null 2>&1; then
        report_ok "Clave privada es válida"
    else
        report_issue "Clave privada no es válida o está corrupta"
    fi
else
    report_issue "Clave privada no existe en $NGINX_SSL_DIR/${DOMAIN_NAME}.key"
fi

# 3. Verificar que certificado y clave coinciden
if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" ] && [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.key" ]; then
    echo -e "\n${BLUE}📋 Verificando coincidencia cert/clave...${NC}"
    
    cert_mod=$(openssl x509 -noout -modulus -in "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" 2>/dev/null | openssl md5 2>/dev/null || echo "error")
    key_mod=$(openssl rsa -noout -modulus -in "$NGINX_SSL_DIR/${DOMAIN_NAME}.key" 2>/dev/null | openssl md5 2>/dev/null || echo "error")
    
    if [ "$cert_mod" != "error" ] && [ "$key_mod" != "error" ] && [ "$cert_mod" = "$key_mod" ]; then
        report_ok "Certificado y clave privada coinciden"
    else
        report_issue "Certificado y clave privada NO coinciden"
    fi
fi

# 4. Verificar conectividad
echo -e "\n${BLUE}📋 Verificando conectividad...${NC}"

# Puerto 443
if netstat -tlpn 2>/dev/null | grep -q ":443.*nginx" || ss -tlpn 2>/dev/null | grep -q ":443.*nginx"; then
    report_ok "nginx escucha en puerto 443"
else
    report_issue "nginx NO escucha en puerto 443"
fi

# Conectividad local HTTPS
if curl -s -k -I "https://localhost" --max-time 5 >/dev/null 2>&1; then
    report_ok "Conectividad HTTPS local funciona"
else
    report_issue "Conectividad HTTPS local falla"
fi

# 5. Test específico del dominio
echo -e "\n${BLUE}📋 Verificando dominio $DOMAIN_NAME...${NC}"
if command -v dig >/dev/null 2>&1; then
    ip_address=$(dig +short "$DOMAIN_NAME" 2>/dev/null | tail -1)
    if [ -n "$ip_address" ]; then
        report_info "DNS resuelve a: $ip_address"
    else
        report_info "DNS no resuelve (normal para testing local)"
    fi
fi

# Test SSL del dominio
if echo | openssl s_client -connect "${DOMAIN_NAME}:443" -servername "$DOMAIN_NAME" -verify_return_error </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    report_ok "Certificado SSL verifica correctamente para $DOMAIN_NAME"
else
    report_info "Verificación SSL externa falló (puede ser normal si el dominio no apunta aquí)"
fi

# 6. Información de diagnóstico
echo -e "\n${BLUE}📊 Información de diagnóstico:${NC}"
echo "============================================"

# Archivos SSL disponibles
echo "Archivos SSL encontrados:"
if [ -d "$NGINX_SSL_DIR" ]; then
    ls -la "$NGINX_SSL_DIR/" 2>/dev/null | grep "${DOMAIN_NAME}" || echo "  Ningún archivo SSL para $DOMAIN_NAME"
else
    echo "  Directorio SSL no existe: $NGINX_SSL_DIR"
fi

# Configuración nginx
echo ""
echo "Configuración nginx SSL:"
if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
    if grep -q "ssl_certificate" "/etc/nginx/sites-available/$APP_NAME"; then
        echo "  ✅ SSL configurado en nginx"
        # Mostrar líneas SSL importantes
        grep -E "(ssl_certificate|listen.*443)" "/etc/nginx/sites-available/$APP_NAME" | head -3
    else
        echo "  ❌ SSL NO configurado en nginx"
    fi
else
    echo "  ❌ Archivo de configuración nginx no encontrado"
fi

# Logs recientes
echo ""
echo "Logs SSL recientes:"
if [ -f "/var/log/nginx/${APP_NAME}_ssl_error.log" ]; then
    echo "Últimos errores SSL:"
    tail -3 "/var/log/nginx/${APP_NAME}_ssl_error.log" 2>/dev/null | sed 's/^/  /' || echo "  Sin errores recientes"
else
    echo "  Sin logs SSL disponibles"
fi

# 7. Resumen y recomendaciones
echo -e "\n${BLUE}📊 Resumen del diagnóstico:${NC}"
echo "============================================"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡SSL está funcionando correctamente!${NC}"
    echo ""
    echo "Tu sitio está disponible en: https://$DOMAIN_NAME"
else
    echo -e "${RED}⚠️  Se encontraron $ISSUES_FOUND problema(s) de SSL${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Soluciones sugeridas:${NC}"
    
    if ! systemctl is-active --quiet nginx; then
        echo "1. Iniciar nginx: sudo systemctl start nginx"
    fi
    
    if [ ! -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" ] || [ ! -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.key" ]; then
        echo "2. Configurar certificados SSL:"
        echo "   sudo ./deploy/setup-ssl-existing.sh  # Para certificados existentes"
        echo "   sudo ./deploy/setup-ssl.sh          # Para generar con Certbot"
    fi
    
    if ! nginx -t &>/dev/null; then
        echo "3. Corregir configuración nginx:"
        echo "   nginx -t  # Ver errores específicos"
    fi
    
    echo ""
    echo "Para configuración completa: ./deploy/verify-ssl.sh"
fi

exit $ISSUES_FOUND