# Guía de Despliegue de la API en VPS (Ubuntu Server)

Esta guía detalla paso a paso el proceso de instalación, configuración y seguridad necesario para desplegar el backend de la API en un VPS con **Ubuntu Server**, asegurando la persistencia de procesos con **PM2**, cifrado SSL con **Let's Encrypt** y comunicación TCP nativa para los candados Omni en el puerto **8888**.

---

## 📋 Requisitos Previos e Instalación de Utilidades Básicas

Inicia sesión en tu VPS a través de SSH y ejecuta la actualización del gestor de paquetes de Ubuntu:

```bash
# 1. Actualizar el listado de paquetes y el sistema operativo
sudo apt update && sudo apt upgrade -y

# 2. Instalar herramientas esenciales de compilación y red
sudo apt install -y git curl wget build-essential unzip net-tools htop
```

---

## 🟢 1. Instalación de Node.js y npm (vía NVM)

Usar **NVM** (Node Version Manager) es la mejor práctica para evitar problemas de permisos de administrador (`sudo`) al instalar dependencias globales.

```bash
# 1. Descargar e instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. Activar NVM en la sesión actual de la terminal
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Instalar la versión estable más reciente de Node.js 20 LTS
nvm install 20

# 4. Verificar que se instaló correctamente
node -v
npm -v
```

---

## 🔒 2. Configuración de Seguridad y Firewall (UFW)

Para que los candados Omni físicos puedan transmitir tramas TCP (`C0`) a la API de producción, es indispensable habilitar el puerto **8888** en el firewall del VPS.

```bash
# 1. Permitir conexión SSH (¡Esencial para no perder el acceso al VPS!)
sudo ufw allow OpenSSH

# 2. Permitir el tráfico Web estándar (HTTP puerto 80 y HTTPS puerto 443)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 3. Permitir el puerto interno de la API (ej. puerto 3002)
sudo ufw allow 3002/tcp

# 4. Habilitar la escucha TCP nativa en el puerto del servicio de Candados Omni
sudo ufw allow 8888/tcp

# 5. Activar el Firewall
sudo ufw enable

# 6. Comprobar que los puertos están abiertos y activos
sudo ufw status verbose
```

---

## 🗄️ 3. Conectividad de Base de Datos (MySQL)

### Opción A: Cliente MySQL (Si la base de datos es externa/Hostinger Cloud)
Si tu base de datos ya está alojada de manera externa, instala el cliente para poder realizar verificaciones de conectividad:

```bash
sudo apt install -y mysql-client
```

### Opción B: Servidor MySQL Local (Si se aloja en el mismo VPS)
Si deseas instalar el motor de base de datos directamente en el VPS:

```bash
# 1. Instalar el servidor de MySQL
sudo apt install -y mysql-server

# 2. Habilitar el inicio automático del servicio
sudo systemctl start mysql
sudo systemctl enable mysql

# 3. Ejecutar el asistente de seguridad
sudo mysql_secure_installation
```

---

## 📂 4. Clonado e Instalación del Backend

```bash
# 1. Crear directorio para tus proyectos
mkdir -p ~/projects && cd ~/projects

# 2. Clonar el repositorio
git clone <URL_DE_TU_REPOSITORIO> app_nueva && cd app_nueva/api

# 3. Instalar todas las dependencias
npm install

# 4. Configurar las variables de entorno
cp .env.example .env
nano .env # Introduce tus datos de base de datos, puertos, JWT_SECRET, etc.
```

---

## ⚙️ 5. Gestión del Proceso en Segundo Plano (PM2)

**PM2** mantendrá tu API ejecutándose en segundo plano, la reiniciará automáticamente si la aplicación experimenta un fallo o error en tiempo de ejecución, y la levantará tras un reinicio físico del servidor VPS.

```bash
# 1. Instalar PM2 globalmente
npm install -g pm2

# 2. Iniciar la API con un alias descriptivo
pm2 start index.js --name "api-monteria"

# 3. Configurar el inicio de PM2 como servicio del sistema
pm2 startup
# (La terminal imprimirá una línea de código con comando 'sudo' que debes copiar y ejecutar)

# 4. Guardar los procesos actuales en la configuración de PM2
pm2 save

# ⚠️ Comandos útiles de PM2 para administración:
pm2 status                  # Estado de la API
pm2 logs                    # Visualizar bitácoras en tiempo real
pm2 restart api-monteria    # Reiniciar proceso (necesario si actualizas el código)
```

---

## 🌐 6. Proxy Inverso con Nginx y Certificado SSL (HTTPS)

### Configuración del Servidor Web Nginx
Nginx recibirá el tráfico HTTPS externo en el puerto 443 de forma segura y lo redirigirá internamente a tu proceso Node de PM2.

```bash
# 1. Instalar Nginx en Ubuntu
sudo apt install -y nginx

# 2. Crear archivo de bloque de configuración para tu subdominio
sudo nano /etc/nginx/sites-available/api-monteria.movilidadsostenible.cloud
```

Pega la siguiente estructura dentro del archivo (reemplaza `3002` por el puerto de tu API si es diferente):

```nginx
server {
    listen 80;
    server_name api-monteria.movilidadsostenible.cloud;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 3. Activar el sitio creando un enlace simbólico
sudo ln -s /etc/nginx/sites-available/api-monteria.movilidadsostenible.cloud /etc/nginx/sites-enabled/

# 4. Verificar que no haya errores de sintaxis en Nginx y recargar el servicio
sudo nginx -t
sudo systemctl restart nginx
```

---

### Obtención de Certificado SSL de Let's Encrypt

```bash
# 1. Instalar Certbot de Let's Encrypt para Nginx
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtener y configurar automáticamente el certificado SSL (HTTPS)
sudo certbot --nginx -d api-monteria.movilidadsostenible.cloud

# (Sigue las instrucciones en pantalla; Certbot reescribirá el bloque de Nginx con la configuración HTTPS y redirecciones automáticas).
```

---

## 🧪 7. Pruebas de Conectividad (Verificar puerto del Candado TCP)

Para garantizar que el puerto **8888** está abierto al mundo exterior y escuchando correctamente:

```bash
# Ejecutar este comando en la consola de tu computadora local para verificar conexión TCP
nc -zv <IP_O_DOMINIO_DEL_VPS> 8888

# Una respuesta exitosa lucirá de la siguiente manera:
# Connection to movilidadsostenible.cloud port 8888 [tcp] succeeded!
```
