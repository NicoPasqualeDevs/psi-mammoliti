#!/bin/bash

# Script de verificación específico para configuración SSL
# Verifica que los certificados SSL estén correctamente configurados para global-deer.com

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
DOMAIN_NAME="global-deer.com"
APP_NAME="psi-mammoliti"
NGINX_SSL_DIR="/etc/nginx/ssl"

echo -e "${BLUE}🔐 Verificación SSL para $DOMAIN_NAME${NC}"
echo "=================================================="

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

# Test 1: Verificar que nginx está corriendo
echo -e "\n${BLUE}📋 Verificando nginx...${NC}"
if systemctl is-active --quiet nginx; then
    test_result 0 "nginx está corriendo"
else
    test_result 1 "nginx no está corriendo"
fi

# Test 2: Verificar configuración nginx SSL
if nginx -t &>/dev/null; then
    test_result 0 "Configuración nginx es válida"
else
    test_result 1 "Error en configuración nginx"
fi

# Test 3: Verificar que los archivos de certificados existen
echo -e "\n${BLUE}📋 Verificando archivos de certificados...${NC}"
if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" ]; then
    test_result 0 "Certificado principal existe"
else
    test_result 1 "Certificado principal no existe"
fi

if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.key" ]; then
    test_result 0 "Clave privada existe"
else
    test_result 1 "Clave privada no existe"
fi

if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}-fullchain.crt" ]; then
    test_result 0 "Certificado completo (fullchain) existe"
else
    test_result 1 "Certificado completo no existe"
fi

# Test 4: Verificar permisos de archivos
echo -e "\n${BLUE}📋 Verificando permisos...${NC}"
if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.key" ]; then
    key_perms=$(stat -c %a "$NGINX_SSL_DIR/${DOMAIN_NAME}.key" 2>/dev/null || echo "000")
    if [ "$key_perms" = "600" ]; then
        test_result 0 "Permisos de clave privada son correctos (600)"
    else
        test_result 1 "Permisos de clave privada incorrectos ($key_perms, debería ser 600)"
    fi
fi

# Test 5: Verificar que nginx escucha en puerto 443
echo -e "\n${BLUE}📋 Verificando puertos...${NC}"
if netstat -tlpn 2>/dev/null | grep -q ":443.*nginx" || ss -tlpn 2>/dev/null | grep -q ":443.*nginx"; then
    test_result 0 "nginx escucha en puerto 443 (HTTPS)"
else
    test_result 1 "nginx no escucha en puerto 443"
fi

# Test 6: Verificar redirección HTTP a HTTPS
echo -e "\n${BLUE}📋 Verificando redirección HTTP->HTTPS...${NC}"
if curl -s -I "http://$DOMAIN_NAME" 2>/dev/null | grep -q "Location.*https"; then
    test_result 0 "Redirección HTTP a HTTPS funciona"
else
    test_result 1 "Redirección HTTP a HTTPS no funciona"
fi

# Test 7: Verificar conectividad HTTPS
echo -e "\n${BLUE}📋 Verificando conectividad HTTPS...${NC}"
if curl -s -I "https://$DOMAIN_NAME" --max-time 10 >/dev/null 2>&1; then
    test_result 0 "Conectividad HTTPS funciona"
else
    test_result 1 "Conectividad HTTPS falla"
fi

# Test 8: Verificar validez del certificado
echo -e "\n${BLUE}📋 Verificando validez del certificado...${NC}"
if echo | openssl s_client -connect "${DOMAIN_NAME}:443" -servername "$DOMAIN_NAME" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
    
    # Obtener fechas del certificado
    cert_info=$(echo | openssl s_client -connect "${DOMAIN_NAME}:443" -servername "$DOMAIN_NAME" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    
    if echo "$cert_info" | grep -q "notAfter"; then
        test_result 0 "Certificado SSL es válido"
        
        # Mostrar información del certificado
        expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
        info "Fecha de expiración: $expiry_date"
        
        # Verificar si está cerca de expirar (30 días)
        if command -v date >/dev/null 2>&1; then
            current_date=$(date +%s)
            if command -v gdate >/dev/null 2>&1; then
                # macOS con GNU date
                expiry_epoch=$(gdate -d "$expiry_date" +%s 2>/dev/null || echo "0")
            else
                # Linux
                expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
            fi
            
            if [ "$expiry_epoch" -gt 0 ]; then
                days_until_expiry=$(( (expiry_epoch - current_date) / 86400 ))
                if [ "$days_until_expiry" -lt 30 ]; then
                    echo -e "${YELLOW}⚠️  El certificado expira en $days_until_expiry días${NC}"
                else
                    info "El certificado expira en $days_until_expiry días"
                fi
            fi
        fi
    else
        test_result 1 "No se puede verificar la validez del certificado"
    fi
else
    test_result 1 "No se puede conectar para verificar el certificado"
fi

# Test 9: Verificar configuración SSL moderna
echo -e "\n${BLUE}📋 Verificando configuración SSL...${NC}"
if echo | openssl s_client -connect "${DOMAIN_NAME}:443" -servername "$DOMAIN_NAME" 2>/dev/null | grep -q "Protocol.*TLSv1\.[23]"; then
    test_result 0 "Protocolo TLS moderno (1.2/1.3)"
else
    test_result 1 "Protocolo TLS no es moderno"
fi

# Test 10: Verificar headers de seguridad
echo -e "\n${BLUE}📋 Verificando headers de seguridad...${NC}"
headers=$(curl -s -I "https://$DOMAIN_NAME" --max-time 10 2>/dev/null || echo "")

if echo "$headers" | grep -qi "strict-transport-security"; then
    test_result 0 "Header HSTS presente"
else
    test_result 1 "Header HSTS ausente"
fi

if echo "$headers" | grep -qi "x-frame-options"; then
    test_result 0 "Header X-Frame-Options presente"
else
    test_result 1 "Header X-Frame-Options ausente"
fi

# Información adicional
echo -e "\n${BLUE}📊 Información del certificado:${NC}"
echo "============================================"

if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" ]; then
    cert_details=$(openssl x509 -in "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" -text -noout 2>/dev/null || echo "Error al leer certificado")
    
    echo "$cert_details" | grep -E "(Subject:|Issuer:|Not Before:|Not After:)" | while read line; do
        info "$line"
    done
    
    # Verificar Subject Alternative Names
    san_info=$(echo "$cert_details" | grep -A5 "Subject Alternative Name" | grep "DNS:" || echo "No hay SAN disponibles")
    if [ "$san_info" != "No hay SAN disponibles" ]; then
        info "Subject Alternative Names: $san_info"
    fi
fi

echo -e "\n${BLUE}📊 Estado de archivos SSL:${NC}"
echo "============================================"
for file in "${DOMAIN_NAME}.crt" "${DOMAIN_NAME}.key" "${DOMAIN_NAME}-bundle.crt" "${DOMAIN_NAME}-fullchain.crt"; do
    if [ -f "$NGINX_SSL_DIR/$file" ]; then
        size=$(ls -lah "$NGINX_SSL_DIR/$file" | awk '{print $5}')
        perms=$(stat -c %a "$NGINX_SSL_DIR/$file" 2>/dev/null || echo "unknown")
        info "$file: Tamaño=$size, Permisos=$perms"
    else
        info "$file: No existe"
    fi
done

# Resumen final
echo -e "\n${BLUE}📊 Resumen de verificación SSL:${NC}"
echo "============================================"
echo -e "Tests SSL pasados: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests SSL fallidos: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🔒 ¡Configuración SSL completamente funcional!${NC}"
    echo -e "Tu sitio está disponible de forma segura en: ${GREEN}https://$DOMAIN_NAME${NC}"
    exit 0
elif [ $TESTS_FAILED -le 2 ]; then
    echo -e "\n${YELLOW}⚠️  SSL parcialmente funcional. Revisa los errores menores.${NC}"
    exit 1
else
    echo -e "\n${RED}🔥 Problemas críticos en la configuración SSL. Requiere atención inmediata.${NC}"
    exit 2
fi