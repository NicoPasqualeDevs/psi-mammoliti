# Guía de Despliegue - Psi Mammoliti

Esta guía describe cómo desplegar la aplicación **Psi Mammoliti** en una VM con Debian usando nginx como proxy inverso.

## 📋 Prerrequisitos

- VM con Debian 10/11/12
- Acceso root o sudo
- Conexión a Internet
- Al menos 2GB de RAM y 10GB de espacio libre

## 🚀 Instalación Automática

### Opción 1: Script Completo

```bash
# Clonar el repositorio
git clone <tu-repositorio> /tmp/psi-mammoliti
cd /tmp/psi-mammoliti

# Hacer ejecutable el script
chmod +x deploy/deploy.sh

# Ejecutar despliegue (como root)
sudo ./deploy/deploy.sh
```

### Opción 2: Con Dominio Personalizado

```bash
# Configurar dominio antes del despliegue
export DOMAIN_NAME="tu-dominio.com"
sudo ./deploy/deploy.sh
```

### Opción 3: Con SSL Habilitado

```bash
# Para habilitar SSL automáticamente
export DOMAIN_NAME="global-deer.com"
export SETUP_SSL="true"
sudo ./deploy/deploy.sh
```

**Nota**: El script detectará automáticamente si existen certificados SSL específicos para `global-deer.com` en el directorio `deploy/` y los usará en lugar de generar nuevos con Certbot.

## 🔧 Lo que hace el script

1. **Actualiza el sistema** Debian
2. **Instala dependencias**:
   - Node.js 18.x
   - nginx
   - PM2
   - Herramientas básicas
3. **Configura la aplicación**:
   - Crea directorio `/var/www/psi-mammoliti`
   - Instala dependencias npm
   - Construye la aplicación para producción
4. **Configura nginx**:
   - Proxy inverso al puerto 3000
   - Compresión gzip
   - Headers de seguridad
5. **Configura servicios**:
   - PM2 para gestión de procesos
   - Autostart en reinicio del sistema
   - Firewall básico (puertos 22, 80 y 443 si SSL está habilitado)
6. **Configura SSL** (si está habilitado):
   - Detecta certificados existentes para global-deer.com
   - Configura nginx con HTTPS y redirección automática
   - Implementa configuración SSL moderna y segura

## 📁 Estructura después del despliegue

```
/var/www/psi-mammoliti/          # Aplicación
├── build/                       # Archivos compilados
├── src/                         # Código fuente
├── package.json                 # Dependencias
└── ecosystem.config.js          # Configuración PM2

/etc/nginx/sites-available/      # Configuración nginx
├── psi-mammoliti

/var/log/psi-mammoliti/          # Logs de aplicación
├── error.log
├── out.log
└── combined.log

/var/log/nginx/                  # Logs de nginx
├── psi-mammoliti_access.log
└── psi-mammoliti_error.log
```

## 🛠️ Gestión de la aplicación

Después del despliegue, puedes usar estos comandos:

```bash
# Gestión de la aplicación
psi-mammoliti-manage start      # Iniciar
psi-mammoliti-manage stop       # Detener  
psi-mammoliti-manage restart    # Reiniciar
psi-mammoliti-manage status     # Ver estado
psi-mammoliti-manage logs       # Ver logs
psi-mammoliti-manage update     # Actualizar desde git

# Gestión de nginx
systemctl start nginx          # Iniciar nginx
systemctl stop nginx           # Detener nginx
systemctl restart nginx        # Reiniciar nginx
systemctl status nginx         # Estado de nginx

# Gestión directa con PM2
pm2 status                      # Estado de procesos
pm2 logs psi-mammoliti         # Ver logs en tiempo real
pm2 monit                       # Monitor interactivo
pm2 restart psi-mammoliti      # Reiniciar aplicación
```

## 🔍 Verificación del despliegue

1. **Verificar que nginx está funcionando**:
   ```bash
   systemctl status nginx
   curl -I http://localhost
   ```

2. **Verificar que la aplicación está corriendo**:
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

3. **Verificar que el proxy funciona**:
   ```bash
   # Para HTTP
   curl -I http://tu-dominio.com
   
   # Para HTTPS (si SSL está configurado)
   curl -I https://global-deer.com
   ```

4. **Verificar certificados SSL** (si está configurado):
   ```bash
   # Verificar estado del certificado
   openssl s_client -connect global-deer.com:443 -servername global-deer.com
   
   # Ver detalles del certificado
   openssl x509 -in /etc/nginx/ssl/global-deer.com.crt -text -noout
   ```

## 📊 Logs y monitoreo

### Ver logs de aplicación
```bash
# Logs en tiempo real
pm2 logs psi-mammoliti

# Logs específicos
tail -f /var/log/psi-mammoliti/combined.log
tail -f /var/log/psi-mammoliti/error.log
```

### Ver logs de nginx
```bash
# Logs de acceso
tail -f /var/log/nginx/psi-mammoliti_access.log

# Logs de errores
tail -f /var/log/nginx/psi-mammoliti_error.log
```

## 🔧 Configuración avanzada

### Cambiar el puerto de la aplicación

1. Editar `/var/www/psi-mammoliti/ecosystem.config.js`
2. Cambiar el valor de `SERVICE_PORT`
3. Actualizar nginx: `/etc/nginx/sites-available/psi-mammoliti`
4. Reiniciar servicios:
   ```bash
   pm2 restart psi-mammoliti
   nginx -t && systemctl reload nginx
   ```

### Configurar dominio adicional

1. Editar `/etc/nginx/sites-available/psi-mammoliti`
2. Agregar el dominio a `server_name`:
   ```nginx
   server_name mi-dominio.com otro-dominio.com;
   ```
3. Recargar nginx: `systemctl reload nginx`

## 🐛 Solución de problemas

### La aplicación no inicia
```bash
# Verificar logs
pm2 logs psi-mammoliti
cat /var/log/psi-mammoliti/error.log

# Reiniciar proceso
pm2 restart psi-mammoliti
```

### Error 502 Bad Gateway
```bash
# Verificar que la aplicación está corriendo
pm2 status

# Verificar conexión interna
curl http://localhost:3000

# Verificar configuración nginx
nginx -t
```

### Error de permisos
```bash
# Corregir permisos
chown -R www-data:www-data /var/www/psi-mammoliti
chmod -R 755 /var/www/psi-mammoliti
```

## 🔄 Actualizar la aplicación

Para actualizar la aplicación desde git:

```bash
# Método automático
psi-mammoliti-manage update

# Método manual
cd /var/www/psi-mammoliti
git pull
npm ci --only=production
npm run build
pm2 restart psi-mammoliti
```

## 🛡️ Seguridad

El script configura:
- Firewall básico (ufw)
- Headers de seguridad en nginx
- Usuarios del sistema apropiados

### Recomendaciones adicionales:
- Configurar SSH con claves
- Actualizar sistema regularmente
- Monitorear logs
- Configurar SSL/TLS (Certbot)

## 🔐 Configuración SSL Específica para global-deer.com

### Certificados existentes

El proyecto incluye certificados SSL específicos para el dominio `global-deer.com`:

- `deploy/e27b3c236ad504e7.crt` - Certificado principal
- `deploy/e27b3c236ad504e7.pem` - Clave privada  
- `deploy/gd_bundle-g2.crt` - Certificados intermedios

### Despliegue con SSL

Para habilitar SSL automáticamente:

```bash
export DOMAIN_NAME="global-deer.com"
export SETUP_SSL="true"
sudo ./deploy/deploy.sh
```

### Configuración manual de SSL

Si necesitas configurar SSL manualmente después del despliegue:

```bash
# Ejecutar script específico para certificados existentes
sudo ./deploy/setup-ssl-existing.sh
```

### Estructura de archivos SSL después del despliegue

```
/etc/nginx/ssl/
├── global-deer.com.crt           # Certificado principal
├── global-deer.com.key           # Clave privada
├── global-deer.com-bundle.crt    # Bundle de certificados intermedios
└── global-deer.com-fullchain.crt # Certificado completo (cert + bundle)
```

### Verificar configuración SSL

```bash
# Test de conectividad SSL
curl -I https://global-deer.com

# Verificar configuración nginx
nginx -t

# Ver información del certificado
openssl x509 -in /etc/nginx/ssl/global-deer.com.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:)"

# Test de SSL completo
openssl s_client -connect global-deer.com:443 -servername global-deer.com
```

### Renovación de certificados

Para renovar los certificados SSL:

1. Obtén los nuevos archivos del proveedor
2. Reemplaza los archivos en `deploy/`
3. Ejecuta: `sudo ./deploy/setup-ssl-existing.sh`

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs mencionados arriba
2. Verifica que todos los servicios estén corriendo
3. Comprueba la configuración de red/firewall
4. Para problemas SSL, verifica que los certificados sean válidos y estén en el formato correcto 