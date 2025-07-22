#!/bin/bash

# Script de diagnóstico específico para React y PM2
# Ayuda a identificar por qué la aplicación React no se muestra

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
APP_NAME="psi-mammoliti"
APP_DIR="/var/www/$APP_NAME"
SERVICE_PORT="3000"

echo -e "${BLUE}🔍 Diagnóstico React + PM2 para $APP_NAME${NC}"
echo "=================================================="

# 1. Verificar directorio build
echo -e "\n${YELLOW}📁 Verificando directorio build...${NC}"
if [ -d "$APP_DIR/build" ]; then
    echo -e "${GREEN}✅ Directorio build existe${NC}"
    echo "Contenido del directorio build:"
    ls -la "$APP_DIR/build" | head -10
    
    if [ -f "$APP_DIR/build/index.html" ]; then
        echo -e "${GREEN}✅ index.html existe${NC}"
        echo "Primeras líneas de index.html:"
        head -5 "$APP_DIR/build/index.html"
    else
        echo -e "${RED}❌ index.html NO existe${NC}"
    fi
else
    echo -e "${RED}❌ Directorio build NO existe${NC}"
fi

# 2. Verificar configuración PM2
echo -e "\n${YELLOW}⚙️ Verificando configuración PM2...${NC}"
if [ -f "$APP_DIR/ecosystem.config.js" ]; then
    echo -e "${GREEN}✅ ecosystem.config.js existe${NC}"
    echo "Configuración PM2:"
    cat "$APP_DIR/ecosystem.config.js"
else
    echo -e "${RED}❌ ecosystem.config.js NO existe${NC}"
fi

# 3. Estado actual de PM2
echo -e "\n${YELLOW}📊 Estado de PM2...${NC}"
pm2 status
echo ""
pm2 describe "$APP_NAME" 2>/dev/null || echo "Aplicación no encontrada en PM2"

# 4. Verificar comando serve
echo -e "\n${YELLOW}🔧 Verificando comando serve...${NC}"
if command -v serve &> /dev/null; then
    echo -e "${GREEN}✅ serve está instalado${NC}"
    serve_version=$(serve --version 2>/dev/null || echo "versión desconocida")
    echo "Versión de serve: $serve_version"
else
    echo -e "${RED}❌ serve NO está instalado${NC}"
fi

# 5. Test manual del comando serve
echo -e "\n${YELLOW}🧪 Test manual del comando...${NC}"
if [ -d "$APP_DIR/build" ]; then
    echo "Intentando ejecutar: cd $APP_DIR && npx serve -s build -l $SERVICE_PORT"
    cd "$APP_DIR"
    
    # Test rápido en background
    timeout 5s npx serve -s build -l $SERVICE_PORT &
    serve_pid=$!
    sleep 2
    
    if kill -0 $serve_pid 2>/dev/null; then
        echo -e "${GREEN}✅ El comando serve funciona${NC}"
        if curl -s "http://localhost:$SERVICE_PORT" > /dev/null; then
            echo -e "${GREEN}✅ Responde en puerto $SERVICE_PORT${NC}"
        else
            echo -e "${RED}❌ No responde en puerto $SERVICE_PORT${NC}"
        fi
        kill $serve_pid 2>/dev/null || true
    else
        echo -e "${RED}❌ El comando serve falló${NC}"
    fi
else
    echo -e "${RED}❌ No se puede probar: directorio build no existe${NC}"
fi

# 6. Logs de PM2
echo -e "\n${YELLOW}📋 Logs de PM2...${NC}"
echo "=== Logs de error ==="
if [ -f "/var/log/$APP_NAME/error.log" ]; then
    tail -10 "/var/log/$APP_NAME/error.log" 2>/dev/null || echo "Log de error vacío"
else
    echo "Log de error no existe"
fi

echo -e "\n=== Logs de output ==="
if [ -f "/var/log/$APP_NAME/out.log" ]; then
    tail -10 "/var/log/$APP_NAME/out.log" 2>/dev/null || echo "Log de output vacío"
else
    echo "Log de output no existe"
fi

# 7. Test de conectividad
echo -e "\n${YELLOW}🌐 Test de conectividad...${NC}"
echo "Puerto $SERVICE_PORT:"
if curl -s -m 5 "http://localhost:$SERVICE_PORT" > /dev/null; then
    echo -e "${GREEN}✅ Responde${NC}"
    response=$(curl -s -m 5 "http://localhost:$SERVICE_PORT" | head -5)
    echo "Primeras líneas de la respuesta:"
    echo "$response"
else
    echo -e "${RED}❌ No responde${NC}"
fi

echo -e "\nPuerto 80 (nginx):"
if curl -s -m 5 "http://localhost" > /dev/null; then
    echo -e "${GREEN}✅ nginx responde${NC}"
else
    echo -e "${RED}❌ nginx no responde${NC}"
fi

# 8. Procesos relacionados
echo -e "\n${YELLOW}⚡ Procesos relacionados...${NC}"
echo "Procesos de node/serve:"
ps aux | grep -E "(node|serve|pm2)" | grep -v grep || echo "No hay procesos encontrados"

echo -e "\nPuertos en uso:"
netstat -tulpn | grep ":$SERVICE_PORT " || echo "Puerto $SERVICE_PORT no está en uso"

# 9. Verificar firewall (opcional)
echo -e "\n${YELLOW}🛡️ Verificando firewall...${NC}"
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        echo -e "${GREEN}✅ ufw está activo${NC}"
        if ufw status | grep -q "80"; then
            echo -e "${GREEN}✅ Puerto 80 abierto en ufw${NC}"
        else
            echo -e "${YELLOW}⚠️ Puerto 80 no está abierto en ufw${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ ufw no está activo${NC}"
    fi
else
    echo -e "${BLUE}ℹ️ ufw no está instalado (configuración opcional)${NC}"
fi

# 10. Sugerencias de solución
echo -e "\n${BLUE}💡 Sugerencias de solución:${NC}"
echo "============================================"

if [ ! -d "$APP_DIR/build" ]; then
    echo "1. Construir la aplicación:"
    echo "   cd $APP_DIR && npm run build"
fi

if ! command -v serve &> /dev/null; then
    echo "2. Instalar serve globalmente:"
    echo "   npm install -g serve"
fi

echo "3. Reiniciar PM2:"
echo "   pm2 restart $APP_NAME"

echo "4. Ver logs en tiempo real:"
echo "   pm2 logs $APP_NAME"

echo "5. Probar manualmente:"
echo "   cd $APP_DIR && npx serve -s build -l $SERVICE_PORT"

if ! command -v ufw &> /dev/null; then
    echo ""
    echo "6. Instalar firewall (recomendado para producción):"
    echo "   apt-get install ufw"
    echo "   ufw allow 22/tcp && ufw allow 80/tcp && ufw enable"
fi

echo -e "\n${GREEN}✅ Diagnóstico completado${NC}" 