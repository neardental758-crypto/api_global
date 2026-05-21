# 📡 Manual de Configuración e Integración — Candados Omni TCP (E-Bike Version)

Este manual documenta el procedimiento paso a paso para configurar los candados inteligentes **Omni Horseshoe Lock** físicos para conectarse al servidor de producción en **Hostinger**, así como los pasos para operarlos directamente desde el **Dashboard**.

---

## 1. Configuración del Candado Físico (Vía Bluetooth)

La forma más ágil y recomendada de configurar el candado físico es usando la **App del desarrollador** provista por el fabricante del candado, conectándote de forma directa por **Bluetooth (BLE)**.

### Pasos de Configuración:
1. Asegúrate de que el candado tenga instalada una **tarjeta SIM** activa con plan de datos móviles (GSM/GPRS/3G/4G).
2. Abre la app del desarrollador de Omni en tu teléfono y conéctate al candado vía Bluetooth.
3. Rellena los siguientes campos de configuración:
   * **APN (Nombre de Punto de Acceso)**: Ingresa el APN exacto del operador celular de tu SIM card (ej. en Colombia: `internet.comcel.com.co` para Claro, o `movistar.com.co` para Movistar). Deja los campos de usuario y contraseña en blanco a menos que el operador los exija.
   * **IP del Servidor**: Ingresa la **IP Pública** o el **Dominio** de tu servidor Node.js en Hostinger.
   * **Puerto del Servidor**: `8888` *(el puerto por defecto del servidor TCP)*.
4. Guarda los cambios. El candado guardará la información en su memoria interna, se reiniciará y buscará conectarse al servidor.

---

## 2. Configuración Alternativa (Vía Mensajes de Texto SMS)

Si no tienes acceso a la app de desarrollo por Bluetooth, puedes configurar el candado de forma remota enviando mensajes SMS desde tu teléfono móvil al **número de la SIM card del candado**:

### A. Configurar el APN del Operador Celular
Envía el siguiente SMS al número del candado:
```text
*SCOS,OM,1,2,nombre_apn,usuario_apn,contraseña_apn#
```
* *Ejemplo (Claro)*: `*SCOS,OM,1,2,internet.comcel.com.co,,,#`
* *Respuesta esperada del candado*: `*SCOS,OM,1,2,OK#`

### B. Configurar la IP y Puerto del Servidor en Hostinger
Envía el siguiente SMS al número del candado:
```text
*SCOS,OM,1,1,ip_publica_servidor,8888#
```
* *Ejemplo*: `*SCOS,OM,1,1,109.106.244.12,8888#`
* *Respuesta esperada del candado*: `*SCOS,OM,1,1,OK#`

---

## 3. Requisito de Infraestructura en Hostinger (Firewall)

> [!IMPORTANT]  
> Para que el candado logre conectarse al servidor TCP, **debes abrir el puerto `8888` en el Firewall de tu servidor en Hostinger**.
> Si el puerto está bloqueado por el firewall, las tramas de los candados nunca llegarán a la API.

### Cómo abrir el puerto en Hostinger:
1. Ingresa al panel de control de tu VPS en Hostinger.
2. Ve a la sección de **Firewall** (o Configuración de Puertos del Sistema Operativo).
3. Agrega una nueva regla de entrada:
   * **Protocolo**: `TCP`
   * **Puerto**: `8888`
   * **Origen**: `Cualquiera (0.0.0.0/0)`
4. Aplica los cambios.

---

## 4. Cómo Operar y Desbloquear desde el Dashboard

Una vez el candado está configurado, con datos celulares, y conectado al servidor en vivo:

1. **Ingresa al Dashboard**: Abre la aplicación web en tu navegador (`dashboard_next`).
2. **Navega al Módulo**: Dirígete a la sección de **Candados** escribiendo la ruta `/locks` en la barra del navegador o seleccionándola en el menú lateral.
3. **Filtra por QR o IMEI**:
   * En la barra superior con el placeholder `Buscar imei, qr o N°Bicicleta`, escribe los últimos dígitos del **código QR** o el **IMEI** del candado físico.
   * Presiona **Enter** o haz clic en **Buscar**. El candado aparecerá listado al instante en la tabla.
4. **Solicita la Apertura**:
   * En la columna de **Acciones** de la fila del candado, haz clic en el botón de opciones y selecciona **"Abrir candado"**.
   * El sistema disparará la llamada HTTP `GET /api/openLock/:imei` de forma segura.
   * Si la operación es exitosa, se desplegará una ventana emergente en el dashboard confirmando la solicitud, y el candado físico se abrirá de manera automática en cuestión de segundos.

---

## 5. Funcionamiento Técnico Detrás de Escenas

* **Registro Inicial (Sign-in - `Q0`)**: El candado envía su primer paquete de saludo. El servidor asocia dinámicamente la conexión del socket TCP a la base de datos MySQL usando el IMEI y actualiza el nivel de batería.
* **Latido de Estado (Heartbeat - `H0`)**: Cada cierto tiempo, el candado envía su porcentaje de batería, fuerza de señal GSM y si su pestillo físico se encuentra abierto (`open`) o cerrado (`closed`). Sequelize sincroniza este estado al instante en la tabla `bc_candados`.
* **Coordenadas GPS (Positioning - `D0`)**: El candado transmite su latitud y longitud en formato NMEA (`ddmm.mmmm`). El servidor TCP convierte matemáticamente la trama a grados decimales estándar de latitud/longitud y actualiza la ubicación geográfica en la base de datos para mostrarla en el mapa del administrador.
