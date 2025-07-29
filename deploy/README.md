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

## 🔐 Configuración SSL Mejorada

### Detección Automática de Certificados

El sistema ahora detecta automáticamente los certificados SSL en el directorio `deploy/`:

**Tipos de archivos soportados:**
- **Certificados**: `.crt`, `.cert`, `.pem` (que contengan `BEGIN CERTIFICATE`)
- **Claves privadas**: `.key`, `.pem` (que contengan `BEGIN PRIVATE KEY` o `BEGIN RSA PRIVATE KEY`)
- **Bundles/Cadenas**: archivos con múltiples certificados o que contengan `bundle`, `intermediate`, `chain`

### Despliegue con SSL Automático

```bash
# Opción 1: SSL automático con detección de certificados
export DOMAIN_NAME="global-deer.com"
export SETUP_SSL="true"
sudo ./deploy/deploy.sh
```

### Configuración Manual de SSL

Si ya ejecutaste el deploy sin SSL, puedes configurarlo manualmente:

```bash
# Para certificados existentes (detección automática)
sudo ./deploy/setup-ssl-existing.sh

# Para generar nuevos con Certbot
sudo ./deploy/setup-ssl.sh
```

### Validación de Certificados

El sistema ahora incluye validación automática:

- ✅ **Formato válido**: Verifica que sean certificados/claves PEM válidos
- ✅ **Coincidencia**: Confirma que el certificado y clave privada coinciden
- ✅ **Información**: Muestra detalles del certificado antes de instalar
- ✅ **Confirmación**: Solicita confirmación antes de proceder

### Estructura de archivos SSL después del despliegue

```
/etc/nginx/ssl/
├── global-deer.com.crt           # Certificado principal
├── global-deer.com.key           # Clave privada
├── global-deer.com-bundle.crt    # Bundle de certificados intermedios (si existe)
└── global-deer.com-fullchain.crt # Certificado completo (cert + bundle)
```

### Verificar configuración SSL

```bash
# Verificación completa automatizada
./deploy/verify-ssl.sh

# Tests individuales
nginx -t                           # Verificar configuración nginx
curl -I https://global-deer.com   # Test de conectividad HTTPS
openssl s_client -connect global-deer.com:443  # Test del certificado

# Ver información del certificado
openssl x509 -in /etc/nginx/ssl/global-deer.com.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:)"
```

### Preparar Certificados SSL

**Para usar certificados propios:**

1. **Coloca los archivos en `deploy/`**:
   ```bash
   # Ejemplos de nombres válidos:
   deploy/certificado.crt      # o .cert, .pem
   deploy/clave-privada.key    # o .pem
   deploy/bundle.crt           # opcional
   ```

2. **Verificar formato**:
   ```bash
   # El certificado debe comenzar con:
   -----BEGIN CERTIFICATE-----
   
   # La clave privada debe comenzar con:
   -----BEGIN PRIVATE KEY-----
   # o
   -----BEGIN RSA PRIVATE KEY-----
   ```

3. **Ejecutar deploy con SSL**:
   ```bash
   export DOMAIN_NAME="tu-dominio.com"
   export SETUP_SSL="true"
   sudo ./deploy/deploy.sh
   ```

### Solución de Problemas SSL

**Error: "PEM_read_bio_PrivateKey() failed"**
```bash
# Verificar que la clave privada es válida
openssl rsa -in deploy/tu-clave.key -check -noout

# Si falla, el archivo puede estar corrupto o en formato incorrecto
```

**Error: "certificate verify failed"**
```bash
# Verificar que certificado y clave coinciden
cert_hash=$(openssl x509 -noout -modulus -in deploy/cert.crt | openssl md5)
key_hash=$(openssl rsa -noout -modulus -in deploy/key.key | openssl md5)
echo "Cert: $cert_hash"
echo "Key:  $key_hash"
# Deben ser idénticos
```

**Dominio no accesible externamente**
```bash
# Para desarrollo local sin dominio real:
export DOMAIN_NAME="localhost"
export SETUP_SSL="false"  # Deshabilitar SSL
sudo ./deploy/deploy.sh

# Luego configurar SSL manualmente si obtienes certificados
```

### Renovación de certificados

**Para certificados existentes:**
1. Obtén los nuevos archivos del proveedor
2. Reemplaza los archivos en `deploy/`
3. Ejecuta: `sudo ./deploy/setup-ssl-existing.sh`

**Para certificados de Let's Encrypt:**
```bash
# Renovación automática (ya configurada)
certbot renew --dry-run   # Probar renovación

# Renovación manual
certbot renew
systemctl restart nginx
```

### Configuración SSL Avanzada

**Personalizar configuración SSL en nginx:**

1. Editar `/etc/nginx/sites-available/psi-mammoliti`
2. Modificar parámetros SSL según necesidades
3. Verificar: `nginx -t`
4. Aplicar: `systemctl restart nginx`

**Parámetros SSL configurados:**
- Protocolos: TLSv1.2, TLSv1.3
- Ciphers modernos y seguros
- HSTS habilitado
- OCSP Stapling activado
- Headers de seguridad 