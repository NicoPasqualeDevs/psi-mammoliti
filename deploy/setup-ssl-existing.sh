#!/bin/bash

# Script para configurar certificados SSL existentes
# Versión mejorada con detección automática y validación
# Debe ejecutarse después de deploy.sh

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
SSL_DIR="/etc/ssl/certs"
SSL_PRIVATE_DIR="/etc/ssl/private"
NGINX_SSL_DIR="/etc/nginx/ssl"

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

# Función para detectar archivos de certificados automáticamente
detect_ssl_files() {
    local deploy_dir="$1"
    local cert_file=""
    local key_file=""
    local bundle_file=""
    
    log "Detectando archivos de certificados en $deploy_dir..."
    
    # Buscar archivos de certificado (.crt, .cert, .pem con contenido de certificado)
    for ext in crt cert pem; do
        for file in "$deploy_dir"/*.$ext; do
            if [ -f "$file" ] && grep -q "BEGIN CERTIFICATE" "$file" 2>/dev/null; then
                cert_file="$file"
                info "Certificado encontrado: $(basename $file)"
                break 2
            fi
        done
    done
    
    # Buscar archivo de clave privada (.key, .pem con contenido de clave)
    for ext in key pem; do
        for file in "$deploy_dir"/*.$ext; do
            if [ -f "$file" ] && (grep -q "BEGIN PRIVATE KEY\|BEGIN RSA PRIVATE KEY" "$file" 2>/dev/null); then
                key_file="$file"
                info "Clave privada encontrada: $(basename $file)"
                break 2
            fi
        done
    done
    
    # Buscar archivo bundle (opcional, puede contener múltiples certificados)
    for file in "$deploy_dir"/*bundle* "$deploy_dir"/*intermediate* "$deploy_dir"/*chain*; do
        if [ -f "$file" ] && grep -q "BEGIN CERTIFICATE" "$file" 2>/dev/null; then
            # Contar certificados en el archivo
            cert_count=$(grep -c "BEGIN CERTIFICATE" "$file" 2>/dev/null || echo "0")
            if [ "$cert_count" -gt 1 ] || [[ "$(basename $file)" =~ (bundle|intermediate|chain) ]]; then
                bundle_file="$file"
                info "Bundle/cadena encontrado: $(basename $file)"
                break
            fi
        fi
    done
    
    # Retornar resultados
    echo "$cert_file|$key_file|$bundle_file"
}

# Función para validar certificados SSL
validate_ssl_files() {
    local cert_file="$1"
    local key_file="$2"
    local bundle_file="$3"
    
    log "Validando certificados SSL..."
    
    # Validar certificado principal
    if [ ! -f "$cert_file" ]; then
        error "Archivo de certificado no encontrado: $cert_file"
    fi
    
    if ! openssl x509 -in "$cert_file" -noout -text >/dev/null 2>&1; then
        error "El archivo de certificado no es válido: $cert_file"
    fi
    
    # Validar clave privada
    if [ ! -f "$key_file" ]; then
        error "Archivo de clave privada no encontrado: $key_file"
    fi
    
    if ! openssl rsa -in "$key_file" -check -noout >/dev/null 2>&1; then
        error "El archivo de clave privada no es válido: $key_file"
    fi
    
    # Verificar que el certificado y la clave coinciden
    cert_modulus=$(openssl x509 -noout -modulus -in "$cert_file" 2>/dev/null | openssl md5)
    key_modulus=$(openssl rsa -noout -modulus -in "$key_file" 2>/dev/null | openssl md5)
    
    if [ "$cert_modulus" != "$key_modulus" ]; then
        error "El certificado y la clave privada no coinciden"
    fi
    
    info "✅ Certificado y clave privada son válidos y coinciden"
    
    # Validar bundle si existe
    if [ -n "$bundle_file" ] && [ -f "$bundle_file" ]; then
        if ! openssl x509 -in "$bundle_file" -noout -text >/dev/null 2>&1; then
            warning "El archivo bundle no es válido, se ignorará: $bundle_file"
            echo ""  # Retorna cadena vacía para bundle inválido
        else
            info "✅ Bundle/cadena de certificados es válido"
            echo "$bundle_file"
        fi
    else
        echo ""  # No hay bundle
    fi
}

# Función para mostrar información del certificado
show_cert_info() {
    local cert_file="$1"
    
    info "Información del certificado:"
    echo "=================================="
    
    # Información básica
    local subject=$(openssl x509 -noout -subject -in "$cert_file" 2>/dev/null | sed 's/subject=//')
    local issuer=$(openssl x509 -noout -issuer -in "$cert_file" 2>/dev/null | sed 's/issuer=//')
    local not_before=$(openssl x509 -noout -startdate -in "$cert_file" 2>/dev/null | sed 's/notBefore=//')
    local not_after=$(openssl x509 -noout -enddate -in "$cert_file" 2>/dev/null | sed 's/notAfter=//')
    
    echo "Subject: $subject"
    echo "Issuer: $issuer"
    echo "Valid from: $not_before"
    echo "Valid until: $not_after"
    
    # Verificar dominios
    local san=$(openssl x509 -noout -text -in "$cert_file" 2>/dev/null | grep -A1 "Subject Alternative Name" | tail -1 | tr ',' '\n' | grep DNS: | sed 's/DNS://g' | tr -d ' ')
    if [ -n "$san" ]; then
        echo "Dominios incluidos:"
        echo "$san" | while read domain; do
            [ -n "$domain" ] && echo "  - $domain"
        done
    fi
}

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root (sudo)"
fi

log "Configurando certificados SSL existentes para $DOMAIN_NAME..."

# Verificar que nginx está instalado y corriendo
if ! command -v nginx >/dev/null 2>&1; then
    error "nginx no está instalado. Ejecuta deploy.sh primero."
fi

if ! systemctl is-active --quiet nginx; then
    warning "nginx no está corriendo, intentando iniciarlo..."
    systemctl start nginx || error "No se pudo iniciar nginx"
fi

# Crear directorio para certificados SSL en nginx
log "Creando directorio SSL para nginx..."
mkdir -p "$NGINX_SSL_DIR"

# Detectar archivos de certificados
CURRENT_DIR="$(pwd)"
ssl_files=$(detect_ssl_files "$CURRENT_DIR/deploy")
IFS='|' read -r cert_file key_file bundle_file <<< "$ssl_files"

# Verificar que se encontraron los archivos necesarios
if [ -z "$cert_file" ] || [ -z "$key_file" ]; then
    error "No se encontraron certificados SSL válidos en $CURRENT_DIR/deploy/
    
Archivos necesarios:
  - Certificado: archivo .crt, .cert o .pem con 'BEGIN CERTIFICATE'
  - Clave privada: archivo .key o .pem con 'BEGIN PRIVATE KEY' o 'BEGIN RSA PRIVATE KEY'
  - Bundle (opcional): archivo con múltiples certificados
    
Archivos encontrados en deploy/:
$(ls -la "$CURRENT_DIR/deploy/" 2>/dev/null | grep -E '\.(crt|cert|pem|key)$' || echo "  Ningún archivo SSL encontrado")"
fi

# Validar certificados
bundle_file=$(validate_ssl_files "$cert_file" "$key_file" "$bundle_file")

# Mostrar información del certificado
show_cert_info "$cert_file"

# Confirmar antes de continuar
echo ""
read -p "¿Continuar con la instalación de estos certificados? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Instalación cancelada por el usuario"
fi

# Copiar certificados a nginx
log "Copiando certificados SSL..."
cp "$cert_file" "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt"
cp "$key_file" "$NGINX_SSL_DIR/${DOMAIN_NAME}.key"

# Procesar bundle si existe
if [ -n "$bundle_file" ] && [ -f "$bundle_file" ]; then
    cp "$bundle_file" "$NGINX_SSL_DIR/${DOMAIN_NAME}-bundle.crt"
    
    # Crear certificado completo (certificado + bundle)
    log "Creando certificado completo con bundle..."
    cat "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" "$NGINX_SSL_DIR/${DOMAIN_NAME}-bundle.crt" > "$NGINX_SSL_DIR/${DOMAIN_NAME}-fullchain.crt"
    FULLCHAIN_FILE="${DOMAIN_NAME}-fullchain.crt"
else
    FULLCHAIN_FILE="${DOMAIN_NAME}.crt"
    info "No se encontró bundle, usando solo certificado principal"
fi

# Configurar permisos seguros
log "Configurando permisos de certificados..."
chmod 644 "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt"
chmod 600 "$NGINX_SSL_DIR/${DOMAIN_NAME}.key"
chown root:root "$NGINX_SSL_DIR"/*

if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}-bundle.crt" ]; then
    chmod 644 "$NGINX_SSL_DIR/${DOMAIN_NAME}-bundle.crt"
fi

if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}-fullchain.crt" ]; then
    chmod 644 "$NGINX_SSL_DIR/${DOMAIN_NAME}-fullchain.crt"
fi

# Crear configuración nginx con SSL
log "Actualizando configuración nginx para SSL..."
cat > "/etc/nginx/sites-available/$APP_NAME" << EOF
# Redirección HTTP a HTTPS
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # Logs para HTTP
    access_log /var/log/nginx/${APP_NAME}_http_access.log;
    error_log /var/log/nginx/${APP_NAME}_http_error.log;
    
    # Redireccionar todo el tráfico HTTP a HTTPS
    return 301 https://\$server_name\$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME;

    # Certificados SSL
    ssl_certificate $NGINX_SSL_DIR/$FULLCHAIN_FILE;
    ssl_certificate_key $NGINX_SSL_DIR/${DOMAIN_NAME}.key;

    # Configuración SSL moderna y segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Logs
    access_log /var/log/nginx/${APP_NAME}_ssl_access.log;
    error_log /var/log/nginx/${APP_NAME}_ssl_error.log;

    # Directorio raíz para archivos estáticos
    root /var/www/$APP_NAME/build;
    index index.html;

    # Configuración de proxy para la API del backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts específicos para la API
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Headers adicionales de seguridad
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Server \$host;
    }

    # Configuración principal para React SPA
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Headers para prevenir cache en index.html
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate" always;
            add_header Pragma "no-cache" always;
            add_header Expires "0" always;
        }
    }

    # Archivos estáticos con cache agresivo
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Compresión específica para estáticos
        gzip_static on;
    }

    # Manifest y service workers
    location ~* \.(manifest|sw)\.js$ {
        expires 1d;
        add_header Cache-Control "public, must-revalidate";
    }

    # Favicons, imágenes y fuentes
    location ~* \.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # CSP (Content Security Policy) actualizado para HTTPS
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com data:;
        img-src 'self' data: https: blob:;
        connect-src 'self' wss: https:;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
    " always;

    # Configuración de compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml
        application/wasm;

    # Limitar tamaño de subida
    client_max_body_size 10M;

    # Buffer sizes para mejor rendimiento
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}
EOF

# Actualizar firewall para HTTPS
if command -v ufw >/dev/null 2>&1; then
    log "Configurando firewall para HTTPS..."
    ufw allow 443/tcp >/dev/null 2>&1 || warning "No se pudo configurar ufw para HTTPS"
fi

# Verificar configuración de nginx antes de aplicar
log "Verificando configuración de nginx..."
if ! nginx -t 2>/dev/null; then
    error "Error en la configuración de nginx. Ejecuta 'nginx -t' para ver detalles."
fi

# Reiniciar nginx
log "Reiniciando nginx..."
systemctl restart nginx

# Esperar a que nginx esté listo
sleep 3

# Verificar que nginx está funcionando
if ! systemctl is-active --quiet nginx; then
    error "nginx no se inició correctamente después de aplicar la configuración SSL"
fi

# Verificar que los certificados funcionan
log "Verificando certificados SSL..."

# Test de conectividad HTTPS local
if curl -s -k -I "https://localhost" >/dev/null 2>&1; then
    info "✅ nginx responde en HTTPS localmente"
else
    warning "⚠️  nginx no responde en HTTPS localmente"
fi

# Test del certificado SSL
if command -v openssl >/dev/null 2>&1; then
    log "Verificando certificado SSL..."
    if echo | openssl s_client -connect ${DOMAIN_NAME}:443 -servername ${DOMAIN_NAME} 2>/dev/null | grep -q "Verify return code: 0"; then
        info "✅ Certificados SSL funcionando correctamente"
    else
        warning "⚠️  Los certificados están instalados pero puede haber problemas de verificación"
        warning "    Esto puede ser normal si el dominio no apunta a este servidor"
    fi
fi

# Mostrar información final
echo ""
echo -e "${GREEN}🔒 ¡Configuración SSL completada exitosamente!${NC}"
echo ""
echo -e "${YELLOW}📋 Resumen de la configuración:${NC}"
echo -e "  🌐 Dominio: ${BLUE}$DOMAIN_NAME${NC}"
echo -e "  🔗 URL HTTPS: ${GREEN}https://$DOMAIN_NAME${NC}"
echo -e "  📄 Certificado: $NGINX_SSL_DIR/${DOMAIN_NAME}.crt"
echo -e "  🔑 Clave privada: $NGINX_SSL_DIR/${DOMAIN_NAME}.key"
if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}-fullchain.crt" ]; then
    echo -e "  🔗 Certificado completo: $NGINX_SSL_DIR/${DOMAIN_NAME}-fullchain.crt"
fi
echo -e "  📁 Configuración nginx: /etc/nginx/sites-available/$APP_NAME"
echo ""
echo -e "${YELLOW}🔧 Comandos útiles:${NC}"
echo -e "  nginx -t                    # Verificar configuración"
echo -e "  systemctl restart nginx     # Reiniciar nginx"
echo -e "  curl -I https://$DOMAIN_NAME  # Probar HTTPS"
echo -e "  ./deploy/verify-ssl.sh      # Verificación completa SSL"
echo ""

# Mostrar próximos pasos
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo "1. Asegúrate de que el dominio $DOMAIN_NAME apunte a la IP de este servidor"
echo "2. Ejecuta './deploy/verify-ssl.sh' para verificación completa"
echo "3. Configura renovación automática si usas certificados temporales"
echo ""