#!/bin/bash

# ==============================================================================
# Script de Despliegue Automatizado para el VPS (API Montería - api_global)
# ==============================================================================
# Este script se encarga de:
# 1. Hacer pull de los últimos cambios de la rama 'protocolo'.
# 2. Instalar dependencias si es necesario.
# 3. Limpiar los archivos de registro (logs) de PM2.
# 4. Reiniciar o iniciar el proceso de la API en PM2.
# ==============================================================================

# Colores para salida en consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${BLUE}=== INICIANDO PROCESO DE DESPLIEGUE AUTOMÁTICO ===${NC}"

# 1. Confirmar que estamos en un repositorio Git
if [ ! -d "../.git" ] && [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: No se detectó un repositorio Git activo. Asegúrate de ejecutar este script dentro del directorio 'api_global'.${NC}"
    exit 1
fi

# 2. Actualizar el código desde Git de la rama 'protocolo'
echo -e "${YELLOW}[1/4] Obteniendo últimos cambios de la rama 'protocolo' de Git...${NC}"
git fetch origin

# Asegurar que estamos en la rama correcta
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "protocolo" ]; then
    echo -e "${YELLOW}Cambiando a la rama 'protocolo'...${NC}"
    git checkout protocolo
fi

# Hacer pull de los cambios
git pull origin protocolo
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Falló el git pull desde origin. Revisa tu conexión o conflictos.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Código actualizado exitosamente.${NC}"

# 3. Instalar/Actualizar dependencias de npm
echo -e "${YELLOW}[2/4] Comprobando e instalando nuevas dependencias con npm...${NC}"
npm install --no-audit --no-fund
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Falló la instalación de dependencias npm.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencias instaladas/actualizadas.${NC}"

# 4. Limpiar registros antiguos de PM2 (Logs)
echo -e "${YELLOW}[3/4] Limpiando logs antiguos de PM2...${NC}"
pm2 flush
echo -e "${GREEN}✅ Historial de logs vaciado.${NC}"

# 5. Reiniciar o levantar el proceso de la API
echo -e "${YELLOW}[4/4] Administrando proceso en PM2...${NC}"

# Buscar si el proceso 'api-monteria' ya existe en PM2
pm2 describe api-monteria > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${BLUE}El proceso 'api-monteria' ya existe. Reiniciándolo...${NC}"
    pm2 restart api-monteria
else
    echo -e "${BLUE}El proceso 'api-monteria' no está registrado. Iniciando desde cero...${NC}"
    pm2 start index.js --name "api-monteria"
fi

# Guardar el estado actual de PM2 para que sobreviva a reinicios del servidor
pm2 save

echo -e "\n${GREEN}=== Despliegue completado con éxito ===${NC}\n"

# Mostrar estado de PM2
pm2 status api-monteria

# Mostrar los últimos 15 logs para verificar inicio exitoso
echo -e "\n${YELLOW}=== Mostrando últimas 15 líneas de logs de la API (Presiona Ctrl+C para salir) ===${NC}\n"
pm2 logs api-monteria --lines 15 --no-daemon


#ejecutar deploy automatico
## chmod +x deploy.sh
### ./deploy.sh 
#### sudo ./deploy.sh