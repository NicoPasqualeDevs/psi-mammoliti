#!/bin/bash

# Script de despliegue para psi-mammoliti en VM Debian
# Configuración de nginx como proxy inverso para puerto 80

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables de configuración
APP_NAME="psi-mammoliti"
APP_DIR="/var/www/$APP_NAME"
SERVICE_PORT="3000"
DOMAIN_NAME="${DOMAIN_NAME:-global-deer.com}"
SETUP_SSL="${SETUP_SSL:-false}"

echo -e "${GREEN}🚀 Iniciando despliegue de $APP_NAME${NC}"

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

log "Actualizando sistema..."
apt-get update -y
apt-get upgrade -y

log "Instalando dependencias del sistema..."
apt-get install -y \
    curl \
    git \
    nginx \
    ufw \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip

# Instalar Node.js 20.x
log "Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalaciones
node_version=$(node --version)
npm_version=$(npm --version)
log "Node.js instalado: $node_version (requerido: >=20.0.0 para react-router-dom v7)"
log "npm instalado: $npm_version"

# Instalar PM2 globalmente
log "Instalando PM2..."
npm install -g pm2

# Crear directorio de aplicación
log "Creando directorio de aplicación..."
mkdir -p "$APP_DIR"
chown -R www-data:www-data "$APP_DIR"

# Copiar archivos de aplicación
log "Copiando archivos de aplicación..."
if [ -d "$(pwd)/src" ]; then
    cp -r "$(pwd)"/* "$APP_DIR/"
else
    error "No se encontraron los archivos de la aplicación. Ejecutar desde el directorio raíz del proyecto."
fi

cd "$APP_DIR"

# Instalar dependencias de Node.js
log "Instalando dependencias npm..."
# Limpiar cache y package-lock si hay conflictos
if [ -f "package-lock.json" ]; then
    log "Limpiando package-lock.json para evitar conflictos de versiones..."
    rm package-lock.json
fi
npm install --omit=dev

# Instalar dependencias del backend
log "Instalando dependencias del backend..."
if [ -d "backend" ]; then
    cd backend
    npm install
    cd ..
else
    error "Directorio backend/ no encontrado"
fi

# Configurar base de datos
log "Configurando base de datos SQLite..."
if [ -f "deploy/setup-db.sh" ]; then
    chmod +x deploy/setup-db.sh
    ./deploy/setup-db.sh
else
    error "Script de configuración de base de datos no encontrado"
fi

# Construir aplicación para producción
log "Construyendo aplicación..."
npm run build

# Crear archivo de configuración PM2
log "Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: '$APP_NAME-frontend',
      script: 'npx',
      args: 'serve -s build -l $SERVICE_PORT',
      cwd: '$APP_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '$SERVICE_PORT'
      },
      error_file: '/var/log/$APP_NAME/frontend-error.log',
      out_file: '/var/log/$APP_NAME/frontend-out.log',
      log_file: '/var/log/$APP_NAME/frontend-combined.log',
      time: true
    },
    {
      name: '$APP_NAME-backend',
      script: 'server.js',
      cwd: '$APP_DIR/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3001'
      },
      error_file: '/var/log/$APP_NAME/backend-error.log',
      out_file: '/var/log/$APP_NAME/backend-out.log',
      log_file: '/var/log/$APP_NAME/backend-combined.log',
      time: true
    }
  ]
};
EOF

# Instalar serve globalmente
log "Instalando serve..."
npm install -g serve

# Crear directorio de logs
mkdir -p "/var/log/$APP_NAME"
chown -R www-data:www-data "/var/log/$APP_NAME"

# Configurar nginx
log "Configurando nginx..."
if [ -f "$(pwd)/deploy/nginx.conf.template" ]; then
    # Usar template si está disponible
    cp "$(pwd)/deploy/nginx.conf.template" "/etc/nginx/sites-available/$APP_NAME"
    
    # Reemplazar variables en el template
    sed -i "s|__DOMAIN_NAME__|$DOMAIN_NAME|g" "/etc/nginx/sites-available/$APP_NAME"
    sed -i "s|__APP_NAME__|$APP_NAME|g" "/etc/nginx/sites-available/$APP_NAME"
    sed -i "s|__SERVICE_PORT__|$SERVICE_PORT|g" "/etc/nginx/sites-available/$APP_NAME"
    sed -i "s|__APP_DIR__|$APP_DIR|g" "/etc/nginx/sites-available/$APP_NAME"
else
    # Configuración básica si no hay template
    cat > "/etc/nginx/sites-available/$APP_NAME" << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Logs
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;

    # Configuración de proxy
    location / {
        proxy_pass http://localhost:$SERVICE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Configuración de seguridad básica
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/javascript application/javascript;
}
EOF
fi

# Habilitar sitio en nginx
ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"

# Deshabilitar sitio por defecto
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm "/etc/nginx/sites-enabled/default"
fi

# Verificar configuración de nginx
log "Verificando configuración de nginx..."
nginx -t || error "Error en la configuración de nginx"

# Reiniciar nginx
log "Reiniciando nginx..."
systemctl restart nginx
systemctl enable nginx

# Configurar firewall básico
log "Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw --force enable

# Iniciar aplicación con PM2
log "Iniciando aplicación con PM2..."
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configurar PM2 para iniciar automáticamente
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root

log "Verificando estado de servicios..."
systemctl status nginx --no-pager
pm2 status

# Crear script de gestión
log "Creando scripts de gestión..."
cat > "/usr/local/bin/$APP_NAME-manage" << 'EOF'
#!/bin/bash

APP_NAME="psi-mammoliti"
APP_DIR="/var/www/$APP_NAME"

case "$1" in
    start)
        echo "Iniciando $APP_NAME..."
        cd "$APP_DIR" && pm2 start ecosystem.config.js
        ;;
    stop)
        echo "Deteniendo $APP_NAME..."
        pm2 stop "$APP_NAME-frontend" "$APP_NAME-backend"
        ;;
    restart)
        echo "Reiniciando $APP_NAME..."
        pm2 restart "$APP_NAME-frontend" "$APP_NAME-backend"
        ;;
    status)
        echo "Estado de servicios:"
        pm2 status
        echo ""
        echo "Puertos en uso:"
        netstat -tulpn | grep -E ":(3000|3001)" || echo "Ningún proceso en puertos 3000/3001"
        ;;
    logs)
        if [ "$2" = "backend" ]; then
            pm2 logs "$APP_NAME-backend" --lines 50
        elif [ "$2" = "frontend" ]; then
            pm2 logs "$APP_NAME-frontend" --lines 50
        else
            echo "Logs del backend:"
            pm2 logs "$APP_NAME-backend" --lines 25
            echo ""
            echo "Logs del frontend:"
            pm2 logs "$APP_NAME-frontend" --lines 25
        fi
        ;;
    diagnose)
        echo "Ejecutando diagnóstico completo..."
        if [ -f "$APP_DIR/deploy/diagnose-backend.sh" ]; then
            chmod +x "$APP_DIR/deploy/diagnose-backend.sh"
            "$APP_DIR/deploy/diagnose-backend.sh"
        else
            echo "Script de diagnóstico no encontrado"
        fi
        ;;
    test-api)
        echo "Probando APIs..."
        echo "Backend directo (puerto 3001):"
        curl -s -f http://localhost:3001/api/psicologos > /dev/null && echo "✅ OK" || echo "❌ FALLO"
        echo "A través de nginx (HTTP):"
        curl -s -f http://localhost/api/psicologos > /dev/null && echo "✅ OK" || echo "❌ FALLO"
        
        # Test HTTPS si está configurado
        if [ -f "/etc/nginx/ssl/global-deer.com.crt" ]; then
            echo "A través de nginx (HTTPS):"
            curl -s -f https://global-deer.com/api/psicologos > /dev/null && echo "✅ OK" || echo "❌ FALLO"
        fi
        ;;
    verify-ssl)
        echo "Verificando configuración SSL..."
        if [ -f "$APP_DIR/deploy/verify-ssl.sh" ]; then
            chmod +x "$APP_DIR/deploy/verify-ssl.sh"
            "$APP_DIR/deploy/verify-ssl.sh"
        else
            echo "Script de verificación SSL no encontrado"
        fi
        ;;
    setup-ssl)
        echo "Configurando SSL..."
        if [ -f "$APP_DIR/deploy/setup-ssl-existing.sh" ]; then
            chmod +x "$APP_DIR/deploy/setup-ssl-existing.sh"
            "$APP_DIR/deploy/setup-ssl-existing.sh"
        else
            echo "Script de configuración SSL no encontrado"
        fi
        ;;
    update)
        echo "Actualizando $APP_NAME..."
        cd "$APP_DIR"
        git pull
        npm ci --only=production
        npm run build
        # Actualizar dependencias del backend
        cd backend && npm install && cd ..
        pm2 restart "$APP_NAME-frontend" "$APP_NAME-backend"
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs|diagnose|test-api|verify-ssl|setup-ssl|update}"
        echo ""
        echo "Comandos disponibles:"
        echo "  start      - Iniciar aplicación"
        echo "  stop       - Detener aplicación"
        echo "  restart    - Reiniciar aplicación"
        echo "  status     - Ver estado de servicios"
        echo "  logs       - Ver logs (logs backend|frontend para específicos)"
        echo "  diagnose   - Ejecutar diagnóstico completo"
        echo "  test-api   - Probar APIs (HTTP y HTTPS si está configurado)"
        echo "  verify-ssl - Verificar configuración SSL"
        echo "  setup-ssl  - Configurar certificados SSL existentes"
        echo "  update     - Actualizar aplicación"
        exit 1
        ;;
esac
EOF

chmod +x "/usr/local/bin/$APP_NAME-manage"

# Configurar SSL si está habilitado
if [ "$SETUP_SSL" = "true" ]; then
    log "Verificando certificados SSL disponibles..."
    
    # Función para detectar certificados SSL en deploy/
    ssl_cert_found=""
    ssl_key_found=""
    
    # Buscar archivos de certificado
    for ext in crt cert pem; do
        for file in "$(pwd)/deploy"/*.$ext; do
            if [ -f "$file" ] && grep -q "BEGIN CERTIFICATE" "$file" 2>/dev/null; then
                ssl_cert_found="$file"
                log "Certificado SSL encontrado: $(basename "$file")"
                break 2
            fi
        done
    done
    
    # Buscar archivos de clave privada
    for ext in key pem; do
        for file in "$(pwd)/deploy"/*.$ext; do
            if [ -f "$file" ] && (grep -q "BEGIN PRIVATE KEY\|BEGIN RSA PRIVATE KEY" "$file" 2>/dev/null); then
                ssl_key_found="$file"
                log "Clave privada SSL encontrada: $(basename "$file")"
                break 2
            fi
        done
    done
    
    # Decidir método de configuración SSL
    if [ -n "$ssl_cert_found" ] && [ -n "$ssl_key_found" ]; then
        log "Configurando SSL con certificados existentes..."
        
        # Verificar que el script de configuración existe
        if [ -f "$(pwd)/deploy/setup-ssl-existing.sh" ]; then
            chmod +x "$(pwd)/deploy/setup-ssl-existing.sh"
            
            # Exportar variables para el script SSL
            export DOMAIN_NAME="$DOMAIN_NAME"
            
            # Ejecutar configuración SSL
            if "$(pwd)/deploy/setup-ssl-existing.sh"; then
                log "✅ SSL configurado exitosamente con certificados existentes"
            else
                warning "⚠️  Hubo problemas configurando SSL, continuando sin SSL"
                warning "    Puedes configurar SSL manualmente después con:"
                warning "    sudo ./deploy/setup-ssl-existing.sh"
            fi
        else
            error "Script de configuración SSL para certificados existentes no encontrado"
        fi
    else
        # No hay certificados existentes, intentar con Certbot
        log "No se encontraron certificados existentes, configurando SSL con Certbot..."
        
        if [ "$DOMAIN_NAME" = "localhost" ] || [ "$DOMAIN_NAME" = "127.0.0.1" ]; then
            warning "⚠️  No se puede usar Certbot con localhost o IP local"
            warning "    SSL no se configurará automáticamente"
            warning "    Para usar SSL con dominio local:"
            warning "    1. Configura un dominio real que apunte a este servidor"
            warning "    2. Ejecuta: export DOMAIN_NAME='tu-dominio.com' && sudo ./deploy/setup-ssl.sh"
        else
            if [ -f "$(pwd)/deploy/setup-ssl.sh" ]; then
                chmod +x "$(pwd)/deploy/setup-ssl.sh"
                
                # Exportar variables para Certbot
                export DOMAIN_NAME="$DOMAIN_NAME"
                
                # Intentar configuración con Certbot
                if "$(pwd)/deploy/setup-ssl.sh"; then
                    log "✅ SSL configurado exitosamente con Certbot"
                else
                    warning "⚠️  Certbot falló, continuando sin SSL"
                    warning "    Posibles causas:"
                    warning "    - El dominio no apunta a este servidor"
                    warning "    - Puertos 80/443 no están accesibles desde Internet"
                    warning "    - Límites de rate limit de Let's Encrypt"
                    warning "    "
                    warning "    Puedes intentar configurar SSL manualmente después:"
                    warning "    sudo ./deploy/setup-ssl.sh"
                fi
            else
                warning "Script de configuración SSL con Certbot no encontrado"
            fi
        fi
    fi
    
    # Información adicional sobre SSL
    if [ -f "/etc/nginx/ssl/${DOMAIN_NAME}.crt" ]; then
        log "SSL está configurado y disponible"
        info "Puedes verificar la configuración SSL con:"
        info "  ./deploy/verify-ssl.sh"
    else
        warning "SSL no está configurado"
        info "Para configurar SSL manualmente:"
        if [ -n "$ssl_cert_found" ] && [ -n "$ssl_key_found" ]; then
            info "  sudo ./deploy/setup-ssl-existing.sh  # Usar certificados existentes"
        fi
        info "  sudo ./deploy/setup-ssl.sh            # Generar con Certbot"
    fi
fi

# Mostrar información final
echo ""
echo -e "${GREEN}✅ ¡Despliegue completado con éxito!${NC}"
echo ""
echo -e "${YELLOW}📋 Información del despliegue:${NC}"
if [ "$SETUP_SSL" = "true" ]; then
    echo -e "   🌐 URL: https://$DOMAIN_NAME"
else
    echo -e "   🌐 URL: http://$DOMAIN_NAME"
fi
echo -e "   📁 Directorio: $APP_DIR"
echo -e "   🔧 Puerto interno: $SERVICE_PORT"
echo -e "   📊 Logs: /var/log/$APP_NAME/"
echo -e "   ⚡ Node.js: $(node --version) (compatible con react-router-dom v7)"
echo ""
echo -e "${YELLOW}🛠️ Comandos útiles:${NC}"
echo -e "   $APP_NAME-manage start       # Iniciar aplicación"
echo -e "   $APP_NAME-manage stop        # Detener aplicación"
echo -e "   $APP_NAME-manage restart     # Reiniciar aplicación"
echo -e "   $APP_NAME-manage status      # Ver estado de servicios"
echo -e "   $APP_NAME-manage logs        # Ver logs (logs backend|frontend)"
echo -e "   $APP_NAME-manage diagnose    # Diagnóstico completo"
echo -e "   $APP_NAME-manage test-api    # Probar APIs"
echo -e "   $APP_NAME-manage verify-ssl  # Verificar configuración SSL"
echo -e "   $APP_NAME-manage setup-ssl   # Configurar certificados SSL"
echo -e "   $APP_NAME-manage update      # Actualizar aplicación"
echo ""
echo -e "   systemctl status nginx     # Estado de nginx"
echo -e "   pm2 monit                  # Monitor PM2"
if [ "$SETUP_SSL" = "true" ]; then
    echo -e "   certbot certificates      # Ver certificados SSL"
    echo -e "   certbot renew --dry-run   # Probar renovación SSL"
fi
echo ""
if [ "$SETUP_SSL" = "true" ]; then
    echo -e "${GREEN}🎉 La aplicación está disponible en: https://$DOMAIN_NAME${NC}"
else
    echo -e "${GREEN}🎉 La aplicación está disponible en: http://$DOMAIN_NAME${NC}"
fi 