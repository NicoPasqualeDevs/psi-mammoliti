#!/bin/bash

# Script para configurar certificados SSL existentes para global-deer.com
# Debe ejecutarse después de deploy.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
DOMAIN_NAME="global-deer.com"
APP_NAME="psi-mammoliti"
SSL_DIR="/etc/ssl/certs"
SSL_PRIVATE_DIR="/etc/ssl/private"
NGINX_SSL_DIR="/etc/nginx/ssl"

# Archivos de certificados en el directorio deploy/
CERT_FILE="e27b3c236ad504e7.crt"
PRIVATE_KEY="e27b3c236ad504e7.pem"
BUNDLE_FILE="gd_bundle-g2.crt"

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

log "Configurando certificados SSL existentes para $DOMAIN_NAME..."

# Verificar que nginx está instalado y corriendo
if ! systemctl is-active --quiet nginx; then
    error "nginx no está corriendo. Ejecuta deploy.sh primero."
fi

# Crear directorio para certificados SSL en nginx
log "Creando directorio SSL para nginx..."
mkdir -p "$NGINX_SSL_DIR"

# Verificar que los archivos de certificados existen
CURRENT_DIR="$(pwd)"
if [ ! -f "$CURRENT_DIR/deploy/$CERT_FILE" ]; then
    error "Archivo de certificado no encontrado: $CURRENT_DIR/deploy/$CERT_FILE"
fi

if [ ! -f "$CURRENT_DIR/deploy/$PRIVATE_KEY" ]; then
    error "Archivo de clave privada no encontrado: $CURRENT_DIR/deploy/$PRIVATE_KEY"
fi

if [ ! -f "$CURRENT_DIR/deploy/$BUNDLE_FILE" ]; then
    warning "Archivo bundle no encontrado: $CURRENT_DIR/deploy/$BUNDLE_FILE (opcional)"
fi

# Copiar certificados a nginx
log "Copiando certificados SSL..."
cp "$CURRENT_DIR/deploy/$CERT_FILE" "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt"
cp "$CURRENT_DIR/deploy/$PRIVATE_KEY" "$NGINX_SSL_DIR/${DOMAIN_NAME}.key"

# Copiar bundle si existe
if [ -f "$CURRENT_DIR/deploy/$BUNDLE_FILE" ]; then
    cp "$CURRENT_DIR/deploy/$BUNDLE_FILE" "$NGINX_SSL_DIR/${DOMAIN_NAME}-bundle.crt"
    
    # Crear certificado completo (certificado + bundle)
    log "Creando certificado completo con bundle..."
    cat "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" "$NGINX_SSL_DIR/${DOMAIN_NAME}-bundle.crt" > "$NGINX_SSL_DIR/${DOMAIN_NAME}-fullchain.crt"
    FULLCHAIN_FILE="${DOMAIN_NAME}-fullchain.crt"
else
    FULLCHAIN_FILE="${DOMAIN_NAME}.crt"
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
    return 301 https://\$server_name\$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME;

    # Certificados SSL
    ssl_certificate $NGINX_SSL_DIR/$FULLCHAIN_FILE;
    ssl_certificate_key $NGINX_SSL_DIR/${DOMAIN_NAME}.key;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logs
    access_log /var/log/nginx/${APP_NAME}_ssl_access.log;
    error_log /var/log/nginx/${APP_NAME}_ssl_error.log;

    root /var/www/$APP_NAME/build;
    index index.html;

    # Configuración de proxy para la API
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
    }

    # Configuración de proxy y manejo de rutas de React Router
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Headers para SPA
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Archivos estáticos optimizados
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Compresión específica para estáticos
        gzip_static on;
    }

    # Manifest y archivos de service worker
    location ~* \.(manifest|sw)\.js$ {
        expires 1d;
        add_header Cache-Control "public, must-revalidate";
    }

    # Favicons e iconos
    location ~* \.(ico|png|jpg|jpeg|gif|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # CSP actualizado para HTTPS
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com data:;
        img-src 'self' data: https: blob:;
        connect-src 'self' https://api.global-deer.com wss://global-deer.com;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
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
        image/svg+xml;

    # Limitar tamaño de subida
    client_max_body_size 10M;

    # Configuración para SPA (Single Page Application)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Actualizar firewall para HTTPS
log "Configurando firewall para HTTPS..."
ufw allow 443/tcp

# Verificar configuración de nginx
log "Verificando configuración de nginx..."
nginx -t || error "Error en la configuración de nginx"

# Reiniciar nginx
log "Reiniciando nginx..."
systemctl restart nginx

# Verificar que los certificados funcionan
log "Verificando certificados SSL..."
sleep 2

# Test básico de SSL
if openssl s_client -connect ${DOMAIN_NAME}:443 -servername ${DOMAIN_NAME} </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    log "✅ Certificados SSL funcionando correctamente"
else
    warning "⚠️  Los certificados están instalados pero puede haber problemas de verificación"
fi

# Mostrar información de los certificados
log "Información de certificados:"
openssl x509 -in "$NGINX_SSL_DIR/${DOMAIN_NAME}.crt" -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:)" || true

echo -e "\n${GREEN}🔒 ¡Configuración SSL completada!${NC}"
echo -e "Tu sitio ahora está disponible en: ${GREEN}https://${DOMAIN_NAME}${NC}"
echo ""
echo -e "${YELLOW}📋 Archivos de certificados configurados:${NC}"
echo -e "  📄 Certificado: $NGINX_SSL_DIR/${DOMAIN_NAME}.crt"
echo -e "  🔑 Clave privada: $NGINX_SSL_DIR/${DOMAIN_NAME}.key"
if [ -f "$NGINX_SSL_DIR/${DOMAIN_NAME}-fullchain.crt" ]; then
    echo -e "  🔗 Certificado completo: $NGINX_SSL_DIR/${DOMAIN_NAME}-fullchain.crt"
fi
echo -e "  📁 Configuración nginx: /etc/nginx/sites-available/$APP_NAME"