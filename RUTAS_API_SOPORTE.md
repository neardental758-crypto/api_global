# 📚 Catálogo y Diccionario Técnico de Endpoints API (APP_nueva)

> **Propósito:** Documento técnico exhaustivo para alimentar herramientas de soporte automatizado, flujos de integración (n8n, webhooks, bots de atención), asistentes de IA y agentes operativos.
> **Base URL:** `https://movilidadsostenible.cloud/api`
> **Módulos:** 83 archivos de rutas | **Endpoints Totales:** 616 rutas documentadas.

---

## 📑 Tabla de Contenidos por Dominio de Negocio

1. [1. Préstamos, Candados y Operación de Bicicletas (Sistema 3G / 4G / 5G / Cortezza)](#1-pr-stamos-candados-y-operaci-n-de-bicicletas-sistema-3g-4g-5g-cortezza-)
2. [2. Usuarios, Autenticación, Roles y Empresas](#2-usuarios-autenticaci-n-roles-y-empresas)
3. [3. Carpooling / Auto Compartido (Módulo Compartido)](#3-carpooling-auto-compartido-m-dulo-compartido-)
4. [4. Parqueadero / Parqueo Inteligente](#4-parqueadero-parqueo-inteligente)
5. [5. Vehículos Particulares (VP) y Movilidad Propia](#5-veh-culos-particulares-vp-y-movilidad-propia)
6. [6. Gamificación, Desafíos, Logros, Inducción y Capacitación](#6-gamificaci-n-desaf-os-logros-inducci-n-y-capacitaci-n)
7. [7. Configuración General, Utilidades del Sistema y Archivos](#7-configuraci-n-general-utilidades-del-sistema-y-archivos)

---

## 🔐 Mecanismo de Autenticación para Automatizaciones (Soporte / n8n / Bots)

Casi todos los endpoints de la API están protegidos por el middleware `authMiddleware(["all"])`. Para que la automatización o bot tenga acceso a los datos, debe seguir este proceso estándar:

### 1. Endpoint de Inicio de Sesión (Login)
La automatización debe realizar una petición `POST` antes de ejecutar consultas protegidas (o al iniciar el flujo):

- **Método:** `POST`
- **URL:** `https://movilidadsostenible.cloud/api/users/login` (o `https://movilidadsostenible.cloud/api/bc_usuarios/login`)
- **Headers:** `Content-Type: application/json`
- **Body JSON:**
```json
{
  "user": "ride0@tuempresa.com",
  "password": "1234"
}
```

### 2. Respuesta y Token JWT
El servidor responderá con un token JWT firmado:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id_user": "12345678"
}
```
> **Duración del Token:** El token emitido por el sistema tiene permisos globales `['all']` y una vigencia extendida de hasta **1 año (365 días)**. No es necesario iniciar sesión antes de *cada* petición individual; basta con obtenerlo una vez y reutilizarlo en las consultas.

### 3. Inclusión del Header en Cada Petición Subsiguiente
En todas las peticiones a los endpoints documentados en este catálogo, añade el encabezado HTTP:
```http
Authorization: Bearer <TOKEN_JWT_OBTENIDO>
```

### 4. Manejo de Errores y Re-autenticación Automática
Si una consulta retorna código `401 Unauthorized` (`"NEED_SESSION"` o `"NOT_SESSION"`):
1. Capturar el error 401 en la automatización (ej. nodo Catch en n8n).
2. Ejecutar nuevamente el endpoint de login (`POST /api/users/login`).
3. Guardar el nuevo token y reintentar la consulta fallida.

---

## 🗂️ 1. Préstamos, Candados y Operación de Bicicletas (Sistema 3G / 4G / 5G / Cortezza)

> Endpoints críticos para la gestión operativa de préstamos de bicicletas, candados bluetooth/electrónicos, estaciones, reservas, reportes de soporte y finalización de viajes.

### 📦 Módulo: `bc_prestamos`

- **Prefijo de Ruta Base:** `/api/bc_prestamos`
- **Archivo de Rutas:** [`api/routes/bc_prestamos.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_prestamos.js)

| Método      | Ruta Completa                                               | Handler / Controlador                    | Autenticación y Validadores                                                      | Qué Consulta o Modifica                                                                                                                                                                                   | Caso de Uso / Soporte                                                                                                                            |
| :---------- | :---------------------------------------------------------- | :--------------------------------------- | :------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`GET`**   | `/api/bc_prestamos`                                         | `getItems`                               | `authMiddleware(["all"])`                                                        | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/id/:pre_id`                              | `getItem`                                | `authMiddleware(["all"])`<br>`validatorGetPrestamos`                             | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/prestamoActivos`                         | `getItemAllPrestamoActivos`              | `authMiddleware(["all"])`                                                        | **Lista global de todos los préstamos activos en tiempo real.**<br>_Consulta `bc_prestamos` con estado activo + JOIN usuarios y bicis._                                                                   | 💡 Monitorear flota en circulación y viajes sospechosos no cerrados.                                                                              |
| **`GET`**   | `/api/bc_prestamos/prestamoFinalizados`                     | `getItemAllPrestamoFinalizados`          | `authMiddleware(["all"])`                                                        | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/3g/prestamoFinalizados/:organizationId`  | `getItemAllPrestamoFinalizados3g`        | `authMiddleware(["all"])`<br>`validatorOrganizationId`                           | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/4g/prestamoFinalizados/:organizationId`  | `getItemAllPrestamoFinalizados4g`        | `authMiddleware(["all"])`<br>`validatorOrganizationId`                           | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/prestamoFinalizadosFilter`               | `getItemsToDate`                         | `authMiddleware(["all"])`                                                        | **Filtra préstamos finalizados por rango de fechas y parámetros.**<br>_Consulta `bc_prestamos` con filtros de fecha `pre_fecha_inicio`/`pre_fecha_fin`._                                                  | 💡 Auditoría de viajes en un rango de fechas para reportes o soporte corporativo.                                                                 |
| **`GET`**   | `/api/bc_prestamos/prestamoActivo/:pre_usuario`             | `getItemPrestamoActivo`                  | `authMiddleware(["all"])`<br>`validatorGetUsuario`                               | **Obtiene el préstamo activo actual de un usuario.**<br>_Consulta `bc_prestamos` WHERE `pre_usuario` = :pre_usuario AND `pre_estado` = 1 (Activo). Retorna ID de préstamo, bici, candado y fecha inicio._ | 💡 Permite a soporte saber si el usuario tiene un viaje colgado que le impida iniciar uno nuevo.                                                  |
| **`GET`**   | `/api/bc_prestamos/prestamoActivoPP/:pre_usuario`           | `getItemPrestamoActivoPP`                | `authMiddleware(["all"])`<br>`validatorGetUsuario`                               | **Obtiene el préstamo activo de Parqueo Particular (PP) de un usuario.**<br>_Consulta `bc_prestamos` tipo PP y estado activo._                                                                            | 💡 Verificar estado de préstamos de parqueo en soporte.                                                                                           |
| **`GET`**   | `/api/bc_prestamos/prestamoUsuario/:pre_usuario`            | `getItemPrestamosUsuario`                | `authMiddleware(["all"])`<br>`validatorGetUsuario`                               | **Historial completo de préstamos de un usuario.**<br>_Consulta `bc_prestamos` filtrando por `pre_usuario` ordenado descendentemente._                                                                    | 💡 Revisar viajes previos para reclamos de tiempo, cobros o penalizaciones.                                                                       |
| **`POST`**  | `/api/bc_prestamos/registrar`                               | `createItem`                             | `authMiddleware(["all"])`<br>`checkPrestamoActivo`<br>`validatorCreatePrestamos` | **Registra e inicia un nuevo préstamo de bicicleta.**<br>_Inserta en `bc_prestamos`, valida middleware `checkPrestamoActivo` y cambia estado de la bicicleta a 2 (Ocupada)._                              | 💡 Iniciar préstamo manualmente desde soporte o pruebas de integración.                                                                           |
| **`GET`**   | `/api/bc_prestamos/bicicleta/:bic_id`                       | `getItemByBicicleta`                     | `authMiddleware(["all"])`                                                        | **Consulta el último préstamo o préstamo activo de una bicicleta específica.**<br>_Consulta `bc_prestamos` WHERE `pre_bicicleta` = :bic_id._                                                              | 💡 Rastrear qué usuario tiene o tuvo una bicicleta ante reportes de abandono o robo.                                                              |
| **`POST`**  | `/api/bc_prestamos/updateEstado`                            | `updateItem`                             | `authMiddleware(["all"])`<br>`validatorGetPrestamos`                             | **Crea registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                               | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`PATCH`** | `/api/bc_prestamos/:pre_id`                                 | `patchItem`                              | `authMiddleware(["all"])`<br>`validatorGetPrestamos`                             | **Modifica registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`PUT`**   | `/api/bc_prestamos/updateState`                             | `updateItem`                             | `authMiddleware(["all"])`<br>`validatorGetPrestamos`                             | **Actualiza registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                          | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/reports`                                 | `getItemsForReports`                     | `authMiddleware(["all"])`                                                        | **Genera reportes estadísticos y métricas de préstamos por estación/empresa.**<br>_Agregaciones sobre `bc_prestamos`._                                                                                    | 💡 Generación de métricas de uso y estadísticas de soporte B2B.                                                                                   |
| **`GET`**   | `/api/bc_prestamos/reports/organization/:organizationId`    | `getItemsForReportsByOrganization`       | `authMiddleware(["all"])`<br>`validatorOrganizationId`                           | **Genera reportes estadísticos y métricas de préstamos por estación/empresa.**<br>_Agregaciones sobre `bc_prestamos`._                                                                                    | 💡 Generación de métricas de uso y estadísticas de soporte B2B.                                                                                   |
| **`GET`**   | `/api/bc_prestamos/reports/5g/organization/:organizationId` | `getItemsForReportsByOrganization5g`     | `authMiddleware(["all"])`<br>`validatorOrganizationId`                           | **Genera reportes estadísticos y métricas de préstamos por estación/empresa.**<br>_Agregaciones sobre `bc_prestamos`._                                                                                    | 💡 Generación de métricas de uso y estadísticas de soporte B2B.                                                                                   |
| **`GET`**   | `/api/bc_prestamos/reports/station/:stationId`              | `getItemsForReportsByStation`            | `authMiddleware(["all"])`<br>`validatorStationId`                                | **Genera reportes estadísticos y métricas de préstamos por estación/empresa.**<br>_Agregaciones sobre `bc_prestamos`._                                                                                    | 💡 Generación de métricas de uso y estadísticas de soporte B2B.                                                                                   |
| **`PATCH`** | `/api/bc_prestamos/finalize/3g/:pre_id`                     | `finalizeLoan`                           | `authMiddleware(["all"])`<br>`validatorFinalizeLoan`                             | **Finalización / Devolución asistida de préstamo tecnología 3G.**<br>_Actualiza `bc_prestamos` (pre_fecha_fin, estado=2/finalizado), libera candado 3G y pone bicicleta disponible._                      | 💡 ⚡ ACCIÓN DE SOPORTE CRÍTICA: Permite liberar forzosamente un préstamo cuando el usuario no pudo devolver la bici en la app o falló el candado. |
| **`PATCH`** | `/api/bc_prestamos/finalize/4g/:pre_id`                     | `finalizeLoan4g`                         | `authMiddleware(["all"])`<br>`validatorFinalizeLoan4g`                           | **Finalización / Devolución asistida de préstamo tecnología 4G.**<br>_Actualiza `bc_prestamos` (pre_fecha_fin, estado=2/finalizado), libera candado 4G y pone bicicleta disponible._                      | 💡 ⚡ ACCIÓN DE SOPORTE CRÍTICA: Permite liberar forzosamente un préstamo cuando el usuario no pudo devolver la bici en la app o falló el candado. |
| **`PATCH`** | `/api/bc_prestamos/finalize/5g/:pre_id`                     | `finalizeLoan5g`                         | `authMiddleware(["all"])`<br>`validatorFinalizeLoan5g`                           | **Finalización / Devolución asistida de préstamo tecnología 5G.**<br>_Actualiza `bc_prestamos` (pre_fecha_fin, estado=2/finalizado), libera candado 5G y pone bicicleta disponible._                      | 💡 ⚡ ACCIÓN DE SOPORTE CRÍTICA: Permite liberar forzosamente un préstamo cuando el usuario no pudo devolver la bici en la app o falló el candado. |
| **`GET`**   | `/api/bc_prestamos/all`                                     | `getItems_cortezza`                      | `authMiddleware(["external"])`                                                   | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/id_cortezza/:pre_id`                     | `getItem_cortezza`                       | `authMiddleware(["external"])`<br>`validatorGetPrestamos`                        | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/prestamoActivos_cortezza`                | `getItemAllPrestamoActivos_cortezza`     | `authMiddleware(["external"])`                                                   | **Lista global de todos los préstamos activos en tiempo real.**<br>_Consulta `bc_prestamos` con estado activo + JOIN usuarios y bicis._                                                                   | 💡 Monitorear flota en circulación y viajes sospechosos no cerrados.                                                                              |
| **`GET`**   | `/api/bc_prestamos/prestamoFinalizados_cortezza`            | `getItemAllPrestamoFinalizados_cortezza` | `authMiddleware(["external"])`                                                   | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/prestamoActivo_cortezza/:pre_usuario`    | `getItemPrestamoActivo_cortezza`         | `authMiddleware(["external"])`<br>`validatorGetUsuario`                          | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |
| **`GET`**   | `/api/bc_prestamos/prestamoUsuario_cortezza/:pre_usuario`   | `getItemPrestamosUsuario_cortezza`       | `authMiddleware(["external"])`<br>`validatorGetUsuario`                          | **Consulta registros de préstamos.**<br>_Tabla `bc_prestamos`._                                                                                                                                           | 💡 Gestión operativa del ciclo de vida del préstamo.                                                                                              |

---

### 📦 Módulo: `bc_bicicletas`

- **Prefijo de Ruta Base:** `/api/bc_bicicletas`
- **Archivo de Rutas:** [`api/routes/bc_bicicletas.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_bicicletas.js)

| Método      | Ruta Completa                                        | Handler / Controlador             | Autenticación y Validadores                                   | Qué Consulta o Modifica                                                                                                                                              | Caso de Uso / Soporte                                                                                 |
| :---------- | :--------------------------------------------------- | :-------------------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **`GET`**   | `/api/bc_bicicletas`                                 | `getItems`                        | `authMiddleware(["all"])`                                     | **Lista / Consulta bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                         | 💡 Administración de flota de bicicletas.                                                              |
| **`GET`**   | `/api/bc_bicicletas/bicicletero/`                    | `getItemsFilterToBicicleteros`    | `authMiddleware(["all"])`                                     | **Lista / Consulta bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                         | 💡 Administración de flota de bicicletas.                                                              |
| **`POST`**  | `/api/bc_bicicletas/updateKey`                       | `updateKey`                       | `authMiddleware(["all"])`                                     | **Registra bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                                 | 💡 Administración de flota de bicicletas.                                                              |
| **`GET`**   | `/api/bc_bicicletas/id/:bic_id`                      | `getItem`                         | `authMiddleware(["all"])`<br>`validatorGetBicycle`            | **Consulta la información completa de una bicicleta por su ID.**<br>_Tabla `bc_bicicletas`, modelo, tipo, estado actual, estación asignada y candado vinculado._     | 💡 Diagnóstico técnico de una bicicleta reportada con problemas.                                       |
| **`GET`**   | `/api/bc_bicicletas/reserva-activa/:bic_id`          | `getReservaActivaPorBicicleta`    | `authMiddleware(["all"])`<br>`validatorGetBicycle`            | **Verifica si una bicicleta tiene una reserva activa en curso.**<br>_Consulta `bc_reservas` y `bc_bicicletas` asociadas._                                            | 💡 Explicar a un usuario por qué una bicicleta no está disponible si está reservada por otro.          |
| **`GET`**   | `/api/bc_bicicletas/numeroVehiculo/:bic_numero`      | `getItemNumero`                   | `authMiddleware(["all"])`<br>`validatorGetNumero`             | **Busca una bicicleta por su número visible / código externo.**<br>_Tabla `bc_bicicletas` WHERE `bic_numero` = :bic_numero._                                         | 💡 Localizar bicicleta cuando el usuario solo indica el número impreso en el marco.                    |
| **`POST`**  | `/api/bc_bicicletas/registrarbicicleta`              | `createItem`                      | `authMiddleware(["all"])`<br>`validatorCreateBicycle`         | **Registra bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                                 | 💡 Administración de flota de bicicletas.                                                              |
| **`POST`**  | `/api/bc_bicicletas/updateEstado`                    | `updateItem`                      | `authMiddleware(["all"])`<br>`validatorUpdateBicycle`         | **Actualiza el estado operativo de la bicicleta (Disponible, En Mantenimiento, Dañada, En Préstamo).**<br>_UPDATE `bc_bicicletas` SET `bic_estado` = :nuevo_estado._ | 💡 ⚡ SOPORTE: Poner bicicleta en mantenimiento inmediatamente para evitar que otros usuarios la tomen. |
| **`PUT`**   | `/api/bc_bicicletas/updateEstadoDash`                | `updateEstadoDash`                | `authMiddleware(["all"])`<br>`validatorUpdateBicycle`         | **Actualiza el estado operativo de la bicicleta (Disponible, En Mantenimiento, Dañada, En Préstamo).**<br>_UPDATE `bc_bicicletas` SET `bic_estado` = :nuevo_estado._ | 💡 ⚡ SOPORTE: Poner bicicleta en mantenimiento inmediatamente para evitar que otros usuarios la tomen. |
| **`GET`**   | `/api/bc_bicicletas/estacion/:bic_estacion`          | `getItemEstacion`                 | `authMiddleware(["all"])`<br>`validatorGetNombre`             | **Lista las bicicletas ubicadas en una estación determinada.**<br>_Tabla `bc_bicicletas` WHERE `bic_estacion` = :estacion._                                          | 💡 Verificar inventario y disponibilidad en un punto físico.                                           |
| **`GET`**   | `/api/bc_bicicletas/flota/:bic_estacion`             | `getItemFlota`                    | `authMiddleware(["all"])`<br>`validatorGetNombre`             | **Lista / Consulta bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                         | 💡 Administración de flota de bicicletas.                                                              |
| **`GET`**   | `/api/bc_bicicletas/empresa/:empresaId`              | `getBicisEmpresa`                 | `authMiddleware(["all"])`<br>`validatorGetEmpresa`            | **Lista la flota de bicicletas asignadas a una empresa específica.**<br>_Tabla `bc_bicicletas` WHERE `bic_empresa` = :empresaId._                                    | 💡 Control de inventario de flota corporativa.                                                         |
| **`GET`**   | `/api/bc_bicicletas/estacion/:est_estacion`          | `getBicisByEstacion`              | `authMiddleware(["all"])`<br>`validatorGetEstacion`           | **Lista las bicicletas ubicadas en una estación determinada.**<br>_Tabla `bc_bicicletas` WHERE `bic_estacion` = :estacion._                                          | 💡 Verificar inventario y disponibilidad en un punto físico.                                           |
| **`PATCH`** | `/api/bc_bicicletas/:bic_id`                         | `patchItem`                       | `authMiddleware(["all"])`<br>`validatorPatchBicycle`          | **Actualiza bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                                | 💡 Administración de flota de bicicletas.                                                              |
| **`POST`**  | `/api/bc_bicicletas/bulk-microsistema`               | `bulkMicrosistema`                | `authMiddleware(["all"])`                                     | **Registra bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                                 | 💡 Administración de flota de bicicletas.                                                              |
| **`GET`**   | `/api/bc_bicicletas/bicicleta/:bicicletaId`          | `getMantenimientosPorBicicleta`   | `authMiddleware(["all"])`<br>`validatorGetPorBicicleta`       | **Lista / Consulta bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                         | 💡 Administración de flota de bicicletas.                                                              |
| **`PUT`**   | `/api/bc_bicicletas/sync-states`                     | `syncBikesStates`                 | `authMiddleware(["all"])`                                     | **Actualiza bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                                | 💡 Administración de flota de bicicletas.                                                              |
| **`GET`**   | `/api/bc_bicicletas/metrics/empresa/:empresaId`      | `getBikeMetrics`                  | `authMiddleware(["all"])`<br>`validatorGetEmpresa`            | **Lista la flota de bicicletas asignadas a una empresa específica.**<br>_Tabla `bc_bicicletas` WHERE `bic_empresa` = :empresaId._                                    | 💡 Control de inventario de flota corporativa.                                                         |
| **`GET`**   | `/api/bc_bicicletas/estado`                          | `getBicicletasPorEstado`          | `authMiddleware(["all"])`<br>`validatorGetPorEstado`          | **Lista / Consulta bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                         | 💡 Administración de flota de bicicletas.                                                              |
| **`GET`**   | `/api/bc_bicicletas/estacion/:estacion/estado`       | `getBicicletasPorEstadoYEstacion` | `authMiddleware(["all"])`<br>`validatorGetPorEstadoYEstacion` | **Lista las bicicletas ubicadas en una estación determinada.**<br>_Tabla `bc_bicicletas` WHERE `bic_estacion` = :estacion._                                          | 💡 Verificar inventario y disponibilidad en un punto físico.                                           |
| **`GET`**   | `/api/bc_bicicletas/empresa/:empresaId/estado`       | `getBicicletasPorEstadoYEmpresa`  | `authMiddleware(["all"])`<br>`validatorGetPorEstadoYEmpresa`  | **Lista la flota de bicicletas asignadas a una empresa específica.**<br>_Tabla `bc_bicicletas` WHERE `bic_empresa` = :empresaId._                                    | 💡 Control de inventario de flota corporativa.                                                         |
| **`GET`**   | `/api/bc_bicicletas/all`                             | `getItems_cortezza`               | `authMiddleware(["external"])`                                | **Lista / Consulta bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                         | 💡 Administración de flota de bicicletas.                                                              |
| **`GET`**   | `/api/bc_bicicletas/id_cortezza/:bic_id`             | `get_id_cortezza`                 | `authMiddleware(["external"])`<br>`validatorGetBicycle`       | **Lista / Consulta bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                         | 💡 Administración de flota de bicicletas.                                                              |
| **`GET`**   | `/api/bc_bicicletas/estacion_cortezza/:bic_estacion` | `getItemEstacion_cortezza`        | `authMiddleware(["external"])`<br>`validatorGetNombre`        | **Lista / Consulta bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                         | 💡 Administración de flota de bicicletas.                                                              |
| **`GET`**   | `/api/bc_bicicletas/flota_cortezza/:bic_estacion`    | `getItemFlota_cortezza`           | `authMiddleware(["external"])`<br>`validatorGetNombre`        | **Lista / Consulta bicicletas.**<br>_Tabla `bc_bicicletas`._                                                                                                         | 💡 Administración de flota de bicicletas.                                                              |

---

### 📦 Módulo: `bc_estaciones`

- **Prefijo de Ruta Base:** `/api/bc_estaciones`
- **Archivo de Rutas:** [`api/routes/bc_estaciones.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_estaciones.js)

| Método     | Ruta Completa                                      | Handler / Controlador | Autenticación y Validadores                             | Qué Consulta o Modifica                                                                                              | Caso de Uso / Soporte                                                      |
| :--------- | :------------------------------------------------- | :-------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **`GET`**  | `/api/bc_estaciones`                               | `getItems`            | _Público_                                               | **Consulta y administración de estaciones del sistema.**<br>_Tabla `bc_estaciones`._                                 | 💡 Control de infraestructura de anclaje.                                   |
| **`GET`**  | `/api/bc_estaciones/id/:est_id`                    | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetUser`         | **Detalle de una estación (capacidad total, anclajes disponibles, ubicación GPS).**<br>_Tabla `bc_estaciones`._      | 💡 Revisar estado de estaciones ante fallas de geolocalización o capacidad. |
| **`GET`**  | `/api/bc_estaciones/nombre/:est_estacion`          | `getItemNombre`       | `authMiddleware(["all"])`<br>`validatorGetNombre`       | **Consulta y administración de estaciones del sistema.**<br>_Tabla `bc_estaciones`._                                 | 💡 Control de infraestructura de anclaje.                                   |
| **`GET`**  | `/api/bc_estaciones/empresa/:est_empresa`          | `getItemEmpresa`      | `authMiddleware(["all"])`<br>`validatorGetEmpresa`      | **Lista estaciones pertenecientes a una organización.**<br>_Tabla `bc_estaciones` WHERE `est_empresa` = :empresaId._ | 💡 Validar sedes y estaciones autorizadas para un cliente.                  |
| **`GET`**  | `/api/bc_estaciones/estaciones/:est_empresa`       | `getItem_empresa`     | `authMiddleware(["all"])`<br>`validatorGetEmpresa`      | **Consulta y administración de estaciones del sistema.**<br>_Tabla `bc_estaciones`._                                 | 💡 Control de infraestructura de anclaje.                                   |
| **`POST`** | `/api/bc_estaciones/registrarestacion`             | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateEstacion`  | **Consulta y administración de estaciones del sistema.**<br>_Tabla `bc_estaciones`._                                 | 💡 Control de infraestructura de anclaje.                                   |
| **`PUT`**  | `/api/bc_estaciones/:est_id`                       | `updateEstacionData`  | `authMiddleware(["all"])`<br>`validatorUpdateEstacion`  | **Consulta y administración de estaciones del sistema.**<br>_Tabla `bc_estaciones`._                                 | 💡 Control de infraestructura de anclaje.                                   |
| **`GET`**  | `/api/bc_estaciones/all/`                          | `getItems_cortezza`   | `authMiddleware(["external"])`                          | **Consulta y administración de estaciones del sistema.**<br>_Tabla `bc_estaciones`._                                 | 💡 Control de infraestructura de anclaje.                                   |
| **`GET`**  | `/api/bc_estaciones/empresa_cortezza/:est_empresa` | `getItem_cortezza`    | `authMiddleware(["external"])`<br>`validatorGetEmpresa` | **Consulta y administración de estaciones del sistema.**<br>_Tabla `bc_estaciones`._                                 | 💡 Control de infraestructura de anclaje.                                   |

---

### 📦 Módulo: `bc_candados`

- **Prefijo de Ruta Base:** `/api/bc_candados`
- **Archivo de Rutas:** [`api/routes/bc_candados.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_candados.js)

| Método       | Ruta Completa                     | Handler / Controlador | Autenticación y Validadores                           | Qué Consulta o Modifica                                                                                     | Caso de Uso / Soporte                                        |
| :----------- | :-------------------------------- | :-------------------- | :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **`GET`**    | `/api/bc_candados`                | `getItems`            | `authMiddleware(['all'])`                             | **Gestión de candados inteligentes y anclajes electrónicos.**<br>_Tabla `bc_candados`._                     | 💡 Operación remota de cerrojos y candados.                   |
| **`GET`**    | `/api/bc_candados/id/:can_id`     | `getItem`             | `authMiddleware(['all'])`<br>`validatorGetCandado`    | **Consulta el estado, batería, tipo de comunicación y clave del candado por ID.**<br>_Tabla `bc_candados`._ | 💡 Revisar nivel de batería del candado y código de apertura. |
| **`GET`**    | `/api/bc_candados/imei/:can_imei` | `getItemByImei`       | `authMiddleware(['all'])`<br>`validatorGetByImei`     | **Busca candado por MAC Bluetooth o IMEI.**<br>_Tabla `bc_candados` por identificador de hardware._         | 💡 Soporte de hardware y sincronización Bluetooth.            |
| **`POST`**   | `/api/bc_candados`                | `createItem`          | `authMiddleware(['all'])`<br>`validatorCreateCandado` | **Gestión de candados inteligentes y anclajes electrónicos.**<br>_Tabla `bc_candados`._                     | 💡 Operación remota de cerrojos y candados.                   |
| **`PATCH`**  | `/api/bc_candados/:can_id`        | `updateItem`          | `authMiddleware(['all'])`<br>`validatorUpdateCandado` | **Gestión de candados inteligentes y anclajes electrónicos.**<br>_Tabla `bc_candados`._                     | 💡 Operación remota de cerrojos y candados.                   |
| **`DELETE`** | `/api/bc_candados/:can_id`        | `deleteItem`          | `authMiddleware(['all'])`<br>`validatorGetCandado`    | **Gestión de candados inteligentes y anclajes electrónicos.**<br>_Tabla `bc_candados`._                     | 💡 Operación remota de cerrojos y candados.                   |
| **`POST`**   | `/api/bc_candados/verifyData5g`   | `verifyData5g`        | `authMiddleware(['all'])`                             | **Gestión de candados inteligentes y anclajes electrónicos.**<br>_Tabla `bc_candados`._                     | 💡 Operación remota de cerrojos y candados.                   |

---

### 📦 Módulo: `bc_bicicleteros`

- **Prefijo de Ruta Base:** `/api/bc_bicicleteros`
- **Archivo de Rutas:** [`api/routes/bc_bicicleteros.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_bicicleteros.js)

| Método     | Ruta Completa                                                                   | Handler / Controlador   | Autenticación y Validadores                                | Qué Consulta o Modifica                                                                           | Caso de Uso / Soporte             |
| :--------- | :------------------------------------------------------------------------------ | :---------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------ | :-------------------------------- |
| **`GET`**  | `/api/bc_bicicleteros`                                                          | `getItems`              | `authMiddleware(["all"])`                                  | **Consulta / Obtiene registros del módulo bc_bicicleteros.**<br>_Tabla/Modelo `bc_bicicleteros`._ | 💡 Operaciones de bc_bicicleteros. |
| **`GET`**  | `/api/bc_bicicleteros/id/:bro_id`                                               | `getItem`               | `authMiddleware(["all"])`<br>`validatorGetBicicleteros`    | **Consulta / Obtiene registros del módulo bc_bicicleteros.**<br>_Tabla/Modelo `bc_bicicleteros`._ | 💡 Operaciones de bc_bicicleteros. |
| **`POST`** | `/api/bc_bicicleteros/registrarbicicleta`                                       | `createItem`            | `authMiddleware(["all"])`<br>`validatorCreateBicicleteros` | **Crea / Registra registros del módulo bc_bicicleteros.**<br>_Tabla/Modelo `bc_bicicleteros`._    | 💡 Operaciones de bc_bicicleteros. |
| **`GET`**  | `/api/bc_bicicleteros/estacion/:bro_estacion`                                   | `getItemsByEstacion`    | `authMiddleware(["all"])`<br>`validatorGetEstacion`        | **Consulta / Obtiene registros del módulo bc_bicicleteros.**<br>_Tabla/Modelo `bc_bicicleteros`._ | 💡 Operaciones de bc_bicicleteros. |
| **`GET`**  | `/api/bc_bicicleteros/estacion/:bro_estacion/bicicleta/:bro_bicicleta`          | `getItemClave`          | `authMiddleware(["all"])`<br>`validatorGetClave`           | **Consulta / Obtiene registros del módulo bc_bicicleteros.**<br>_Tabla/Modelo `bc_bicicleteros`._ | 💡 Operaciones de bc_bicicleteros. |
| **`POST`** | `/api/bc_bicicleteros/changeKey`                                                | `updateKey`             | `authMiddleware(["all"])`<br>`validatorGetKEY`             | **Crea / Registra registros del módulo bc_bicicleteros.**<br>_Tabla/Modelo `bc_bicicleteros`._    | 💡 Operaciones de bc_bicicleteros. |
| **`GET`**  | `/api/bc_bicicleteros/estacion_cortezza/:bro_estacion/bicicleta/:bro_bicicleta` | `getItemClave_cortezza` | `authMiddleware(["external"])`<br>`validatorGetClave`      | **Consulta / Obtiene registros del módulo bc_bicicleteros.**<br>_Tabla/Modelo `bc_bicicleteros`._ | 💡 Operaciones de bc_bicicleteros. |

---

### 📦 Módulo: `bc_reservas`

- **Prefijo de Ruta Base:** `/api/bc_reservas`
- **Archivo de Rutas:** [`api/routes/bc_reservas.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_reservas.js)

| Método     | Ruta Completa                                    | Handler / Controlador     | Autenticación y Validadores                              | Qué Consulta o Modifica                                                                               | Caso de Uso / Soporte                                  |
| :--------- | :----------------------------------------------- | :------------------------ | :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| **`GET`**  | `/api/bc_reservas`                               | `getItems`                | `authMiddleware(["all"])`                                | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`GET`**  | `/api/bc_reservas/id/:res_id`                    | `getItem`                 | `authMiddleware(["all"])`<br>`validatorGetReservas`      | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`GET`**  | `/api/bc_reservas/usuario/:res_usuario`          | `getItemUsuario`          | `authMiddleware(["all"])`<br>`validatorGetUsuario`       | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`POST`** | `/api/bc_reservas/registrar`                     | `createItem`              | `authMiddleware(["all"])`<br>`validatorCreateReservas`   | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`GET`**  | `/api/bc_reservas/4g/:emp_id`                    | `getReservas4G`           | `authMiddleware(["all"])`                                | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`GET`**  | `/api/bc_reservas/3g/:emp_id`                    | `getReservas3G`           | `authMiddleware(["all"])`                                | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`POST`** | `/api/bc_reservas/temporizador`                  | `temporizador`            | `authMiddleware(["all"])`                                | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`POST`** | `/api/bc_reservas/updateEstado`                  | `updateItem`              | `authMiddleware(["all"])`<br>`validatorGetReservas`      | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`POST`** | `/api/bc_reservas/updateVehiculo`                | `updateItemVehiculo`      | `authMiddleware(["all"])`<br>`validatorVehiculo`         | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`POST`** | `/api/bc_reservas/updateVehiculo`                | `updateItemVehiculo`      | `authMiddleware(["all"])`<br>`validatorVehiculo`         | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`GET`**  | `/api/bc_reservas/id_cortezza/:res_id`           | `getItem_cortezza`        | `authMiddleware(["external"])`<br>`validatorGetReservas` | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |
| **`GET`**  | `/api/bc_reservas/usuario_cortezza/:res_usuario` | `getItemUsuario_cortezza` | `authMiddleware(["external"])`<br>`validatorGetUsuario`  | **Consulta, creación y cancelación de reservas anticipadas de bicicletas.**<br>_Tabla `bc_reservas`._ | 💡 Verificar o cancelar reservas vencidas o duplicadas. |

---

### 📦 Módulo: `bc_agendado`

- **Prefijo de Ruta Base:** `/api/bc_agendado`
- **Archivo de Rutas:** [`api/routes/bc_agendado.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_agendado.js)

| Método      | Ruta Completa                          | Handler / Controlador | Autenticación y Validadores | Qué Consulta o Modifica                                                                      | Caso de Uso / Soporte         |
| :---------- | :------------------------------------- | :-------------------- | :-------------------------- | :------------------------------------------------------------------------------------------- | :---------------------------- |
| **`GET`**   | `/api/bc_agendado`                     | `getItems`            | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendado.**<br>_Tabla/Modelo `bc_agendado`._    | 💡 Operaciones de bc_agendado. |
| **`GET`**   | `/api/bc_agendado/id/:_id`             | `getItem`             | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendado.**<br>_Tabla/Modelo `bc_agendado`._    | 💡 Operaciones de bc_agendado. |
| **`GET`**   | `/api/bc_agendado/activeUser/:_id`     | `getActivePractise`   | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendado.**<br>_Tabla/Modelo `bc_agendado`._    | 💡 Operaciones de bc_agendado. |
| **`PATCH`** | `/api/bc_agendado/:_id`                | `patchItem`           | `authMiddleware(["all"])`   | **Modifica parcialmente registros del módulo bc_agendado.**<br>_Tabla/Modelo `bc_agendado`._ | 💡 Operaciones de bc_agendado. |
| **`POST`**  | `/api/bc_agendado/registrar`           | `createItem`          | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo bc_agendado.**<br>_Tabla/Modelo `bc_agendado`._       | 💡 Operaciones de bc_agendado. |
| **`POST`**  | `/api/bc_agendado/send-approval-email` | `sendApprovalEmail`   | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo bc_agendado.**<br>_Tabla/Modelo `bc_agendado`._       | 💡 Operaciones de bc_agendado. |

---

### 📦 Módulo: `bc_agendamientos_operarios`

- **Prefijo de Ruta Base:** `/api/bc_agendamientos_operarios`
- **Archivo de Rutas:** [`api/routes/bc_agendamientos_operarios.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_agendamientos_operarios.js)

| Método       | Ruta Completa                                                     | Handler / Controlador         | Autenticación y Validadores | Qué Consulta o Modifica                                                                                                 | Caso de Uso / Soporte                        |
| :----------- | :---------------------------------------------------------------- | :---------------------------- | :-------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------- |
| **`GET`**    | `/api/bc_agendamientos_operarios/agendamientos`                   | `getAgendamientos`            | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._ | 💡 Operaciones de bc_agendamientos_operarios. |
| **`POST`**   | `/api/bc_agendamientos_operarios/agendamientos`                   | `createAgendamiento`          | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._    | 💡 Operaciones de bc_agendamientos_operarios. |
| **`PUT`**    | `/api/bc_agendamientos_operarios/agendamientos/:id`               | `updateAgendamiento`          | `authMiddleware(["all"])`   | **Actualiza registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._          | 💡 Operaciones de bc_agendamientos_operarios. |
| **`DELETE`** | `/api/bc_agendamientos_operarios/agendamientos/:id`               | `deleteAgendamiento`          | `authMiddleware(["all"])`   | **Elimina registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._            | 💡 Operaciones de bc_agendamientos_operarios. |
| **`GET`**    | `/api/bc_agendamientos_operarios/agendamientos/incumplidos`       | `getAgendamientosIncumplidos` | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._ | 💡 Operaciones de bc_agendamientos_operarios. |
| **`GET`**    | `/api/bc_agendamientos_operarios/operarios`                       | `getOperarios`                | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._ | 💡 Operaciones de bc_agendamientos_operarios. |
| **`GET`**    | `/api/bc_agendamientos_operarios/operarios/:operario_id/empresas` | `getEmpresasOperario`         | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._ | 💡 Operaciones de bc_agendamientos_operarios. |
| **`GET`**    | `/api/bc_agendamientos_operarios/empresas/:empresa_id/estaciones` | `getEstacionesEmpresa`        | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._ | 💡 Operaciones de bc_agendamientos_operarios. |
| **`GET`**    | `/api/bc_agendamientos_operarios/incumplidos/count`               | `getIncumplidosCount`         | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._ | 💡 Operaciones de bc_agendamientos_operarios. |
| **`PUT`**    | `/api/bc_agendamientos_operarios/incumplidos/:id/revisar`         | `marcarIncumplidoRevisado`    | `authMiddleware(["all"])`   | **Actualiza registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._          | 💡 Operaciones de bc_agendamientos_operarios. |
| **`PUT`**    | `/api/bc_agendamientos_operarios/incumplidos/revisar-todos`       | `marcarTodosRevisados`        | `authMiddleware(["all"])`   | **Actualiza registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._          | 💡 Operaciones de bc_agendamientos_operarios. |
| **`GET`**    | `/api/bc_agendamientos_operarios/agendamientos/incumplidos`       | `getAgendamientosIncumplidos` | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_agendamientos_operarios.**<br>_Tabla/Modelo `bc_agendamientos_operarios`._ | 💡 Operaciones de bc_agendamientos_operarios. |

---

### 📦 Módulo: `bc_comentarios_rentas`

- **Prefijo de Ruta Base:** `/api/bc_comentarios_rentas`
- **Archivo de Rutas:** [`api/routes/bc_comentarios_rentas.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_comentarios_rentas.js)

| Método     | Ruta Completa                                                          | Handler / Controlador              | Autenticación y Validadores                                                                      | Qué Consulta o Modifica                                                                                       | Caso de Uso / Soporte                   |
| :--------- | :--------------------------------------------------------------------- | :--------------------------------- | :----------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :-------------------------------------- |
| **`GET`**  | `/api/bc_comentarios_rentas`                                           | `getItems`                         | `authMiddleware(["all"])`                                                                        | **Consulta / Obtiene registros del módulo bc_comentarios_rentas.**<br>_Tabla/Modelo `bc_comentarios_rentas`._ | 💡 Operaciones de bc_comentarios_rentas. |
| **`GET`**  | `/api/bc_comentarios_rentas/commentsFilter`                            | `getItemsToDate`                   | `authMiddleware(["all"])`                                                                        | **Consulta / Obtiene registros del módulo bc_comentarios_rentas.**<br>_Tabla/Modelo `bc_comentarios_rentas`._ | 💡 Operaciones de bc_comentarios_rentas. |
| **`GET`**  | `/api/bc_comentarios_rentas/id/:com_id`                                | `getItem`                          | `authMiddleware(["all"])`<br>`validatorGet`                                                      | **Consulta / Obtiene registros del módulo bc_comentarios_rentas.**<br>_Tabla/Modelo `bc_comentarios_rentas`._ | 💡 Operaciones de bc_comentarios_rentas. |
| **`POST`** | `/api/bc_comentarios_rentas/registrar`                                 | `createItem`                       | `authMiddleware(["all"])`<br>`checkAchievementById(203`<br>`"com_usuario")`<br>`validatorCreate` | **Crea / Registra registros del módulo bc_comentarios_rentas.**<br>_Tabla/Modelo `bc_comentarios_rentas`._    | 💡 Operaciones de bc_comentarios_rentas. |
| **`GET`**  | `/api/bc_comentarios_rentas/empresa/:empresa_id`                       | `getComentariosPorEmpresaEstacion` | `authMiddleware(["all"])`                                                                        | **Consulta / Obtiene registros del módulo bc_comentarios_rentas.**<br>_Tabla/Modelo `bc_comentarios_rentas`._ | 💡 Operaciones de bc_comentarios_rentas. |
| **`GET`**  | `/api/bc_comentarios_rentas/empresa/:empresa_id/estacion/:estacion_id` | `getComentariosPorEmpresaEstacion` | `authMiddleware(["all"])`                                                                        | **Consulta / Obtiene registros del módulo bc_comentarios_rentas.**<br>_Tabla/Modelo `bc_comentarios_rentas`._ | 💡 Operaciones de bc_comentarios_rentas. |

---

### 📦 Módulo: `bc_notificaciones_rentas`

- **Prefijo de Ruta Base:** `/api/bc_notificaciones_rentas`
- **Archivo de Rutas:** [`api/routes/bc_notificaciones_rentas.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_notificaciones_rentas.js)

| Método    | Ruta Completa                                           | Handler / Controlador | Autenticación y Validadores | Qué Consulta o Modifica                                                                                             | Caso de Uso / Soporte                      |
| :-------- | :------------------------------------------------------ | :-------------------- | :-------------------------- | :------------------------------------------------------------------------------------------------------------------ | :----------------------------------------- |
| **`GET`** | `/api/bc_notificaciones_rentas/notificaciones`          | `getNotificaciones`   | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_notificaciones_rentas.**<br>_Tabla/Modelo `bc_notificaciones_rentas`._ | 💡 Operaciones de bc_notificaciones_rentas. |
| **`PUT`** | `/api/bc_notificaciones_rentas/notificaciones/update`   | `updateNotificacion`  | `authMiddleware(["all"])`   | **Actualiza registros del módulo bc_notificaciones_rentas.**<br>_Tabla/Modelo `bc_notificaciones_rentas`._          | 💡 Operaciones de bc_notificaciones_rentas. |
| **`PUT`** | `/api/bc_notificaciones_rentas/notificaciones/extender` | `extenderRenta`       | `authMiddleware(["all"])`   | **Actualiza registros del módulo bc_notificaciones_rentas.**<br>_Tabla/Modelo `bc_notificaciones_rentas`._          | 💡 Operaciones de bc_notificaciones_rentas. |

---

### 📦 Módulo: `bc_preoperacionales`

- **Prefijo de Ruta Base:** `/api/bc_preoperacionales`
- **Archivo de Rutas:** [`api/routes/bc_preoperacionales.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_preoperacionales.js)

| Método      | Ruta Completa                                                | Handler / Controlador               | Autenticación y Validadores                          | Qué Consulta o Modifica                                                                                      | Caso de Uso / Soporte                 |
| :---------- | :----------------------------------------------------------- | :---------------------------------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| **`GET`**   | `/api/bc_preoperacionales`                                   | `getItems`                          | `authMiddleware(["all"])`                            | **Consulta / Obtiene registros del módulo bc_preoperacionales.**<br>_Tabla/Modelo `bc_preoperacionales`._    | 💡 Operaciones de bc_preoperacionales. |
| **`GET`**   | `/api/bc_preoperacionales/trip/:idViaje`                     | `getItemTrip`                       | `authMiddleware(["all"])`<br>`validatorGetTrip`      | **Consulta / Obtiene registros del módulo bc_preoperacionales.**<br>_Tabla/Modelo `bc_preoperacionales`._    | 💡 Operaciones de bc_preoperacionales. |
| **`GET`**   | `/api/bc_preoperacionales/usuario/:usuario`                  | `getItemsUser`                      | `authMiddleware(["all"])`<br>`validatorGetUser`      | **Consulta / Obtiene registros del módulo bc_preoperacionales.**<br>_Tabla/Modelo `bc_preoperacionales`._    | 💡 Operaciones de bc_preoperacionales. |
| **`POST`**  | `/api/bc_preoperacionales/registrar`                         | `createItem`                        | `authMiddleware(["all"])`<br>`validatorCreate`       | **Crea / Registra registros del módulo bc_preoperacionales.**<br>_Tabla/Modelo `bc_preoperacionales`._       | 💡 Operaciones de bc_preoperacionales. |
| **`PATCH`** | `/api/bc_preoperacionales/:id`                               | `patchItem`                         | `authMiddleware(["all"])`<br>`validatorGetTrip`      | **Modifica parcialmente registros del módulo bc_preoperacionales.**<br>_Tabla/Modelo `bc_preoperacionales`._ | 💡 Operaciones de bc_preoperacionales. |
| **`POST`**  | `/api/bc_preoperacionales/by-prestamos`                      | `getPreoperacionalesByPrestamosIds` | `authMiddleware(["all"])`<br>`validatorGetPrestamos` | **Crea / Registra registros del módulo bc_preoperacionales.**<br>_Tabla/Modelo `bc_preoperacionales`._       | 💡 Operaciones de bc_preoperacionales. |
| **`GET`**   | `/api/bc_preoperacionales/with-prestamos`                    | `getItemsWithPrestamos`             | `authMiddleware(["all"])`                            | **Consulta / Obtiene registros del módulo bc_preoperacionales.**<br>_Tabla/Modelo `bc_preoperacionales`._    | 💡 Operaciones de bc_preoperacionales. |
| **`GET`**   | `/api/bc_preoperacionales/with-prestamos/:id`                | `getItemWithPrestamo`               | `authMiddleware(["all"])`<br>`validatorGetId`        | **Consulta / Obtiene registros del módulo bc_preoperacionales.**<br>_Tabla/Modelo `bc_preoperacionales`._    | 💡 Operaciones de bc_preoperacionales. |
| **`GET`**   | `/api/bc_preoperacionales/with-prestamos/empresa/:empresaId` | `getItemsWithPrestamosByEmpresa`    | `authMiddleware(["all"])`                            | **Consulta / Obtiene registros del módulo bc_preoperacionales.**<br>_Tabla/Modelo `bc_preoperacionales`._    | 💡 Operaciones de bc_preoperacionales. |

---

### 📦 Módulo: `bc_reportes_contradicciones`

- **Prefijo de Ruta Base:** `/api/bc_reportes_contradicciones`
- **Archivo de Rutas:** [`api/routes/bc_reportes_contradicciones.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_reportes_contradicciones.js)

| Método     | Ruta Completa                                | Handler / Controlador | Autenticación y Validadores                           | Qué Consulta o Modifica                                                                                                   | Caso de Uso / Soporte                         |
| :--------- | :------------------------------------------- | :-------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------- |
| **`GET`**  | `/api/bc_reportes_contradicciones`           | `getItems`            | `authMiddleware(["all"])`                             | **Consulta / Obtiene registros del módulo bc_reportes_contradicciones.**<br>_Tabla/Modelo `bc_reportes_contradicciones`._ | 💡 Operaciones de bc_reportes_contradicciones. |
| **`POST`** | `/api/bc_reportes_contradicciones/registrar` | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateReporte` | **Crea / Registra registros del módulo bc_reportes_contradicciones.**<br>_Tabla/Modelo `bc_reportes_contradicciones`._    | 💡 Operaciones de bc_reportes_contradicciones. |
| **`PUT`**  | `/api/bc_reportes_contradicciones/update`    | `updateItem`          | `authMiddleware(["all"])`<br>`validatorUpdateReporte` | **Actualiza registros del módulo bc_reportes_contradicciones.**<br>_Tabla/Modelo `bc_reportes_contradicciones`._          | 💡 Operaciones de bc_reportes_contradicciones. |

---

### 📦 Módulo: `bc_mantenimientos`

- **Prefijo de Ruta Base:** `/api/bc_mantenimientos`
- **Archivo de Rutas:** [`api/routes/bc_mantenimientos.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_mantenimientos.js)

| Método      | Ruta Completa                                                        | Handler / Controlador                | Autenticación y Validadores                                        | Qué Consulta o Modifica                                                                                  | Caso de Uso / Soporte               |
| :---------- | :------------------------------------------------------------------- | :----------------------------------- | :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| **`GET`**   | `/api/bc_mantenimientos`                                             | `getMantenimientos`                  | _Público_                                                          | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/id/:id`                                      | `getMantenimientoPorId`              | `authMiddleware(["all"])`<br>`validatorGetMantenimiento`           | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/estacion/:estacion_id`                       | `getMantenimientosPorEstacion`       | `authMiddleware(["all"])`<br>`validatorGetPorEstacion`             | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/empresa/:empresa_id`                         | `getMantenimientosPorEmpresa`        | `authMiddleware(["all"])`<br>`validatorGetPorEmpresa`              | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/bicicleta/:bicicleta_id`                     | `getMantenimientosPorBicicleta`      | `authMiddleware(["all"])`<br>`validatorGetPorBicicleta`            | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`POST`**  | `/api/bc_mantenimientos`                                             | `crearMantenimiento`                 | `authMiddleware(["all"])`<br>`validatorCreateMantenimiento`        | **Crea / Registra registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._       | 💡 Operaciones de bc_mantenimientos. |
| **`PATCH`** | `/api/bc_mantenimientos/:id`                                         | `actualizarMantenimiento`            | `authMiddleware(["all"])`<br>`validatorPatchMantenimiento`         | **Modifica parcialmente registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._ | 💡 Operaciones de bc_mantenimientos. |
| **`PATCH`** | `/api/bc_mantenimientos/finalizar/:id`                               | `finalizarMantenimiento`             | `authMiddleware(["all"])`<br>`validatorFinalizarMantenimiento`     | **Modifica parcialmente registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._ | 💡 Operaciones de bc_mantenimientos. |
| **`PATCH`** | `/api/bc_mantenimientos/cancelar/:id`                                | `cancelarMantenimiento`              | `authMiddleware(["all"])`<br>`validatorGetMantenimiento`           | **Modifica parcialmente registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._ | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/operario/:operario_id`                       | `getMantenimientosPorOperario`       | `authMiddleware(["all"])`<br>`validatorGetPorOperario`             | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`PATCH`** | `/api/bc_mantenimientos/historial/:historial_id`                     | `actualizarHistorialComponente`      | `authMiddleware(["all"])`<br>`validatorUpdateHistorial`            | **Modifica parcialmente registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._ | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/componentes-categorias`                      | `getComponentesConCategorias`        | `authMiddleware(["all"])`                                          | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`POST`**  | `/api/bc_mantenimientos/masivo`                                      | `crearMantenimientosMasivo`          | `authMiddleware(["all"])`<br>`validatorCreateMantenimientosMasivo` | **Crea / Registra registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._       | 💡 Operaciones de bc_mantenimientos. |
| **`POST`**  | `/api/bc_mantenimientos/historial`                                   | `crearHistorialComponente`           | `authMiddleware(["all"])`<br>`validatorCreateHistorial`            | **Crea / Registra registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._       | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/bicicleta/:bicicleta_id/componentes`         | `getComponentesPorBicicleta`         | `authMiddleware(["all"])`<br>`validatorGetPorBicicleta`            | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`POST`**  | `/api/bc_mantenimientos/traslado-masivo`                             | `trasladoMasivoMantenimientos`       | `authMiddleware(["all"])`<br>`validatorTrasladoMasivo`             | **Crea / Registra registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._       | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/historial/:mantenimiento_id`                 | `getHistorialMantenimiento`          | `authMiddleware(["all"])`<br>`validatorGetHistorial`               | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/export/empresa/:empresa_id`                  | `exportMantenimientosPorEmpresa`     | `authMiddleware(["all"])`<br>`validatorGetPorEmpresa`              | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/export/estacion/:estacion_id`                | `exportMantenimientosPorEstacion`    | `authMiddleware(["all"])`<br>`validatorGetPorEstacion`             | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/operarios/estadisticas`                      | `getEstadisticasOperarios`           | `authMiddleware(["all"])`                                          | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/operarios/rendimiento`                       | `getRendimientoOperarios`            | `authMiddleware(["all"])`<br>`validatorGetRendimientoOperarios`    | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/operarios/productividad`                     | `getProductividadOperarios`          | `authMiddleware(["all"])`                                          | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/operarios/estadisticas/empresa/:empresaId`   | `getEstadisticasOperariosByEmpresa`  | `authMiddleware(["all"])`                                          | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |
| **`GET`**   | `/api/bc_mantenimientos/operarios/estadisticas/estacion/:estacionId` | `getEstadisticasOperariosByEstacion` | `authMiddleware(["all"])`                                          | **Consulta / Obtiene registros del módulo bc_mantenimientos.**<br>_Tabla/Modelo `bc_mantenimientos`._    | 💡 Operaciones de bc_mantenimientos. |

---

### 📦 Módulo: `mantenimientoPersonalizado`

- **Prefijo de Ruta Base:** `/api/mantenimientoPersonalizado`
- **Archivo de Rutas:** [`api/routes/mantenimientoPersonalizado.js`](file:///Users/user/Projects/APP_nueva/api/routes/mantenimientoPersonalizado.js)

| Método     | Ruta Completa                                           | Handler / Controlador              | Autenticación y Validadores | Qué Consulta o Modifica                                                                                                 | Caso de Uso / Soporte                        |
| :--------- | :------------------------------------------------------ | :--------------------------------- | :-------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------- |
| **`GET`**  | `/api/mantenimientoPersonalizado/resumen`               | `getResumen`                       | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo mantenimientoPersonalizado.**<br>_Tabla/Modelo `mantenimientoPersonalizado`._ | 💡 Operaciones de mantenimientoPersonalizado. |
| **`GET`**  | `/api/mantenimientoPersonalizado/programados`           | `getProgramados`                   | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo mantenimientoPersonalizado.**<br>_Tabla/Modelo `mantenimientoPersonalizado`._ | 💡 Operaciones de mantenimientoPersonalizado. |
| **`GET`**  | `/api/mantenimientoPersonalizado/historial`             | `getHistorial`                     | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo mantenimientoPersonalizado.**<br>_Tabla/Modelo `mantenimientoPersonalizado`._ | 💡 Operaciones de mantenimientoPersonalizado. |
| **`POST`** | `/api/mantenimientoPersonalizado/recordatorio`          | `enviarRecordatorioManual`         | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo mantenimientoPersonalizado.**<br>_Tabla/Modelo `mantenimientoPersonalizado`._    | 💡 Operaciones de mantenimientoPersonalizado. |
| **`POST`** | `/api/mantenimientoPersonalizado/forzar-turno`          | `forzarMantenimiento`              | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo mantenimientoPersonalizado.**<br>_Tabla/Modelo `mantenimientoPersonalizado`._    | 💡 Operaciones de mantenimientoPersonalizado. |
| **`POST`** | `/api/mantenimientoPersonalizado/cancelar-y-reemplazar` | `cancelarYReemplazarMantenimiento` | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo mantenimientoPersonalizado.**<br>_Tabla/Modelo `mantenimientoPersonalizado`._    | 💡 Operaciones de mantenimientoPersonalizado. |
| **`POST`** | `/api/mantenimientoPersonalizado/ejecutar-cron`         | `ejecutarCronManual`               | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo mantenimientoPersonalizado.**<br>_Tabla/Modelo `mantenimientoPersonalizado`._    | 💡 Operaciones de mantenimientoPersonalizado. |

---

### 📦 Módulo: `bc_fallas`

- **Prefijo de Ruta Base:** `/api/bc_fallas`
- **Archivo de Rutas:** [`api/routes/bc_fallas.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_fallas.js)

| Método     | Ruta Completa               | Handler / Controlador | Autenticación y Validadores                          | Qué Consulta o Modifica                                                               | Caso de Uso / Soporte       |
| :--------- | :-------------------------- | :-------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------ | :-------------------------- |
| **`GET`**  | `/api/bc_fallas`            | `getItems`            | `authMiddleware(["all"])`                            | **Consulta / Obtiene registros del módulo bc_fallas.**<br>_Tabla/Modelo `bc_fallas`._ | 💡 Operaciones de bc_fallas. |
| **`GET`**  | `/api/bc_fallas/id/:fal_id` | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetFallas`    | **Consulta / Obtiene registros del módulo bc_fallas.**<br>_Tabla/Modelo `bc_fallas`._ | 💡 Operaciones de bc_fallas. |
| **`POST`** | `/api/bc_fallas/registrar`  | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateFallas` | **Crea / Registra registros del módulo bc_fallas.**<br>_Tabla/Modelo `bc_fallas`._    | 💡 Operaciones de bc_fallas. |

---

### 📦 Módulo: `bc_vehiculos_fallas`

- **Prefijo de Ruta Base:** `/api/bc_vehiculos_fallas`
- **Archivo de Rutas:** [`api/routes/bc_vehiculos_fallas.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_vehiculos_fallas.js)

| Método     | Ruta Completa                                   | Handler / Controlador | Autenticación y Validadores                        | Qué Consulta o Modifica                                                                                   | Caso de Uso / Soporte                 |
| :--------- | :---------------------------------------------- | :-------------------- | :------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| **`GET`**  | `/api/bc_vehiculos_fallas`                      | `getItems`            | `authMiddleware(["all"])`                          | **Consulta / Obtiene registros del módulo bc_vehiculos_fallas.**<br>_Tabla/Modelo `bc_vehiculos_fallas`._ | 💡 Operaciones de bc_vehiculos_fallas. |
| **`GET`**  | `/api/bc_vehiculos_fallas/id/:vef_id`           | `getItem`             | `authMiddleware(["all"])`<br>`validatorGet`        | **Consulta / Obtiene registros del módulo bc_vehiculos_fallas.**<br>_Tabla/Modelo `bc_vehiculos_fallas`._ | 💡 Operaciones de bc_vehiculos_fallas. |
| **`GET`**  | `/api/bc_vehiculos_fallas/usuario/:vef_usuario` | `getItemUsuario`      | `authMiddleware(["all"])`<br>`validatorGetUsuario` | **Consulta / Obtiene registros del módulo bc_vehiculos_fallas.**<br>_Tabla/Modelo `bc_vehiculos_fallas`._ | 💡 Operaciones de bc_vehiculos_fallas. |
| **`POST`** | `/api/bc_vehiculos_fallas/registrar`            | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate`     | **Crea / Registra registros del módulo bc_vehiculos_fallas.**<br>_Tabla/Modelo `bc_vehiculos_fallas`._    | 💡 Operaciones de bc_vehiculos_fallas. |

---

### 📦 Módulo: `bc_tarjetas_nfc`

- **Prefijo de Ruta Base:** `/api/bc_tarjetas_nfc`
- **Archivo de Rutas:** [`api/routes/bc_tarjetas_nfc.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_tarjetas_nfc.js)

| Método       | Ruta Completa                                           | Handler / Controlador | Autenticación y Validadores                              | Qué Consulta o Modifica                                                                              | Caso de Uso / Soporte             |
| :----------- | :------------------------------------------------------ | :-------------------- | :------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :-------------------------------- |
| **`GET`**    | `/api/bc_tarjetas_nfc`                                  | `getItems`            | `authMiddleware(['all'])`                                | **Consulta / Obtiene registros del módulo bc_tarjetas_nfc.**<br>_Tabla/Modelo `bc_tarjetas_nfc`._    | 💡 Operaciones de bc_tarjetas_nfc. |
| **`GET`**    | `/api/bc_tarjetas_nfc/count`                            | `countItems`          | `authMiddleware(['all'])`                                | **Consulta / Obtiene registros del módulo bc_tarjetas_nfc.**<br>_Tabla/Modelo `bc_tarjetas_nfc`._    | 💡 Operaciones de bc_tarjetas_nfc. |
| **`GET`**    | `/api/bc_tarjetas_nfc/id/:tnfc_id`                      | `getItem`             | `authMiddleware(['all'])`<br>`validatorGetTarjeta`       | **Consulta / Obtiene registros del módulo bc_tarjetas_nfc.**<br>_Tabla/Modelo `bc_tarjetas_nfc`._    | 💡 Operaciones de bc_tarjetas_nfc. |
| **`GET`**    | `/api/bc_tarjetas_nfc/hexadecimal/:tnfc_id_hexadecimal` | `getByHexadecimal`    | `authMiddleware(['all'])`<br>`validatorGetByHexadecimal` | **Consulta / Obtiene registros del módulo bc_tarjetas_nfc.**<br>_Tabla/Modelo `bc_tarjetas_nfc`._    | 💡 Operaciones de bc_tarjetas_nfc. |
| **`GET`**    | `/api/bc_tarjetas_nfc/usuario/:tnfc_usuario_id`         | `getByUsuario`        | `authMiddleware(['all'])`<br>`validatorGetByUsuario`     | **Consulta / Obtiene registros del módulo bc_tarjetas_nfc.**<br>_Tabla/Modelo `bc_tarjetas_nfc`._    | 💡 Operaciones de bc_tarjetas_nfc. |
| **`POST`**   | `/api/bc_tarjetas_nfc`                                  | `createItem`          | `authMiddleware(['all'])`<br>`validatorCreateTarjeta`    | **Crea / Registra registros del módulo bc_tarjetas_nfc.**<br>_Tabla/Modelo `bc_tarjetas_nfc`._       | 💡 Operaciones de bc_tarjetas_nfc. |
| **`POST`**   | `/api/bc_tarjetas_nfc/test`                             | `createTestItem`      | `authMiddleware(['all'])`                                | **Crea / Registra registros del módulo bc_tarjetas_nfc.**<br>_Tabla/Modelo `bc_tarjetas_nfc`._       | 💡 Operaciones de bc_tarjetas_nfc. |
| **`PATCH`**  | `/api/bc_tarjetas_nfc/:tnfc_id`                         | `updateItem`          | `authMiddleware(['all'])`<br>`validatorUpdateTarjeta`    | **Modifica parcialmente registros del módulo bc_tarjetas_nfc.**<br>_Tabla/Modelo `bc_tarjetas_nfc`._ | 💡 Operaciones de bc_tarjetas_nfc. |
| **`DELETE`** | `/api/bc_tarjetas_nfc/:tnfc_id`                         | `deleteItem`          | `authMiddleware(['all'])`<br>`validatorGetTarjeta`       | **Elimina registros del módulo bc_tarjetas_nfc.**<br>_Tabla/Modelo `bc_tarjetas_nfc`._               | 💡 Operaciones de bc_tarjetas_nfc. |

---

### 📦 Módulo: `bc_penalizaciones`

- **Prefijo de Ruta Base:** `/api/bc_penalizaciones`
- **Archivo de Rutas:** [`api/routes/bc_penalizaciones.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_penalizaciones.js)

| Método     | Ruta Completa                                 | Handler / Controlador | Autenticación y Validadores                                | Qué Consulta o Modifica                                                                               | Caso de Uso / Soporte                                                                  |
| :--------- | :-------------------------------------------- | :-------------------- | :--------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **`GET`**  | `/api/bc_penalizaciones`                      | `getItems`            | `authMiddleware(["all"])`                                  | **Consulta o aplica penalizaciones/sanciones temporales a usuarios.**<br>_Tabla `bc_penalizaciones`._ | 💡 ⚡ Revisar por qué un usuario está bloqueado o retirar penalizaciones injustificadas. |
| **`GET`**  | `/api/bc_penalizaciones/id/:pen_id`           | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetPenalizacion`    | **Consulta o aplica penalizaciones/sanciones temporales a usuarios.**<br>_Tabla `bc_penalizaciones`._ | 💡 ⚡ Revisar por qué un usuario está bloqueado o retirar penalizaciones injustificadas. |
| **`GET`**  | `/api/bc_penalizaciones/usuario/:pen_usuario` | `getItemUser`         | `authMiddleware(["all"])`<br>`validatorGetUsuario`         | **Consulta o aplica penalizaciones/sanciones temporales a usuarios.**<br>_Tabla `bc_penalizaciones`._ | 💡 ⚡ Revisar por qué un usuario está bloqueado o retirar penalizaciones injustificadas. |
| **`POST`** | `/api/bc_penalizaciones/registrar`            | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreatePenalizacion` | **Consulta o aplica penalizaciones/sanciones temporales a usuarios.**<br>_Tabla `bc_penalizaciones`._ | 💡 ⚡ Revisar por qué un usuario está bloqueado o retirar penalizaciones injustificadas. |

---

### 📦 Módulo: `bc_puntos`

- **Prefijo de Ruta Base:** `/api/bc_puntos`
- **Archivo de Rutas:** [`api/routes/bc_puntos.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_puntos.js)

| Método     | Ruta Completa                                  | Handler / Controlador     | Autenticación y Validadores                          | Qué Consulta o Modifica                                                                    | Caso de Uso / Soporte                                 |
| :--------- | :--------------------------------------------- | :------------------------ | :--------------------------------------------------- | :----------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| **`GET`**  | `/api/bc_puntos`                               | `getItems`                | `authMiddleware(["all"])`                            | **Consulta de saldo de puntos, historial de acumulación y canje.**<br>_Tabla `bc_puntos`._ | 💡 Aclarar reclamos de puntos por viajes o premiación. |
| **`GET`**  | `/api/bc_puntos/usuario/:pun_usuario`          | `getItemUsuario`          | `authMiddleware(["all"])`<br>`validatorGetUser`      | **Consulta de saldo de puntos, historial de acumulación y canje.**<br>_Tabla `bc_puntos`._ | 💡 Aclarar reclamos de puntos por viajes o premiación. |
| **`POST`** | `/api/bc_puntos/registrar`                     | `createItem`              | `authMiddleware(["all"])`<br>`validatorCreatePuntos` | **Consulta de saldo de puntos, historial de acumulación y canje.**<br>_Tabla `bc_puntos`._ | 💡 Aclarar reclamos de puntos por viajes o premiación. |
| **`POST`** | `/api/bc_puntos/correo_recompensas`            | `correo__recompensas`     | _Público_                                            | **Consulta de saldo de puntos, historial de acumulación y canje.**<br>_Tabla `bc_puntos`._ | 💡 Aclarar reclamos de puntos por viajes o premiación. |
| **`GET`**  | `/api/bc_puntos/empresa/:empresa`              | `getRecompensasByEmpresa` | `authMiddleware(["all"])`<br>`validatorGetEmpresa`   | **Consulta de saldo de puntos, historial de acumulación y canje.**<br>_Tabla `bc_puntos`._ | 💡 Aclarar reclamos de puntos por viajes o premiación. |
| **`PUT`**  | `/api/bc_puntos/estado`                        | `updateEstadoRecompensa`  | `authMiddleware(["all"])`                            | **Consulta de saldo de puntos, historial de acumulación y canje.**<br>_Tabla `bc_puntos`._ | 💡 Aclarar reclamos de puntos por viajes o premiación. |
| **`GET`**  | `/api/bc_puntos/usuario_cortezza/:pun_usuario` | `getItemUsuario_cortezza` | `authMiddleware(["external"])`<br>`validatorGetUser` | **Consulta de saldo de puntos, historial de acumulación y canje.**<br>_Tabla `bc_puntos`._ | 💡 Aclarar reclamos de puntos por viajes o premiación. |

---

### 📦 Módulo: `bc_tickets_soporte`

- **Prefijo de Ruta Base:** `/api/bc_tickets_soporte`
- **Archivo de Rutas:** [`api/routes/bc_tickets_soporte.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_tickets_soporte.js)

| Método     | Ruta Completa                        | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                                 | Caso de Uso / Soporte                |
| :--------- | :----------------------------------- | :-------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :----------------------------------- |
| **`GET`**  | `/api/bc_tickets_soporte`            | `getItems`            | `authMiddleware(["all"])`                      | **Consulta / Obtiene registros del módulo bc_tickets_soporte.**<br>_Tabla/Modelo `bc_tickets_soporte`._ | 💡 Operaciones de bc_tickets_soporte. |
| **`GET`**  | `/api/bc_tickets_soporte/id/:tic_id` | `getItem`             | `authMiddleware(["all"])`<br>`validatorGet`    | **Consulta / Obtiene registros del módulo bc_tickets_soporte.**<br>_Tabla/Modelo `bc_tickets_soporte`._ | 💡 Operaciones de bc_tickets_soporte. |
| **`POST`** | `/api/bc_tickets_soporte/registrar`  | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate` | **Crea / Registra registros del módulo bc_tickets_soporte.**<br>_Tabla/Modelo `bc_tickets_soporte`._    | 💡 Operaciones de bc_tickets_soporte. |

---

## 🗂️ 2. Usuarios, Autenticación, Roles y Empresas

> Gestión integral de usuarios, vinculación con empresas aliadas, oficinas/sedes, autenticación, restablecimiento de claves, sesiones, tokens FCM de notificación y contratos.

### 📦 Módulo: `users`

- **Prefijo de Ruta Base:** `/api/users`
- **Archivo de Rutas:** [`api/routes/users.js`](file:///Users/user/Projects/APP_nueva/api/routes/users.js)

| Método      | Ruta Completa              | Handler / Controlador                     | Autenticación y Validadores                                                                                                                                                                        | Qué Consulta o Modifica                                                                                            | Caso de Uso / Soporte                                                     |
| :---------- | :------------------------- | :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| **`POST`**  | `/api/users/resetpassword` | `message: 'El correo es requerido' }`     | `async (req`<br>`res) => { try { const { email } = req.body; if (!email) { return res.status(400).json({ error: 'EMAIL_REQUIRED'`                                                                  | **Restablecimiento o actualización de contraseña del usuario.**<br>_Actualiza hash en `bc_usuarios_credenciales`._ | 💡 Asistir al usuario que olvidó su clave de acceso.                       |
| **`POST`**  | `/api/users/login`         | `message: 'Credenciales requeridas' }`    | `async (req`<br>`res) => { try { const { user`<br>`password } = req.body; if (!user                                                                                                                |                                                                                                                    | !password) { return res.status(400).json({ error: 'CREDENTIALS_REQUIRED'` | **Autenticación de usuario con documento/correo y contraseña. Genera JWT.**<br>_Valida contra `bc_usuarios` y `bc_usuarios_credenciales`._ | 💡 Verificar login o automatizar autenticación de bots. |
| **`PATCH`** | `/api/users/:id`           | `message: 'La contraseña es requerida' }` | `authMiddleware(['all'])`<br>`async (req`<br>`res) => { try { const { id } = req.params; const { password } = req.body; if (!password) { return res.status(400).json({ error: 'PASSWORD_REQUIRED'` | **Actualiza datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                         | 💡 Gestión de perfil y permisos del usuario.                               |

---

### 📦 Módulo: `bc_usuarios`

- **Prefijo de Ruta Base:** `/api/bc_usuarios`
- **Archivo de Rutas:** [`api/routes/bc_usuarios.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_usuarios.js)

| Método       | Ruta Completa                                  | Handler / Controlador    | Autenticación y Validadores                          | Qué Consulta o Modifica                                                                                                                    | Caso de Uso / Soporte                                  |
| :----------- | :--------------------------------------------- | :----------------------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| **`GET`**    | `/api/bc_usuarios`                             | `getItems`               | `authMiddleware(["all"])`                            | **Consulta datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`GET`**    | `/api/bc_usuarios/id/:usu_documento`           | `getItem`                | `authMiddleware(["all"])`<br>`validatorGetUser`      | **Consulta datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`POST`**   | `/api/bc_usuarios/registrar`                   | `createItem`             | `validatorCreateUser`                                | **Registra datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`POST`**   | `/api/bc_usuarios/login_app`                   | `loginApp`               | _Público_                                            | **Autenticación de usuario con documento/correo y contraseña. Genera JWT.**<br>_Valida contra `bc_usuarios` y `bc_usuarios_credenciales`._ | 💡 Verificar login o automatizar autenticación de bots. |
| **`POST`**   | `/api/bc_usuarios/updateusuario`               | `updateItem`             | `authMiddleware(["all"])`<br>`validatorUpdateUser`   | **Registra datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`POST`**   | `/api/bc_usuarios/login`                       | `login`                  | `authMiddleware(["all"])`<br>`validatorLogin`        | **Autenticación de usuario con documento/correo y contraseña. Genera JWT.**<br>_Valida contra `bc_usuarios` y `bc_usuarios_credenciales`._ | 💡 Verificar login o automatizar autenticación de bots. |
| **`POST`**   | `/api/bc_usuarios/correo_password_ride`        | `correo__password_ride`  | _Público_                                            | **Registra datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`POST`**   | `/api/bc_usuarios/correo_password_meb`         | `correo__password_meb`   | _Público_                                            | **Registra datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`PATCH`**  | `/api/bc_usuarios/empresa/:usu_documento`      | `patchOrganization`      | `authMiddleware(["all"])`<br>`validatorPatch`        | **Actualiza datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                 | 💡 Gestión de perfil y permisos del usuario.            |
| **`PATCH`**  | `/api/bc_usuarios/:usu_documento`              | `patchItem`              | `authMiddleware(["all"])`<br>`validatorPatch`        | **Actualiza datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                 | 💡 Gestión de perfil y permisos del usuario.            |
| **`PATCH`**  | `/api/bc_usuarios/updatePhoto/:usu_documento`  | `updatePhoto`            | `authMiddleware(["all"])`                            | **Actualiza datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                 | 💡 Gestión de perfil y permisos del usuario.            |
| **`POST`**   | `/api/bc_usuarios/create_user_complete`        | `createUserComplete`     | `authMiddleware(["all"])`                            | **Registra datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`GET`**    | `/api/bc_usuarios/operarios`                   | `getOperarios`           | `authMiddleware(["all"])`                            | **Consulta datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`GET`**    | `/api/bc_usuarios/check_exists/:idNumber`      | `checkUserExists`        | `authMiddleware(["all"])`                            | **Consulta datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`GET`**    | `/api/bc_usuarios/by-organization/:emp_nombre` | `getUsersByOrganization` | `authMiddleware(["all"])`                            | **Consulta datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`DELETE`** | `/api/bc_usuarios/:id`                         | `deleteItem`             | `authMiddleware(["all"])`<br>`validatorGetUser`      | **Actualiza datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                 | 💡 Gestión de perfil y permisos del usuario.            |
| **`GET`**    | `/api/bc_usuarios/all`                         | `getItems_cortezza`      | `authMiddleware(["external"])`                       | **Consulta datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |
| **`GET`**    | `/api/bc_usuarios/id_cortezza/:usu_documento`  | `getItem_cortezza`       | `authMiddleware(["external"])`<br>`validatorGetUser` | **Consulta datos de usuarios.**<br>_Tabla `bc_usuarios`._                                                                                  | 💡 Gestión de perfil y permisos del usuario.            |

---

### 📦 Módulo: `bc_usuarios_credenciales`

- **Prefijo de Ruta Base:** `/api/bc_usuarios_credenciales`
- **Archivo de Rutas:** [`api/routes/bc_usuarios_credenciales.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_usuarios_credenciales.js)

| Método       | Ruta Completa                                          | Handler / Controlador | Autenticación y Validadores                              | Qué Consulta o Modifica                                                                                                | Caso de Uso / Soporte                      |
| :----------- | :----------------------------------------------------- | :-------------------- | :------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :----------------------------------------- |
| **`GET`**    | `/api/bc_usuarios_credenciales`                        | `getItems`            | `authMiddleware(['all'])`                                | **Consulta / Obtiene registros del módulo bc_usuarios_credenciales.**<br>_Tabla/Modelo `bc_usuarios_credenciales`._    | 💡 Operaciones de bc_usuarios_credenciales. |
| **`GET`**    | `/api/bc_usuarios_credenciales/usuario/:uc_usuario_id` | `getItem`             | `authMiddleware(['all'])`<br>`validatorGetCredencial`    | **Consulta / Obtiene registros del módulo bc_usuarios_credenciales.**<br>_Tabla/Modelo `bc_usuarios_credenciales`._    | 💡 Operaciones de bc_usuarios_credenciales. |
| **`POST`**   | `/api/bc_usuarios_credenciales/login`                  | `login`               | `authMiddleware(['all'])`                                | **Crea / Registra registros del módulo bc_usuarios_credenciales.**<br>_Tabla/Modelo `bc_usuarios_credenciales`._       | 💡 Operaciones de bc_usuarios_credenciales. |
| **`POST`**   | `/api/bc_usuarios_credenciales`                        | `createItem`          | `authMiddleware(['all'])`<br>`validatorCreateCredencial` | **Crea / Registra registros del módulo bc_usuarios_credenciales.**<br>_Tabla/Modelo `bc_usuarios_credenciales`._       | 💡 Operaciones de bc_usuarios_credenciales. |
| **`PATCH`**  | `/api/bc_usuarios_credenciales/:uc_usuario_id`         | `updateItem`          | `authMiddleware(['all'])`<br>`validatorUpdateCredencial` | **Modifica parcialmente registros del módulo bc_usuarios_credenciales.**<br>_Tabla/Modelo `bc_usuarios_credenciales`._ | 💡 Operaciones de bc_usuarios_credenciales. |
| **`DELETE`** | `/api/bc_usuarios_credenciales/:uc_usuario_id`         | `deleteItem`          | `authMiddleware(['all'])`<br>`validatorGetCredencial`    | **Elimina registros del módulo bc_usuarios_credenciales.**<br>_Tabla/Modelo `bc_usuarios_credenciales`._               | 💡 Operaciones de bc_usuarios_credenciales. |

---

### 📦 Módulo: `bc_usuarios_empresas`

- **Prefijo de Ruta Base:** `/api/bc_usuarios_empresas`
- **Archivo de Rutas:** [`api/routes/bc_usuarios_empresas.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_usuarios_empresas.js)

| Método       | Ruta Completa                                                 | Handler / Controlador    | Autenticación y Validadores                                   | Qué Consulta o Modifica                                                                                     | Caso de Uso / Soporte                  |
| :----------- | :------------------------------------------------------------ | :----------------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| **`GET`**    | `/api/bc_usuarios_empresas/usuarios-empresas`                 | `getAllUsuariosEmpresas` | `authMiddleware(["all"])`                                     | **Consulta / Obtiene registros del módulo bc_usuarios_empresas.**<br>_Tabla/Modelo `bc_usuarios_empresas`._ | 💡 Operaciones de bc_usuarios_empresas. |
| **`GET`**    | `/api/bc_usuarios_empresas/usuarios-empresas/:usu_documento`  | `getUsuarioEmpresas`     | `authMiddleware(["all"])`                                     | **Consulta / Obtiene registros del módulo bc_usuarios_empresas.**<br>_Tabla/Modelo `bc_usuarios_empresas`._ | 💡 Operaciones de bc_usuarios_empresas. |
| **`POST`**   | `/api/bc_usuarios_empresas/usuarios-empresas`                 | `createUsuarioEmpresas`  | `authMiddleware(["all"])`<br>`validatorCreateUsuarioEmpresas` | **Crea / Registra registros del módulo bc_usuarios_empresas.**<br>_Tabla/Modelo `bc_usuarios_empresas`._    | 💡 Operaciones de bc_usuarios_empresas. |
| **`PUT`**    | `/api/bc_usuarios_empresas/usuarios-empresas/:usu_documento`  | `updateUsuarioEmpresas`  | `authMiddleware(["all"])`<br>`validatorUpdateUsuarioEmpresas` | **Actualiza registros del módulo bc_usuarios_empresas.**<br>_Tabla/Modelo `bc_usuarios_empresas`._          | 💡 Operaciones de bc_usuarios_empresas. |
| **`DELETE`** | `/api/bc_usuarios_empresas/usuarios-empresas/:usu_documento`  | `deleteUsuarioEmpresas`  | `authMiddleware(["all"])`                                     | **Elimina registros del módulo bc_usuarios_empresas.**<br>_Tabla/Modelo `bc_usuarios_empresas`._            | 💡 Operaciones de bc_usuarios_empresas. |
| **`GET`**    | `/api/bc_usuarios_empresas/empresas-asignadas/:usu_documento` | `getEmpresasAsignadas`   | `authMiddleware(["all"])`                                     | **Consulta / Obtiene registros del módulo bc_usuarios_empresas.**<br>_Tabla/Modelo `bc_usuarios_empresas`._ | 💡 Operaciones de bc_usuarios_empresas. |

---

### 📦 Módulo: `bc_usuarios_roles`

- **Prefijo de Ruta Base:** `/api/bc_usuarios_roles`
- **Archivo de Rutas:** [`api/routes/bc_usuarios_roles.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_usuarios_roles.js)

| Método       | Ruta Completa                                   | Handler / Controlador | Autenticación y Validadores                              | Qué Consulta o Modifica                                                                               | Caso de Uso / Soporte               |
| :----------- | :---------------------------------------------- | :-------------------- | :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :---------------------------------- |
| **`GET`**    | `/api/bc_usuarios_roles`                        | `getItems`            | `authMiddleware(['all'])`                                | **Consulta / Obtiene registros del módulo bc_usuarios_roles.**<br>_Tabla/Modelo `bc_usuarios_roles`._ | 💡 Operaciones de bc_usuarios_roles. |
| **`GET`**    | `/api/bc_usuarios_roles/id/:ur_id`              | `getItem`             | `authMiddleware(['all'])`<br>`validatorGetUsuarioRol`    | **Consulta / Obtiene registros del módulo bc_usuarios_roles.**<br>_Tabla/Modelo `bc_usuarios_roles`._ | 💡 Operaciones de bc_usuarios_roles. |
| **`GET`**    | `/api/bc_usuarios_roles/usuario/:ur_usuario_id` | `getByUsuario`        | `authMiddleware(['all'])`<br>`validatorGetByUsuario`     | **Consulta / Obtiene registros del módulo bc_usuarios_roles.**<br>_Tabla/Modelo `bc_usuarios_roles`._ | 💡 Operaciones de bc_usuarios_roles. |
| **`POST`**   | `/api/bc_usuarios_roles`                        | `createItem`          | `authMiddleware(['all'])`<br>`validatorCreateUsuarioRol` | **Crea / Registra registros del módulo bc_usuarios_roles.**<br>_Tabla/Modelo `bc_usuarios_roles`._    | 💡 Operaciones de bc_usuarios_roles. |
| **`DELETE`** | `/api/bc_usuarios_roles/:ur_id`                 | `deleteItem`          | `authMiddleware(['all'])`<br>`validatorDeleteUsuarioRol` | **Elimina registros del módulo bc_usuarios_roles.**<br>_Tabla/Modelo `bc_usuarios_roles`._            | 💡 Operaciones de bc_usuarios_roles. |

---

### 📦 Módulo: `bc_usuarios_permisos`

- **Prefijo de Ruta Base:** `/api/bc_usuarios_permisos`
- **Archivo de Rutas:** [`api/routes/bc_usuarios_permisos.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_usuarios_permisos.js)

| Método       | Ruta Completa                                      | Handler / Controlador | Autenticación y Validadores                                  | Qué Consulta o Modifica                                                                                     | Caso de Uso / Soporte                  |
| :----------- | :------------------------------------------------- | :-------------------- | :----------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| **`GET`**    | `/api/bc_usuarios_permisos`                        | `getItems`            | `authMiddleware(['all'])`                                    | **Consulta / Obtiene registros del módulo bc_usuarios_permisos.**<br>_Tabla/Modelo `bc_usuarios_permisos`._ | 💡 Operaciones de bc_usuarios_permisos. |
| **`GET`**    | `/api/bc_usuarios_permisos/id/:up_id`              | `getItem`             | `authMiddleware(['all'])`<br>`validatorGetUsuarioPermiso`    | **Consulta / Obtiene registros del módulo bc_usuarios_permisos.**<br>_Tabla/Modelo `bc_usuarios_permisos`._ | 💡 Operaciones de bc_usuarios_permisos. |
| **`GET`**    | `/api/bc_usuarios_permisos/usuario/:up_usuario_id` | `getByUsuario`        | `authMiddleware(['all'])`<br>`validatorGetByUsuario`         | **Consulta / Obtiene registros del módulo bc_usuarios_permisos.**<br>_Tabla/Modelo `bc_usuarios_permisos`._ | 💡 Operaciones de bc_usuarios_permisos. |
| **`POST`**   | `/api/bc_usuarios_permisos`                        | `createItem`          | `authMiddleware(['all'])`<br>`validatorCreateUsuarioPermiso` | **Crea / Registra registros del módulo bc_usuarios_permisos.**<br>_Tabla/Modelo `bc_usuarios_permisos`._    | 💡 Operaciones de bc_usuarios_permisos. |
| **`DELETE`** | `/api/bc_usuarios_permisos/:up_id`                 | `deleteItem`          | `authMiddleware(['all'])`<br>`validatorDeleteUsuarioPermiso` | **Elimina registros del módulo bc_usuarios_permisos.**<br>_Tabla/Modelo `bc_usuarios_permisos`._            | 💡 Operaciones de bc_usuarios_permisos. |

---

### 📦 Módulo: `bc_usuarios_referidos`

- **Prefijo de Ruta Base:** `/api/bc_usuarios_referidos`
- **Archivo de Rutas:** [`api/routes/bc_usuarios_referidos.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_usuarios_referidos.js)

| Método      | Ruta Completa                                 | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                                          | Caso de Uso / Soporte                   |
| :---------- | :-------------------------------------------- | :-------------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| **`GET`**   | `/api/bc_usuarios_referidos`                  | `getItems`            | _Público_                                      | **Consulta / Obtiene registros del módulo bc_usuarios_referidos.**<br>_Tabla/Modelo `bc_usuarios_referidos`._    | 💡 Operaciones de bc_usuarios_referidos. |
| **`GET`**   | `/api/bc_usuarios_referidos/usuario/:usuario` | `getItemUser`         | `authMiddleware(['all'])`<br>`validatorGet`    | **Consulta / Obtiene registros del módulo bc_usuarios_referidos.**<br>_Tabla/Modelo `bc_usuarios_referidos`._    | 💡 Operaciones de bc_usuarios_referidos. |
| **`GET`**   | `/api/bc_usuarios_referidos/cod/:codigo`      | `getItemCod`          | `authMiddleware(['all'])`<br>`validatorGetCod` | **Consulta / Obtiene registros del módulo bc_usuarios_referidos.**<br>_Tabla/Modelo `bc_usuarios_referidos`._    | 💡 Operaciones de bc_usuarios_referidos. |
| **`POST`**  | `/api/bc_usuarios_referidos/registrar`        | `createItem`          | `authMiddleware(['all'])`<br>`validatorCreate` | **Crea / Registra registros del módulo bc_usuarios_referidos.**<br>_Tabla/Modelo `bc_usuarios_referidos`._       | 💡 Operaciones de bc_usuarios_referidos. |
| **`PATCH`** | `/api/bc_usuarios_referidos`                  | `updateReferido`      | `authMiddleware(["all"])`<br>`validatorGet`    | **Modifica parcialmente registros del módulo bc_usuarios_referidos.**<br>_Tabla/Modelo `bc_usuarios_referidos`._ | 💡 Operaciones de bc_usuarios_referidos. |

---

### 📦 Módulo: `bc_roles`

- **Prefijo de Ruta Base:** `/api/bc_roles`
- **Archivo de Rutas:** [`api/routes/bc_roles.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_roles.js)

| Método       | Ruta Completa              | Handler / Controlador | Autenticación y Validadores                       | Qué Consulta o Modifica                                                                | Caso de Uso / Soporte      |
| :----------- | :------------------------- | :-------------------- | :------------------------------------------------ | :------------------------------------------------------------------------------------- | :------------------------- |
| **`GET`**    | `/api/bc_roles`            | `getItems`            | `authMiddleware(['all'])`                         | **Consulta / Obtiene registros del módulo bc_roles.**<br>_Tabla/Modelo `bc_roles`._    | 💡 Operaciones de bc_roles. |
| **`GET`**    | `/api/bc_roles/id/:rol_id` | `getItem`             | `authMiddleware(['all'])`<br>`validatorGetRol`    | **Consulta / Obtiene registros del módulo bc_roles.**<br>_Tabla/Modelo `bc_roles`._    | 💡 Operaciones de bc_roles. |
| **`POST`**   | `/api/bc_roles`            | `createItem`          | `authMiddleware(['all'])`<br>`validatorCreateRol` | **Crea / Registra registros del módulo bc_roles.**<br>_Tabla/Modelo `bc_roles`._       | 💡 Operaciones de bc_roles. |
| **`PATCH`**  | `/api/bc_roles/:rol_id`    | `updateItem`          | `authMiddleware(['all'])`<br>`validatorUpdateRol` | **Modifica parcialmente registros del módulo bc_roles.**<br>_Tabla/Modelo `bc_roles`._ | 💡 Operaciones de bc_roles. |
| **`DELETE`** | `/api/bc_roles/:rol_id`    | `deleteItem`          | `authMiddleware(['all'])`<br>`validatorGetRol`    | **Elimina registros del módulo bc_roles.**<br>_Tabla/Modelo `bc_roles`._               | 💡 Operaciones de bc_roles. |

---

### 📦 Módulo: `bc_permisos`

- **Prefijo de Ruta Base:** `/api/bc_permisos`
- **Archivo de Rutas:** [`api/routes/bc_permisos.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_permisos.js)

| Método       | Ruta Completa                     | Handler / Controlador | Autenticación y Validadores                           | Qué Consulta o Modifica                                                                      | Caso de Uso / Soporte         |
| :----------- | :-------------------------------- | :-------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------- | :---------------------------- |
| **`GET`**    | `/api/bc_permisos`                | `getItems`            | `authMiddleware(['all'])`                             | **Consulta / Obtiene registros del módulo bc_permisos.**<br>_Tabla/Modelo `bc_permisos`._    | 💡 Operaciones de bc_permisos. |
| **`GET`**    | `/api/bc_permisos/id/:per_id`     | `getItem`             | `authMiddleware(['all'])`<br>`validatorGetPermiso`    | **Consulta / Obtiene registros del módulo bc_permisos.**<br>_Tabla/Modelo `bc_permisos`._    | 💡 Operaciones de bc_permisos. |
| **`GET`**    | `/api/bc_permisos/tipo/:per_tipo` | `getByTipo`           | `authMiddleware(['all'])`                             | **Consulta / Obtiene registros del módulo bc_permisos.**<br>_Tabla/Modelo `bc_permisos`._    | 💡 Operaciones de bc_permisos. |
| **`POST`**   | `/api/bc_permisos`                | `createItem`          | `authMiddleware(['all'])`<br>`validatorCreatePermiso` | **Crea / Registra registros del módulo bc_permisos.**<br>_Tabla/Modelo `bc_permisos`._       | 💡 Operaciones de bc_permisos. |
| **`PATCH`**  | `/api/bc_permisos/:per_id`        | `updateItem`          | `authMiddleware(['all'])`<br>`validatorUpdatePermiso` | **Modifica parcialmente registros del módulo bc_permisos.**<br>_Tabla/Modelo `bc_permisos`._ | 💡 Operaciones de bc_permisos. |
| **`DELETE`** | `/api/bc_permisos/:per_id`        | `deleteItem`          | `authMiddleware(['all'])`<br>`validatorGetPermiso`    | **Elimina registros del módulo bc_permisos.**<br>_Tabla/Modelo `bc_permisos`._               | 💡 Operaciones de bc_permisos. |

---

### 📦 Módulo: `bc_roles_permisos`

- **Prefijo de Ruta Base:** `/api/bc_roles_permisos`
- **Archivo de Rutas:** [`api/routes/bc_roles_permisos.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_roles_permisos.js)

| Método       | Ruta Completa                           | Handler / Controlador | Autenticación y Validadores                              | Qué Consulta o Modifica                                                                               | Caso de Uso / Soporte               |
| :----------- | :-------------------------------------- | :-------------------- | :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :---------------------------------- |
| **`GET`**    | `/api/bc_roles_permisos`                | `getItems`            | `authMiddleware(['all'])`                                | **Consulta / Obtiene registros del módulo bc_roles_permisos.**<br>_Tabla/Modelo `bc_roles_permisos`._ | 💡 Operaciones de bc_roles_permisos. |
| **`GET`**    | `/api/bc_roles_permisos/id/:rp_id`      | `getItem`             | `authMiddleware(['all'])`<br>`validatorGetRolPermiso`    | **Consulta / Obtiene registros del módulo bc_roles_permisos.**<br>_Tabla/Modelo `bc_roles_permisos`._ | 💡 Operaciones de bc_roles_permisos. |
| **`GET`**    | `/api/bc_roles_permisos/rol/:rp_rol_id` | `getByRol`            | `authMiddleware(['all'])`<br>`validatorGetByRol`         | **Consulta / Obtiene registros del módulo bc_roles_permisos.**<br>_Tabla/Modelo `bc_roles_permisos`._ | 💡 Operaciones de bc_roles_permisos. |
| **`POST`**   | `/api/bc_roles_permisos`                | `createItem`          | `authMiddleware(['all'])`<br>`validatorCreateRolPermiso` | **Crea / Registra registros del módulo bc_roles_permisos.**<br>_Tabla/Modelo `bc_roles_permisos`._    | 💡 Operaciones de bc_roles_permisos. |
| **`DELETE`** | `/api/bc_roles_permisos/:rp_id`         | `deleteItem`          | `authMiddleware(['all'])`<br>`validatorDeleteRolPermiso` | **Elimina registros del módulo bc_roles_permisos.**<br>_Tabla/Modelo `bc_roles_permisos`._            | 💡 Operaciones de bc_roles_permisos. |

---

### 📦 Módulo: `bc_empresas`

- **Prefijo de Ruta Base:** `/api/bc_empresas`
- **Archivo de Rutas:** [`api/routes/bc_empresas.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_empresas.js)

| Método      | Ruta Completa                                      | Handler / Controlador                           | Autenticación y Validadores                                     | Qué Consulta o Modifica                                                                      | Caso de Uso / Soporte         |
| :---------- | :------------------------------------------------- | :---------------------------------------------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :---------------------------- |
| **`GET`**   | `/api/bc_empresas`                                 | `getItems`                                      | _Público_                                                       | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/id/:emp_id`                      | `getItem`                                       | `validatorGet`                                                  | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/organization/:emp_id`            | `getItemFilterOrganitationFromStation`          | `validatorGet`                                                  | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/email/:emp_email`                | `getItemEmail`                                  | `validatorGetEmail`                                             | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`PATCH`** | `/api/bc_empresas/:emp_id`                         | `patchItem`                                     | `validatorGet`                                                  | **Modifica parcialmente registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._ | 💡 Operaciones de bc_empresas. |
| **`PATCH`** | `/api/bc_empresas/update/:emp_id`                  | `updateOrganization`                            | `validatorGet`                                                  | **Modifica parcialmente registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._ | 💡 Operaciones de bc_empresas. |
| **`POST`**  | `/api/bc_empresas/registrarempresa`                | `createItem`                                    | `authMiddleware(['all'])`<br>`validatorCreateEmpresa`           | **Crea / Registra registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._       | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/nombre/:emp_nombre`              | `getItemByName`                                 | `validatorGetByName`                                            | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/with-stations`                   | `getEmpresasWithStations`                       | `authMiddleware(["all"])`<br>`validatorGetEmpresasWithStations` | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/usuarios-count/:emp_id`          | `getUsuariosCountByOrganization`                | `authMiddleware(['all'])`                                       | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/usuarios-total-count`            | `getUsuariosCount`                              | `authMiddleware(['all'])`                                       | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/estaciones/usuarios/:estacionId` | `getUsersByStation`                             | `authMiddleware(['all'])`                                       | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/org_cortezza/:emp_id`            | `getItemFilterOrganitationFromStation_cortezza` | `authMiddleware(["external"])`<br>`validatorGet`                | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |
| **`GET`**   | `/api/bc_empresas/email_cortezza/:emp_email`       | `getItemEmail_cortezza`                         | `authMiddleware(["external"])`<br>`validatorGetEmail`           | **Consulta / Obtiene registros del módulo bc_empresas.**<br>_Tabla/Modelo `bc_empresas`._    | 💡 Operaciones de bc_empresas. |

---

### 📦 Módulo: `oficinas`

- **Prefijo de Ruta Base:** `/api/oficinas`
- **Archivo de Rutas:** [`api/routes/oficinas.js`](file:///Users/user/Projects/APP_nueva/api/routes/oficinas.js)

| Método       | Ruta Completa             | Handler / Controlador | Autenticación y Validadores                        | Qué Consulta o Modifica                                                                | Caso de Uso / Soporte      |
| :----------- | :------------------------ | :-------------------- | :------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------- |
| **`GET`**    | `/api/oficinas`           | `getItems`            | `authMiddleware(["all"])`                          | **Consulta / Obtiene registros del módulo oficinas.**<br>_Tabla/Modelo `oficinas`._    | 💡 Operaciones de oficinas. |
| **`GET`**    | `/api/oficinas/id/:_id`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorIdOficinas` | **Consulta / Obtiene registros del módulo oficinas.**<br>_Tabla/Modelo `oficinas`._    | 💡 Operaciones de oficinas. |
| **`POST`**   | `/api/oficinas/registrar` | `createItem`          | `authMiddleware(["all"])`<br>`validatorIdOficinas` | **Crea / Registra registros del módulo oficinas.**<br>_Tabla/Modelo `oficinas`._       | 💡 Operaciones de oficinas. |
| **`PATCH`**  | `/api/oficinas/:_id`      | `patchItem`           | `authMiddleware(["all"])`<br>`validatorIdOficinas` | **Modifica parcialmente registros del módulo oficinas.**<br>_Tabla/Modelo `oficinas`._ | 💡 Operaciones de oficinas. |
| **`DELETE`** | `/api/oficinas/:_id`      | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorIdOficinas` | **Elimina registros del módulo oficinas.**<br>_Tabla/Modelo `oficinas`._               | 💡 Operaciones de oficinas. |

---

### 📦 Módulo: `contratos`

- **Prefijo de Ruta Base:** `/api/contratos`
- **Archivo de Rutas:** [`api/routes/contratos.js`](file:///Users/user/Projects/APP_nueva/api/routes/contratos.js)

| Método       | Ruta Completa                                   | Handler / Controlador        | Autenticación y Validadores                            | Qué Consulta o Modifica                                                                  | Caso de Uso / Soporte       |
| :----------- | :---------------------------------------------- | :--------------------------- | :----------------------------------------------------- | :--------------------------------------------------------------------------------------- | :-------------------------- |
| **`GET`**    | `/api/contratos`                                | `getItems`                   | `authMiddleware(["all"])`                              | **Consulta / Obtiene registros del módulo contratos.**<br>_Tabla/Modelo `contratos`._    | 💡 Operaciones de contratos. |
| **`GET`**    | `/api/contratos/id/:_id`                        | `getItem`                    | `authMiddleware(["all"])`<br>`validatorIdContratos`    | **Consulta / Obtiene registros del módulo contratos.**<br>_Tabla/Modelo `contratos`._    | 💡 Operaciones de contratos. |
| **`GET`**    | `/api/contratos/organizationId/:organizationId` | `getItemsFilterOrganization` | `authMiddleware(["all"])`<br>`validatorOrganizationId` | **Consulta / Obtiene registros del módulo contratos.**<br>_Tabla/Modelo `contratos`._    | 💡 Operaciones de contratos. |
| **`POST`**   | `/api/contratos/registrar`                      | `createItem`                 | `authMiddleware(["all"])`<br>`validatorIdContratos`    | **Crea / Registra registros del módulo contratos.**<br>_Tabla/Modelo `contratos`._       | 💡 Operaciones de contratos. |
| **`PATCH`**  | `/api/contratos/:_id`                           | `patchItem`                  | `authMiddleware(["all"])`<br>`validatorIdContratos`    | **Modifica parcialmente registros del módulo contratos.**<br>_Tabla/Modelo `contratos`._ | 💡 Operaciones de contratos. |
| **`DELETE`** | `/api/contratos/:_id`                           | `deleteItem`                 | `authMiddleware(["all"])`<br>`validatorIdContratos`    | **Elimina registros del módulo contratos.**<br>_Tabla/Modelo `contratos`._               | 💡 Operaciones de contratos. |

---

### 📦 Módulo: `sesiones_usuarios`

- **Prefijo de Ruta Base:** `/api/sesiones_usuarios`
- **Archivo de Rutas:** [`api/routes/sesiones_usuarios.js`](file:///Users/user/Projects/APP_nueva/api/routes/sesiones_usuarios.js)

| Método      | Ruta Completa                   | Handler / Controlador | Autenticación y Validadores                           | Qué Consulta o Modifica                                                                                  | Caso de Uso / Soporte               |
| :---------- | :------------------------------ | :-------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| **`POST`**  | `/api/sesiones_usuarios/create` | `createSession`       | `authMiddleware(["all"])`<br>`validatorCreateSession` | **Crea / Registra registros del módulo sesiones_usuarios.**<br>_Tabla/Modelo `sesiones_usuarios`._       | 💡 Operaciones de sesiones_usuarios. |
| **`PATCH`** | `/api/sesiones_usuarios/close`  | `closeSession`        | `authMiddleware(["all"])`<br>`validatorCloseSession`  | **Modifica parcialmente registros del módulo sesiones_usuarios.**<br>_Tabla/Modelo `sesiones_usuarios`._ | 💡 Operaciones de sesiones_usuarios. |

---

### 📦 Módulo: `bc_historial_claves`

- **Prefijo de Ruta Base:** `/api/bc_historial_claves`
- **Archivo de Rutas:** [`api/routes/bc_historial_claves.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_historial_claves.js)

| Método     | Ruta Completa                                     | Handler / Controlador | Autenticación y Validadores                        | Qué Consulta o Modifica                                                                                   | Caso de Uso / Soporte                 |
| :--------- | :------------------------------------------------ | :-------------------- | :------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| **`GET`**  | `/api/bc_historial_claves`                        | `getItems`            | `authMiddleware(["all"])`                          | **Consulta / Obtiene registros del módulo bc_historial_claves.**<br>_Tabla/Modelo `bc_historial_claves`._ | 💡 Operaciones de bc_historial_claves. |
| **`GET`**  | `/api/bc_historial_claves/id/:his_id`             | `getItem`             | `authMiddleware(["all"])`<br>`validatorGet`        | **Consulta / Obtiene registros del módulo bc_historial_claves.**<br>_Tabla/Modelo `bc_historial_claves`._ | 💡 Operaciones de bc_historial_claves. |
| **`GET`**  | `/api/bc_historial_claves/changeKey`              | `getItemChangeKey`    | `authMiddleware(["all"])`                          | **Consulta / Obtiene registros del módulo bc_historial_claves.**<br>_Tabla/Modelo `bc_historial_claves`._ | 💡 Operaciones de bc_historial_claves. |
| **`POST`** | `/api/bc_historial_claves/registrar`              | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate`     | **Crea / Registra registros del módulo bc_historial_claves.**<br>_Tabla/Modelo `bc_historial_claves`._    | 💡 Operaciones de bc_historial_claves. |
| **`PUT`**  | `/api/bc_historial_claves/updateEstado`           | `updateItem`          | `authMiddleware(["all"])`<br>`validatorUpdate`     | **Actualiza registros del módulo bc_historial_claves.**<br>_Tabla/Modelo `bc_historial_claves`._          | 💡 Operaciones de bc_historial_claves. |
| **`GET`**  | `/api/bc_historial_claves/lastTen/:his_bicicleta` | `getItemLastTen`      | `authMiddleware(["all"])`<br>`validatorGetLastTen` | **Consulta / Obtiene registros del módulo bc_historial_claves.**<br>_Tabla/Modelo `bc_historial_claves`._ | 💡 Operaciones de bc_historial_claves. |

---

### 📦 Módulo: `tokenMsn`

- **Prefijo de Ruta Base:** `/api/tokenMsn`
- **Archivo de Rutas:** [`api/routes/tokenMsn.js`](file:///Users/user/Projects/APP_nueva/api/routes/tokenMsn.js)

| Método       | Ruta Completa                                      | Handler / Controlador                | Autenticación y Validadores                           | Qué Consulta o Modifica                                                                                                                             | Caso de Uso / Soporte                                                    |
| :----------- | :------------------------------------------------- | :----------------------------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **`GET`**    | `/api/tokenMsn`                                    | `getItems`                           | `authMiddleware(["all"])`                             | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`GET`**    | `/api/tokenMsn/:_id`                               | `getItem`                            | `authMiddleware(["all"])`<br>`validatorId`            | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`GET`**    | `/api/tokenMsn/documento/:documento`               | `getItemDocument`                    | `authMiddleware(["all"])`<br>`validatorDocumentToken` | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`GET`**    | `/api/tokenMsn/email/:email`                       | `getItemEmail`                       | `authMiddleware(["all"])`<br>`validatorEmailToken`    | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`POST`**   | `/api/tokenMsn/registrar`                          | `createItem`                         | `authMiddleware(["all"])`                             | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`PATCH`**  | `/api/tokenMsn/:_id`                               | `patchItem`                          | `authMiddleware(["all"])`<br>`validatorId`            | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`DELETE`** | `/api/tokenMsn/:_id`                               | `deleteItem`                         | `authMiddleware(["all"])`<br>`validatorId`            | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`GET`**    | `/api/tokenMsn/notification-users/:organizationId` | `getNotificationUsersByOrganization` | `authMiddleware(["all"])`                             | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`POST`**   | `/api/tokenMsn/send-notification-message`          | `sendNotificationMessage`            | `authMiddleware(["all"])`                             | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`GET`**    | `/api/tokenMsn/historial/:organizationId`          | `getNotificationHistory`             | `authMiddleware(["all"])`                             | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`POST`**   | `/api/tokenMsn/programar`                          | `createScheduledNotification`        | `authMiddleware(["all"])`                             | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`GET`**    | `/api/tokenMsn/programadas/:organizationId`        | `getScheduledNotifications`          | `authMiddleware(["all"])`                             | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`DELETE`** | `/api/tokenMsn/programar/:id`                      | `deleteScheduledNotification`        | `authMiddleware(["all"])`                             | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |

---

### 📦 Módulo: `notificaciones`

- **Prefijo de Ruta Base:** `/api/notificaciones`
- **Archivo de Rutas:** [`api/routes/notificaciones.js`](file:///Users/user/Projects/APP_nueva/api/routes/notificaciones.js)

| Método                                                        | Ruta Completa                         | Handler / Controlador                                                                                                                               | Autenticación y Validadores                                              | Qué Consulta o Modifica                                                                                                                             | Caso de Uso / Soporte                                                    |
| :------------------------------------------------------------ | :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **`GET`**                                                     | `/api/notificaciones/test`            | `res) => {                                                                                                                                          |
| res.json({ message: "Módulo de notificaciones funcionando" }` | `(req`                                | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`POST`**                                                    | `/api/notificaciones/enviar`          | `enviarPush`                                                                                                                                        | `validatorCreatePush`                                                    | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |
| **`POST`**                                                    | `/api/notificaciones/enviar-multiple` | `enviarPushMultiple`                                                                                                                                | `validatorCreatePushMultiple`                                            | **Registro y actualización del token FCM (Firebase) del dispositivo móvil para notificaciones.**<br>_Tabla `tokenMsn` / `historialNotificaciones`._ | 💡 Validar si el usuario puede recibir notificaciones push en su celular. |

---

### 📦 Módulo: `bc_registros_pp`

- **Prefijo de Ruta Base:** `/api/bc_registros_pp`
- **Archivo de Rutas:** [`api/routes/bc_registros_pp.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_registros_pp.js)

| Método      | Ruta Completa                                                                | Handler / Controlador             | Autenticación y Validadores                 | Qué Consulta o Modifica                                                                              | Caso de Uso / Soporte             |
| :---------- | :--------------------------------------------------------------------------- | :-------------------------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------------- | :-------------------------------- |
| **`GET`**   | `/api/bc_registros_pp`                                                       | `getItems`                        | `authMiddleware(["all"])`<br>`validatorGet` | **Consulta / Obtiene registros del módulo bc_registros_pp.**<br>_Tabla/Modelo `bc_registros_pp`._    | 💡 Operaciones de bc_registros_pp. |
| **`GET`**   | `/api/bc_registros_pp/comentarios/empresa/:empresa_id/estacion/:estacion_id` | `getComentariosByEmpresaEstacion` | `authMiddleware(["all"])`                   | **Consulta / Obtiene registros del módulo bc_registros_pp.**<br>_Tabla/Modelo `bc_registros_pp`._    | 💡 Operaciones de bc_registros_pp. |
| **`GET`**   | `/api/bc_registros_pp/comentarios/empresa/:empresa_id`                       | `getComentariosByEmpresaEstacion` | `authMiddleware(["all"])`                   | **Consulta / Obtiene registros del módulo bc_registros_pp.**<br>_Tabla/Modelo `bc_registros_pp`._    | 💡 Operaciones de bc_registros_pp. |
| **`GET`**   | `/api/bc_registros_pp/:id`                                                   | `getItem`                         | `authMiddleware(["all"])`<br>`validatorGet` | **Consulta / Obtiene registros del módulo bc_registros_pp.**<br>_Tabla/Modelo `bc_registros_pp`._    | 💡 Operaciones de bc_registros_pp. |
| **`PATCH`** | `/api/bc_registros_pp/:id`                                                   | `updateItem`                      | `authMiddleware(["all"])`<br>`validatorGet` | **Modifica parcialmente registros del módulo bc_registros_pp.**<br>_Tabla/Modelo `bc_registros_pp`._ | 💡 Operaciones de bc_registros_pp. |
| **`POST`**  | `/api/bc_registros_pp/registrar`                                             | `createItem`                      | `validatorCreate`                           | **Crea / Registra registros del módulo bc_registros_pp.**<br>_Tabla/Modelo `bc_registros_pp`._       | 💡 Operaciones de bc_registros_pp. |
| **`GET`**   | `/api/bc_registros_pp/empresa/:organizationId`                               | `getItemsByOrganization`          | `authMiddleware(["all"])`                   | **Consulta / Obtiene registros del módulo bc_registros_pp.**<br>_Tabla/Modelo `bc_registros_pp`._    | 💡 Operaciones de bc_registros_pp. |

---

### 📦 Módulo: `bc_registro_ext`

- **Prefijo de Ruta Base:** `/api/bc_registro_ext`
- **Archivo de Rutas:** [`api/routes/bc_registro_ext.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_registro_ext.js)

| Método     | Ruta Completa                       | Handler / Controlador | Autenticación y Validadores                              | Qué Consulta o Modifica                                                                           | Caso de Uso / Soporte             |
| :--------- | :---------------------------------- | :-------------------- | :------------------------------------------------------- | :------------------------------------------------------------------------------------------------ | :-------------------------------- |
| **`GET`**  | `/api/bc_registro_ext`              | `getItems`            | `authMiddleware(["all"])`                                | **Consulta / Obtiene registros del módulo bc_registro_ext.**<br>_Tabla/Modelo `bc_registro_ext`._ | 💡 Operaciones de bc_registro_ext. |
| **`GET`**  | `/api/bc_registro_ext/id/:idUser`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetUser`          | **Consulta / Obtiene registros del módulo bc_registro_ext.**<br>_Tabla/Modelo `bc_registro_ext`._ | 💡 Operaciones de bc_registro_ext. |
| **`POST`** | `/api/bc_registro_ext/registrar`    | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateRegistoExt` | **Crea / Registra registros del módulo bc_registro_ext.**<br>_Tabla/Modelo `bc_registro_ext`._    | 💡 Operaciones de bc_registro_ext. |
| **`POST`** | `/api/bc_registro_ext/updateEstado` | `updateItem`          | `authMiddleware(["all"])`<br>`validatorGetUser`          | **Crea / Registra registros del módulo bc_registro_ext.**<br>_Tabla/Modelo `bc_registro_ext`._    | 💡 Operaciones de bc_registro_ext. |

---

## 🗂️ 3. Carpooling / Auto Compartido (Módulo Compartido)

> Publicación de rutas de conductores, solicitudes de pasajeros, cupos, seguimiento de viajes compartidos activos, pagos, cobros y calificaciones de servicio.

### 📦 Módulo: `compartidoViajeActivo`

- **Prefijo de Ruta Base:** `/api/compartidoViajeActivo`
- **Archivo de Rutas:** [`api/routes/compartidoViajeActivo.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoViajeActivo.js)

| Método       | Ruta Completa                                                 | Handler / Controlador                           | Autenticación y Validadores                                     | Qué Consulta o Modifica                                                                                                              | Caso de Uso / Soporte                                                   |
| :----------- | :------------------------------------------------------------ | :---------------------------------------------- | :-------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoViajeActivo`                                  | `getItems`                                      | `authMiddleware(["all"])`                                       | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/id/:_id`                          | `getItem`                                       | `authMiddleware(["all"])`<br>`validatorIdViajeActivo`           | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/organizationId/:organizationId`   | `getItemsFilterOrganization`                    | `authMiddleware(["all"])`<br>`validatorOrganizationId`          | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/organizationById/:organizationId` | `getItemsByCompatidoViajesOrganization`         | `authMiddleware(["all"])`<br>`validatorOrganizationId`          | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/prestamoActivos`                  | `getItemAllPrestamoActivos`                     | `authMiddleware(["all"])`                                       | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/viajes/:documento`                | `getItemAllPrestamoActivosFiltered`             | `authMiddleware(["all"])`                                       | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/viajesFiltered/:documento`        | `getItemAllPrestamoActivosFilteredToAplication` | `authMiddleware(["all"])`                                       | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/prestamoActivo/:_id`              | `getItemPrestamoActivo`                         | `authMiddleware(["all"])`<br>`validatorIdViajeActivo`           | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/viajeTerminado/:conductor`        | `getItemTripEnd`                                | `authMiddleware(["all"])`<br>`validatorDocument`                | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/conductorActivo/:conductor`       | `getItemPrestamoActivoConductor`                | `authMiddleware(["all"])`<br>`validatorConductorViajeActivo`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/conductorProceso/:conductor`      | `getItemPrestamoActivoConductorProceso`         | `authMiddleware(["all"])`<br>`validatorConductorViajeActivo`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoViajeActivo/organizacion/:idOrganizacion`     | `getItemPrestamoActivoOrganizacion`             | `authMiddleware(["all"])`<br>`validatorOrganizacionViajeActivo` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoViajeActivo/registrar`                        | `createItem`                                    | `authMiddleware(["all"])`<br>`validatorIdViajeActivo`           | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoViajeActivo/:_id`                             | `patchItem`                                     | `authMiddleware(["all"])`<br>`validatorIdViajeActivo`           | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoViajeActivo/:_id`                             | `deleteItem`                                    | `authMiddleware(["all"])`<br>`validatorIdViajeActivo`           | **Gestión del submódulo de viajes compartidos / carpooling: compartidoViajeActivo.**<br>_Tablas asociadas: `compartidoViajeActivo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

### 📦 Módulo: `compartidoConductor`

- **Prefijo de Ruta Base:** `/api/compartidoConductor`
- **Archivo de Rutas:** [`api/routes/compartidoConductor.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoConductor.js)

| Método       | Ruta Completa                                               | Handler / Controlador         | Autenticación y Validadores                            | Qué Consulta o Modifica                                                                                                          | Caso de Uso / Soporte                                                   |
| :----------- | :---------------------------------------------------------- | :---------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoConductor`                                  | `getItems`                    | `authMiddleware(["all"])`                              | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoConductor/id/:_id`                          | `getItem`                     | `authMiddleware(["all"])`<br>`validatorIdConductor`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoConductor/itinerario/:_id`                  | `getItinerario`               | `authMiddleware(["all"])`<br>`validatorIdConductor`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoConductor/historial/:_id`                   | `getHistorial`                | `authMiddleware(["all"])`<br>`validatorIdConductor`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoConductor/organizationId/:organizationId`   | `getItemsFilterOrganization`  | `authMiddleware(["all"])`<br>`validatorOrganizationId` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoConductor/organizationById/:organizationId` | `getCoductoresByOrganization` | `authMiddleware(["all"])`<br>`validatorOrganizationId` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoConductor/registrar`                        | `createItem`                  | `authMiddleware(["all"])`<br>`validatorIdConductor`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PUT`**    | `/api/compartidoConductor`                                  | `updateItem`                  | `authMiddleware(["all"])`                              | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoConductor/:_id`                             | `patchItem`                   | `authMiddleware(["all"])`<br>`validatorIdConductor`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoConductor/:_id`                             | `deleteItem`                  | `authMiddleware(["all"])`                              | **Gestión del submódulo de viajes compartidos / carpooling: compartidoConductor.**<br>_Tablas asociadas: `compartidoConductor`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

### 📦 Módulo: `compartidoPasajero`

- **Prefijo de Ruta Base:** `/api/compartidoPasajero`
- **Archivo de Rutas:** [`api/routes/compartidoPasajero.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoPasajero.js)

| Método       | Ruta Completa                                              | Handler / Controlador        | Autenticación y Validadores                            | Qué Consulta o Modifica                                                                                                        | Caso de Uso / Soporte                                                   |
| :----------- | :--------------------------------------------------------- | :--------------------------- | :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoPasajero`                                  | `getItems`                   | `authMiddleware(["all"])`                              | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPasajero.**<br>_Tablas asociadas: `compartidoPasajero`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoPasajero/id/:_id`                          | `getItem`                    | `authMiddleware(["all"])`<br>`validatorIdPasajero`     | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPasajero.**<br>_Tablas asociadas: `compartidoPasajero`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoPasajero/organizationId/:organizationId`   | `getItemsFilterOrganization` | `authMiddleware(["all"])`<br>`validatorOrganizationId` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPasajero.**<br>_Tablas asociadas: `compartidoPasajero`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoPasajero/organizationById/:organizationId` | `getPasajerosByOrganization` | `authMiddleware(["all"])`<br>`validatorOrganizationId` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPasajero.**<br>_Tablas asociadas: `compartidoPasajero`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoPasajero/registrar`                        | `createItem`                 | `authMiddleware(["all"])`<br>`validatorIdPasajero`     | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPasajero.**<br>_Tablas asociadas: `compartidoPasajero`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoPasajero/:_id`                             | `patchItem`                  | `authMiddleware(["all"])`<br>`validatorIdPasajero`     | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPasajero.**<br>_Tablas asociadas: `compartidoPasajero`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoPasajero/:_id`                             | `deleteItem`                 | `authMiddleware(["all"])`                              | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPasajero.**<br>_Tablas asociadas: `compartidoPasajero`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

### 📦 Módulo: `compartidoSolicitud`

- **Prefijo de Ruta Base:** `/api/compartidoSolicitud`
- **Archivo de Rutas:** [`api/routes/compartidoSolicitud.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoSolicitud.js)

| Método       | Ruta Completa                                                  | Handler / Controlador        | Autenticación y Validadores                            | Qué Consulta o Modifica                                                                                                          | Caso de Uso / Soporte                                                   |
| :----------- | :------------------------------------------------------------- | :--------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoSolicitud`                                     | `getItems`                   | `authMiddleware(["all"])`                              | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoSolicitud/id/:_id`                             | `getItem`                    | `authMiddleware(["all"])`<br>`validatorIdSolicitud`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoSolicitud/organizationId/:organizationId`      | `getItemsFilterOrganization` | `authMiddleware(["all"])`<br>`validatorOrganizationId` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoSolicitud/viaje/:idSolicitante`                | `getItemByDocument`          | `authMiddleware(["all"])`<br>`validatorSolicitante`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoSolicitud/solicitudes/:idViajeSolicitado`      | `getItemTrip`                | `authMiddleware(["all"])`<br>`validatorviajeSolicitud` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoSolicitud/solicitudesPagos/:idViajeSolicitado` | `getItemsSolicitudesPagos`   | `authMiddleware(["all"])`<br>`validatorviajeSolicitud` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoSolicitud/registrar`                           | `createItem`                 | `authMiddleware(["all"])`<br>`validatorIdSolicitud`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoSolicitud/:_id`                                | `patchItem`                  | `authMiddleware(["all"])`<br>`validatorIdSolicitud`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoSolicitud/idTrip/:_id`                         | `patchItemIdTrip`            | `authMiddleware(["all"])`<br>`validatorIdSolicitud`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoSolicitud/:_id`                                | `deleteItem`                 | `authMiddleware(["all"])`<br>`validatorIdSolicitud`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitud.**<br>_Tablas asociadas: `compartidoSolicitud`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

### 📦 Módulo: `compartidoSolicitudesNoEncontradas`

- **Prefijo de Ruta Base:** `/api/compartidoSolicitudesNoEncontradas`
- **Archivo de Rutas:** [`api/routes/compartidoSolicitudesNoEncontradas.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoSolicitudesNoEncontradas.js)

| Método       | Ruta Completa                                        | Handler / Controlador | Autenticación y Validadores                             | Qué Consulta o Modifica                                                                                                                                        | Caso de Uso / Soporte                                                   |
| :----------- | :--------------------------------------------------- | :-------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoSolicitudesNoEncontradas`            | `getItems`            | `authMiddleware(["all"])`                               | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitudesNoEncontradas.**<br>_Tablas asociadas: `compartidoSolicitudesNoEncontradas`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoSolicitudesNoEncontradas/id/:id`     | `getItem`             | `authMiddleware(["all"])`<br>`validatorIdSolicitudPend` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitudesNoEncontradas.**<br>_Tablas asociadas: `compartidoSolicitudesNoEncontradas`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoSolicitudesNoEncontradas/pendientes` | `getItemsPendientes`  | _Público_                                               | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitudesNoEncontradas.**<br>_Tablas asociadas: `compartidoSolicitudesNoEncontradas`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoSolicitudesNoEncontradas/registrar`  | `createItem`          | `validatorSolicitudNoEncontrada`                        | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitudesNoEncontradas.**<br>_Tablas asociadas: `compartidoSolicitudesNoEncontradas`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoSolicitudesNoEncontradas/actualizar` | `patchItem`           | `validatorIdSolicitudPendPatch`                         | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitudesNoEncontradas.**<br>_Tablas asociadas: `compartidoSolicitudesNoEncontradas`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoSolicitudesNoEncontradas/:id`        | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorIdSolicitudPend` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoSolicitudesNoEncontradas.**<br>_Tablas asociadas: `compartidoSolicitudesNoEncontradas`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

### 📦 Módulo: `compartidoVehiculo`

- **Prefijo de Ruta Base:** `/api/compartidoVehiculo`
- **Archivo de Rutas:** [`api/routes/compartidoVehiculo.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoVehiculo.js)

| Método       | Ruta Completa                                        | Handler / Controlador | Autenticación y Validadores                        | Qué Consulta o Modifica                                                                                                        | Caso de Uso / Soporte                                                   |
| :----------- | :--------------------------------------------------- | :-------------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoVehiculo`                            | `getItems`            | `authMiddleware(["all"])`                          | **Gestión del submódulo de viajes compartidos / carpooling: compartidoVehiculo.**<br>_Tablas asociadas: `compartidoVehiculo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoVehiculo/:_id`                       | `getItem`             | `authMiddleware(["all"])`<br>`validatorIdVehiculo` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoVehiculo.**<br>_Tablas asociadas: `compartidoVehiculo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoVehiculo/propietario/:idpropietario` | `getItemfilter`       | `authMiddleware(["all"])`                          | **Gestión del submódulo de viajes compartidos / carpooling: compartidoVehiculo.**<br>_Tablas asociadas: `compartidoVehiculo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoVehiculo/registrar`                  | `createItem`          | `authMiddleware(["all"])`<br>`validatorIdVehiculo` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoVehiculo.**<br>_Tablas asociadas: `compartidoVehiculo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoVehiculo/:_id`                       | `patchItem`           | `authMiddleware(["all"])`<br>`validatorIdVehiculo` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoVehiculo.**<br>_Tablas asociadas: `compartidoVehiculo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoVehiculo/:_id`                       | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorId`         | **Gestión del submódulo de viajes compartidos / carpooling: compartidoVehiculo.**<br>_Tablas asociadas: `compartidoVehiculo`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

### 📦 Módulo: `compartidoPagos`

- **Prefijo de Ruta Base:** `/api/compartidoPagos`
- **Archivo de Rutas:** [`api/routes/compartidoPagos.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoPagos.js)

| Método       | Ruta Completa                           | Handler / Controlador | Autenticación y Validadores                          | Qué Consulta o Modifica                                                                                                  | Caso de Uso / Soporte                                                   |
| :----------- | :-------------------------------------- | :-------------------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoPagos`                  | `getItems`            | `authMiddleware(["all"])`                            | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPagos.**<br>_Tablas asociadas: `compartidoPagos`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoPagos/id/:_id`          | `getItem`             | `authMiddleware(["all"])`<br>`validatorIdPagos`      | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPagos.**<br>_Tablas asociadas: `compartidoPagos`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoPagos/idviaje/:idViaje` | `getItemsTrip`        | `authMiddleware(["all"])`<br>`validatorIdViaje`      | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPagos.**<br>_Tablas asociadas: `compartidoPagos`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoPagos/registrar`        | `createItem`          | `authMiddleware(["all"])`<br>`validatorRegisterPago` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPagos.**<br>_Tablas asociadas: `compartidoPagos`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoPagos/:_id`             | `patchItem`           | `authMiddleware(["all"])`<br>`validatorIdPagos`      | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPagos.**<br>_Tablas asociadas: `compartidoPagos`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoPagos/:_id`             | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorIdPagos`      | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPagos.**<br>_Tablas asociadas: `compartidoPagos`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

### 📦 Módulo: `compartidoComentarios`

- **Prefijo de Ruta Base:** `/api/compartidoComentarios`
- **Archivo de Rutas:** [`api/routes/compartidoComentarios.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoComentarios.js)

| Método       | Ruta Completa                                               | Handler / Controlador        | Autenticación y Validadores                               | Qué Consulta o Modifica                                                                                                              | Caso de Uso / Soporte                                                   |
| :----------- | :---------------------------------------------------------- | :--------------------------- | :-------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoComentarios`                                | `getItems`                   | `authMiddleware(["all"])`                                 | **Gestión del submódulo de viajes compartidos / carpooling: compartidoComentarios.**<br>_Tablas asociadas: `compartidoComentarios`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoComentarios/organizationId/:organizationId` | `getItemsFilterOrganization` | `authMiddleware(["all"])`<br>`validatorOrganizationId`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoComentarios.**<br>_Tablas asociadas: `compartidoComentarios`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoComentarios/id/:_id`                        | `getItem`                    | `authMiddleware(["all"])`<br>`validatorIdComentarios`     | **Gestión del submódulo de viajes compartidos / carpooling: compartidoComentarios.**<br>_Tablas asociadas: `compartidoComentarios`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoComentarios/idCalificacion/:idCalificacion` | `getItemsIdCalificacion`     | `authMiddleware(["all"])`<br>`validatorIdCalificacion`    | **Gestión del submódulo de viajes compartidos / carpooling: compartidoComentarios.**<br>_Tablas asociadas: `compartidoComentarios`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoComentarios/registrar`                      | `createItem`                 | `authMiddleware(["all"])`<br>`validatorCreateComentarios` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoComentarios.**<br>_Tablas asociadas: `compartidoComentarios`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoComentarios/:_id`                           | `patchItem`                  | `authMiddleware(["all"])`<br>`validatorIdComentarios`     | **Gestión del submódulo de viajes compartidos / carpooling: compartidoComentarios.**<br>_Tablas asociadas: `compartidoComentarios`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoComentarios/:_id`                           | `deleteItem`                 | `authMiddleware(["all"])`<br>`validatorIdComentarios`     | **Gestión del submódulo de viajes compartidos / carpooling: compartidoComentarios.**<br>_Tablas asociadas: `compartidoComentarios`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

### 📦 Módulo: `compartidoPenalizaciones`

- **Prefijo de Ruta Base:** `/api/compartidoPenalizaciones`
- **Archivo de Rutas:** [`api/routes/compartidoPenalizaciones.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoPenalizaciones.js)

| Método       | Ruta Completa                                                  | Handler / Controlador        | Autenticación y Validadores                            | Qué Consulta o Modifica                                                                                                                    | Caso de Uso / Soporte                                                   |
| :----------- | :------------------------------------------------------------- | :--------------------------- | :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoPenalizaciones`                                | `getItems`                   | `authMiddleware(["all"])`                              | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPenalizaciones.**<br>_Tablas asociadas: `compartidoPenalizaciones`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoPenalizaciones/id/:_id`                        | `getItem`                    | `authMiddleware(["all"])`<br>`validatorIdPenalizacion` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPenalizaciones.**<br>_Tablas asociadas: `compartidoPenalizaciones`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoPenalizaciones/organizationId/:organizationId` | `getItemsFilterOrganization` | `authMiddleware(["all"])`<br>`validatorOrganizationId` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPenalizaciones.**<br>_Tablas asociadas: `compartidoPenalizaciones`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoPenalizaciones/registrar`                      | `createItem`                 | `authMiddleware(["all"])`<br>`validatorIdPenalizacion` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPenalizaciones.**<br>_Tablas asociadas: `compartidoPenalizaciones`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoPenalizaciones/:_id`                           | `patchItem`                  | `authMiddleware(["all"])`<br>`validatorIdPenalizacion` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPenalizaciones.**<br>_Tablas asociadas: `compartidoPenalizaciones`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoPenalizaciones/:_id`                           | `deleteItem`                 | `authMiddleware(["all"])`<br>`validatorIdPenalizacion` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoPenalizaciones.**<br>_Tablas asociadas: `compartidoPenalizaciones`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

### 📦 Módulo: `compartidoIndicadores`

- **Prefijo de Ruta Base:** `/api/compartidoIndicadores`
- **Archivo de Rutas:** [`api/routes/compartidoIndicadores.js`](file:///Users/user/Projects/APP_nueva/api/routes/compartidoIndicadores.js)

| Método       | Ruta Completa                          | Handler / Controlador | Autenticación y Validadores                            | Qué Consulta o Modifica                                                                                                              | Caso de Uso / Soporte                                                   |
| :----------- | :------------------------------------- | :-------------------- | :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`GET`**    | `/api/compartidoIndicadores`           | `getItems`            | `authMiddleware(["all"])`                              | **Gestión del submódulo de viajes compartidos / carpooling: compartidoIndicadores.**<br>_Tablas asociadas: `compartidoIndicadores`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`GET`**    | `/api/compartidoIndicadores/id/:_id`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorIdPenalizacion` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoIndicadores.**<br>_Tablas asociadas: `compartidoIndicadores`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`POST`**   | `/api/compartidoIndicadores/registrar` | `createItem`          | `authMiddleware(["all"])`                              | **Gestión del submódulo de viajes compartidos / carpooling: compartidoIndicadores.**<br>_Tablas asociadas: `compartidoIndicadores`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`PATCH`**  | `/api/compartidoIndicadores/:_id`      | `patchItem`           | `authMiddleware(["all"])`<br>`validatorIdPenalizacion` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoIndicadores.**<br>_Tablas asociadas: `compartidoIndicadores`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |
| **`DELETE`** | `/api/compartidoIndicadores/:_id`      | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorIdPenalizacion` | **Gestión del submódulo de viajes compartidos / carpooling: compartidoIndicadores.**<br>_Tablas asociadas: `compartidoIndicadores`._ | 💡 Soporte para viajes en auto compartido entre conductores y pasajeros. |

---

## 🗂️ 4. Parqueadero / Parqueo Inteligente

> Control de celdas y espacios de parqueo, tarifas, rentas por horas/días, reservas anticipadas, horarios de operación, términos y feedback de usuarios.

### 📦 Módulo: `parqueo_parqueaderos`

- **Prefijo de Ruta Base:** `/api/parqueo_parqueaderos`
- **Archivo de Rutas:** [`api/routes/parqueo_parqueaderos.js`](file:///Users/user/Projects/APP_nueva/api/routes/parqueo_parqueaderos.js)

| Método       | Ruta Completa                                           | Handler / Controlador         | Autenticación y Validadores                                  | Qué Consulta o Modifica                                                                                            | Caso de Uso / Soporte                                              |
| :----------- | :------------------------------------------------------ | :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **`GET`**    | `/api/parqueo_parqueaderos`                             | `getItems`                    | `authMiddleware(["all"])`                                    | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_parqueaderos/id/:id`                      | `getItem`                     | `authMiddleware(["all"])`<br>`validatorGetId`                | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_parqueaderos/empresa/:empresa`            | `getItemEmpresa`              | `validatorGetEmpresa`                                        | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**   | `/api/parqueo_parqueaderos/registrar`                   | `createItem`                  | `authMiddleware(["all"])`<br>`validatorCreate`               | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_parqueaderos/empresa-id/:empresaId`       | `getItemEmpresaId`            | `authMiddleware(["all"])`<br>`validatorGetEmpresaId`         | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`PUT`**    | `/api/parqueo_parqueaderos/id/:id`                      | `updateItem`                  | `authMiddleware(["all"])`<br>`validatorUpdate`               | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_parqueaderos/puntos-carga/:parqueaderoId` | `getPuntosCargaByParqueadero` | `authMiddleware(["all"])`<br>`validatorGetPuntosCarga`       | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**   | `/api/parqueo_parqueaderos/puntos-carga/masivo`         | `createPuntosCargaMasivo`     | `authMiddleware(["all"])`<br>`validatorCreatePuntosMasivo`   | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`PUT`**    | `/api/parqueo_parqueaderos/puntos-carga/masivo`         | `updatePuntosCargaMasivo`     | `authMiddleware(["all"])`<br>`validatorUpdatePuntosMasivo`   | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_parqueaderos/horarios/:parqueaderoId`     | `getHorariosByParqueadero`    | `authMiddleware(["all"])`<br>`validatorGetHorarios`          | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**   | `/api/parqueo_parqueaderos/horarios/masivo`             | `createHorariosMasivo`        | `authMiddleware(["all"])`<br>`validatorCreateHorariosMasivo` | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`PUT`**    | `/api/parqueo_parqueaderos/horarios/masivo`             | `updateHorariosMasivo`        | `authMiddleware(["all"])`<br>`validatorUpdateHorariosMasivo` | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`DELETE`** | `/api/parqueo_parqueaderos/id/:id`                      | `deleteItem`                  | `authMiddleware(["all"])`<br>`validatorGetId`                | **Gestión del submódulo de parqueadero inteligente: parqueaderos.**<br>_Tablas asociadas: `parqueo_parqueaderos`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |

---

### 📦 Módulo: `parqueo_lugar`

- **Prefijo de Ruta Base:** `/api/parqueo_lugar`
- **Archivo de Rutas:** [`api/routes/parqueo_lugar.js`](file:///Users/user/Projects/APP_nueva/api/routes/parqueo_lugar.js)

| Método       | Ruta Completa                                           | Handler / Controlador          | Autenticación y Validadores                              | Qué Consulta o Modifica                                                                              | Caso de Uso / Soporte                                              |
| :----------- | :------------------------------------------------------ | :----------------------------- | :------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **`GET`**    | `/api/parqueo_lugar`                                    | `getItems`                     | `authMiddleware(["all"])`                                | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_lugar/id/:id`                             | `getItem`                      | `authMiddleware(["all"])`<br>`validatorGetId`            | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_lugar/bluetooth/:bluetooth`               | `getItemBluetooth`             | `validatorGetBluetooth`                                  | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_lugar/numero/:numero`                     | `getItemNumero`                | `authMiddleware(["all"])`<br>`validatorGetNumero`        | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_lugar/qr/:qr`                             | `getItemQR`                    | `authMiddleware(["all"])`<br>`validatorGetQR`            | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_lugar/parqueaderoAll/:parqueadero`        | `getItemParqueaderoAll`        | `authMiddleware(["all"])`<br>`validatorGetParqueadero`   | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_lugar/parqueaderoDisponible/:parqueadero` | `getItemParqueaderoDisponible` | `authMiddleware(["all"])`<br>`validatorGetParqueadero`   | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**   | `/api/parqueo_lugar/registrar`                          | `createItem`                   | `authMiddleware(["all"])`<br>`validatorCreate`           | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**   | `/api/parqueo_lugar/updateEstado`                       | `updateItem`                   | `authMiddleware(["all"])`<br>`validatorGetId`            | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**   | `/api/parqueo_lugar/updateEstadoQr`                     | `updateItem_qr`                | `authMiddleware(["all"])`<br>`validatorGetQR`            | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`PUT`**    | `/api/parqueo_lugar/updateEstadoDash`                   | `updateItem`                   | `authMiddleware(["all"])`<br>`validatorGetId`            | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**    | `/api/parqueo_lugar/empresa-id/:empresaId`              | `getItemEmpresaId`             | `authMiddleware(["all"])`<br>`validatorGetEmpresaId`     | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`PUT`**    | `/api/parqueo_lugar/id/:id`                             | `updateItemElectroHub`         | `authMiddleware(["all"])`<br>`validatorUpdateElectroHub` | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`DELETE`** | `/api/parqueo_lugar/id/:id`                             | `deleteItem`                   | `authMiddleware(["all"])`<br>`validatorGetId`            | **Gestión del submódulo de parqueadero inteligente: lugar.**<br>_Tablas asociadas: `parqueo_lugar`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |

---

### 📦 Módulo: `parqueo_renta`

- **Prefijo de Ruta Base:** `/api/parqueo_renta`
- **Archivo de Rutas:** [`api/routes/parqueo_renta.js`](file:///Users/user/Projects/APP_nueva/api/routes/parqueo_renta.js)

| Método      | Ruta Completa                                     | Handler / Controlador           | Autenticación y Validadores                        | Qué Consulta o Modifica                                                                              | Caso de Uso / Soporte                                              |
| :---------- | :------------------------------------------------ | :------------------------------ | :------------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **`GET`**   | `/api/parqueo_renta`                              | `getItems`                      | `authMiddleware(["all"])`                          | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_renta/id/:id`                       | `getItem`                       | `authMiddleware(["all"])`<br>`validatorGet`        | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_renta/prestamoActivos`              | `getItemAllPrestamoActivos`     | `authMiddleware(["all"])`                          | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_renta/prestamoFinalizados`          | `getItemAllPrestamoFinalizados` | `authMiddleware(["all"])`                          | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_renta/prestamoFinalizadosFilter`    | `getItemsToDate`                | `authMiddleware(["all"])`                          | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_renta/prestamoActivo/:usuario`      | `getItemPrestamoActivo`         | `authMiddleware(["all"])`<br>`validatorGetUsuario` | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_renta/usuario/:usuario`             | `getItemUsuario`                | `authMiddleware(["all"])`<br>`validatorGetUsuario` | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**  | `/api/parqueo_renta/registrar`                    | `createItem`                    | `authMiddleware(["all"])`<br>`validatorCreate`     | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**  | `/api/parqueo_renta/updateEstado`                 | `updateItem`                    | `authMiddleware(["all"])`<br>`validatorGet`        | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`PATCH`** | `/api/parqueo_renta/:id`                          | `patchItem`                     | `authMiddleware(["all"])`<br>`validatorGet`        | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`PUT`**   | `/api/parqueo_renta/updateState`                  | `updateItem`                    | `authMiddleware(["all"])`<br>`validatorGet`        | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_renta/electrohubReports/:empresaId` | `getElectroHubReports`          | `authMiddleware(["all"])`                          | **Gestión del submódulo de parqueadero inteligente: renta.**<br>_Tablas asociadas: `parqueo_renta`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |

---

### 📦 Módulo: `parqueo_reservas`

- **Prefijo de Ruta Base:** `/api/parqueo_reservas`
- **Archivo de Rutas:** [`api/routes/parqueo_reservas.js`](file:///Users/user/Projects/APP_nueva/api/routes/parqueo_reservas.js)

| Método     | Ruta Completa                            | Handler / Controlador | Autenticación y Validadores                         | Qué Consulta o Modifica                                                                                    | Caso de Uso / Soporte                                              |
| :--------- | :--------------------------------------- | :-------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **`GET`**  | `/api/parqueo_reservas`                  | `getItems`            | _Público_                                           | **Gestión del submódulo de parqueadero inteligente: reservas.**<br>_Tablas asociadas: `parqueo_reservas`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**  | `/api/parqueo_reservas/id/:id`           | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetReservas` | **Gestión del submódulo de parqueadero inteligente: reservas.**<br>_Tablas asociadas: `parqueo_reservas`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**  | `/api/parqueo_reservas/usuario/:usuario` | `getItemUsuario`      | `authMiddleware(["all"])`<br>`validatorGetUsuario`  | **Gestión del submódulo de parqueadero inteligente: reservas.**<br>_Tablas asociadas: `parqueo_reservas`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`** | `/api/parqueo_reservas/registrar`        | `createItem`          | `validatorCreateReservas`                           | **Gestión del submódulo de parqueadero inteligente: reservas.**<br>_Tablas asociadas: `parqueo_reservas`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`** | `/api/parqueo_reservas/temporizador`     | `temporizador`        | `authMiddleware(["all"])`                           | **Gestión del submódulo de parqueadero inteligente: reservas.**<br>_Tablas asociadas: `parqueo_reservas`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`** | `/api/parqueo_reservas/updateEstado`     | `updateItem`          | `authMiddleware(["all"])`<br>`validatorGetReservas` | **Gestión del submódulo de parqueadero inteligente: reservas.**<br>_Tablas asociadas: `parqueo_reservas`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`** | `/api/parqueo_reservas/updateVehiculo`   | `updateItemVehiculo`  | `authMiddleware(["all"])`<br>`validatorVehiculo`    | **Gestión del submódulo de parqueadero inteligente: reservas.**<br>_Tablas asociadas: `parqueo_reservas`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`** | `/api/parqueo_reservas/updateVehiculo`   | `updateItemVehiculo`  | `authMiddleware(["all"])`<br>`validatorVehiculo`    | **Gestión del submódulo de parqueadero inteligente: reservas.**<br>_Tablas asociadas: `parqueo_reservas`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |

---

### 📦 Módulo: `parqueo_horarios`

- **Prefijo de Ruta Base:** `/api/parqueo_horarios`
- **Archivo de Rutas:** [`api/routes/parqueo_horarios.js`](file:///Users/user/Projects/APP_nueva/api/routes/parqueo_horarios.js)

| Método     | Ruta Completa                                    | Handler / Controlador | Autenticación y Validadores                            | Qué Consulta o Modifica                                                                                    | Caso de Uso / Soporte                                              |
| :--------- | :----------------------------------------------- | :-------------------- | :----------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **`GET`**  | `/api/parqueo_horarios`                          | `getItems`            | `authMiddleware(["all"])`                              | **Gestión del submódulo de parqueadero inteligente: horarios.**<br>_Tablas asociadas: `parqueo_horarios`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**  | `/api/parqueo_horarios/id/:hor_id`               | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetHorarios`    | **Gestión del submódulo de parqueadero inteligente: horarios.**<br>_Tablas asociadas: `parqueo_horarios`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`** | `/api/parqueo_horarios/registrar`                | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateHorarios` | **Gestión del submódulo de parqueadero inteligente: horarios.**<br>_Tablas asociadas: `parqueo_horarios`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**  | `/api/parqueo_horarios/parqueadero/:parqueadero` | `getItemParqueadero`  | `authMiddleware(["all"])`<br>`validatorGetNombre`      | **Gestión del submódulo de parqueadero inteligente: horarios.**<br>_Tablas asociadas: `parqueo_horarios`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |

---

### 📦 Módulo: `parqueo_feedback`

- **Prefijo de Ruta Base:** `/api/parqueo_feedback`
- **Archivo de Rutas:** [`api/routes/parqueo_feedback.js`](file:///Users/user/Projects/APP_nueva/api/routes/parqueo_feedback.js)

| Método     | Ruta Completa                          | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                                    | Caso de Uso / Soporte                                              |
| :--------- | :------------------------------------- | :-------------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **`GET`**  | `/api/parqueo_feedback`                | `getItems`            | `authMiddleware(["all"])`                      | **Gestión del submódulo de parqueadero inteligente: feedback.**<br>_Tablas asociadas: `parqueo_feedback`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**  | `/api/parqueo_feedback/commentsFilter` | `getItemsToDate`      | `authMiddleware(["all"])`                      | **Gestión del submódulo de parqueadero inteligente: feedback.**<br>_Tablas asociadas: `parqueo_feedback`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**  | `/api/parqueo_feedback/id/:com_id`     | `getItem`             | `authMiddleware(["all"])`<br>`validatorGet`    | **Gestión del submódulo de parqueadero inteligente: feedback.**<br>_Tablas asociadas: `parqueo_feedback`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`** | `/api/parqueo_feedback/registrar`      | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate` | **Gestión del submódulo de parqueadero inteligente: feedback.**<br>_Tablas asociadas: `parqueo_feedback`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |

---

### 📦 Módulo: `parqueo_tyc`

- **Prefijo de Ruta Base:** `/api/parqueo_tyc`
- **Archivo de Rutas:** [`api/routes/parqueo_tyc.js`](file:///Users/user/Projects/APP_nueva/api/routes/parqueo_tyc.js)

| Método      | Ruta Completa                                             | Handler / Controlador               | Autenticación y Validadores                                 | Qué Consulta o Modifica                                                                          | Caso de Uso / Soporte                                              |
| :---------- | :-------------------------------------------------------- | :---------------------------------- | :---------------------------------------------------------- | :----------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **`GET`**   | `/api/parqueo_tyc`                                        | `getItems`                          | `authMiddleware(["all"])`                                   | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_tyc/usuario/:usuario`                       | `getItem`                           | `authMiddleware(["all"])`<br>`validatorID`                  | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**  | `/api/parqueo_tyc/registrar`                              | `createItem`                        | `authMiddleware(["all"])`<br>`validatorCreate`              | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**  | `/api/parqueo_tyc/update_vel`                             | `updateItem`                        | `authMiddleware(["all"])`<br>`validator_update`             | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_tyc/usuario-electrohub/:idOrganizacion`     | `getUsuarioElectroHubByEmpresa`     | `authMiddleware(["all"])`<br>`validatorGetOrganizacion`     | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_tyc/movimientos-electrohub/:idOrganizacion` | `getMovimientosElectroHubByEmpresa` | `authMiddleware(["all"])`<br>`validatorGetOrganizacion`     | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`PATCH`** | `/api/parqueo_tyc/update-usuario/:usuario`                | `updateUsuarioElectroHub`           | `authMiddleware(["all"])`<br>`validatorUpdateUsuario`       | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**  | `/api/parqueo_tyc/recargar-saldo`                         | `recargarSaldoUsuario`              | `authMiddleware(["all"])`<br>`validatorRecargarSaldo`       | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**  | `/api/parqueo_tyc/update_saldo`                           | `updateItem_saldo`                  | `authMiddleware(["all"])`<br>`validator_update_saldo`       | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`POST`**  | `/api/parqueo_tyc/massive-update-saldos`                  | `processMassiveUpdateSaldos`        | `authMiddleware(["all"])`<br>`validatorMassiveUpdateSaldos` | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_tyc/historial-parqueos/:documento`          | `getHistorialParqueosUsuario`       | `authMiddleware(["all"])`                                   | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |
| **`GET`**   | `/api/parqueo_tyc/vehiculos-usuario/:documento`           | `getVehiculosUsuario`               | `authMiddleware(["all"])`                                   | **Gestión del submódulo de parqueadero inteligente: tyc.**<br>_Tablas asociadas: `parqueo_tyc`._ | 💡 Soporte para usuarios en parqueaderos de bicicletas y patinetas. |

---

## 🗂️ 5. Vehículos Particulares (VP) y Movilidad Propia

> Registro de bicicletas, patinetas y vehículos propios de colaboradores para control de accesos, parqueaderos privados y registro de viajes personales.

### 📦 Módulo: `vp_viajes`

- **Prefijo de Ruta Base:** `/api/vp_viajes`
- **Archivo de Rutas:** [`api/routes/vp_viajes.js`](file:///Users/user/Projects/APP_nueva/api/routes/vp_viajes.js)

| Método     | Ruta Completa                                | Handler / Controlador  | Autenticación y Validadores                                | Qué Consulta o Modifica                                                                                  | Caso de Uso / Soporte                                                        |
| :--------- | :------------------------------------------- | :--------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **`GET`**  | `/api/vp_viajes`                             | `getItems`             | `authMiddleware(["all"])`                                  | **Gestión de vehículos particulares y movilidad propia: vp_viajes.**<br>_Tablas asociadas: `vp_viajes`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_viajes/tripsFilter`                 | `getItemsFilter`       | `authMiddleware(["all"])`                                  | **Gestión de vehículos particulares y movilidad propia: vp_viajes.**<br>_Tablas asociadas: `vp_viajes`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_viajes/id/:via_usuario`             | `getItem`              | `authMiddleware(["all"])`<br>`validatorGetUsuario`         | **Gestión de vehículos particulares y movilidad propia: vp_viajes.**<br>_Tablas asociadas: `vp_viajes`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_viajes/usuario/:via_usuario`        | `getItemUsuario`       | `authMiddleware(["all"])`<br>`validatorGetUsuario`         | **Gestión de vehículos particulares y movilidad propia: vp_viajes.**<br>_Tablas asociadas: `vp_viajes`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_viajes/viajeActivo/:via_usuario`    | `getItemViajeActivo`   | `authMiddleware(["all"])`<br>`validatorGetUsuario`         | **Gestión de vehículos particulares y movilidad propia: vp_viajes.**<br>_Tablas asociadas: `vp_viajes`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_viajes/id/:via_id/usu/:via_usuario` | `getIValidateVehiculo` | `authMiddleware(["all"])`<br>`validatorGetVehiculoUsuario` | **Gestión de vehículos particulares y movilidad propia: vp_viajes.**<br>_Tablas asociadas: `vp_viajes`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_viajes/registrar`                   | `createItem`           | `authMiddleware(["all"])`<br>`validatorCreate`             | **Gestión de vehículos particulares y movilidad propia: vp_viajes.**<br>_Tablas asociadas: `vp_viajes`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_viajes/updateEstado`                | `updateItemState`      | `authMiddleware(["all"])`<br>`validatorGet`                | **Gestión de vehículos particulares y movilidad propia: vp_viajes.**<br>_Tablas asociadas: `vp_viajes`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_viajes/updateTrip`                  | `updateItemTrip`       | `authMiddleware(["all"])`<br>`validatorGetTrip`            | **Gestión de vehículos particulares y movilidad propia: vp_viajes.**<br>_Tablas asociadas: `vp_viajes`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |

---

### 📦 Módulo: `vp_vehiculos_usuario`

- **Prefijo de Ruta Base:** `/api/vp_vehiculos_usuario`
- **Archivo de Rutas:** [`api/routes/vp_vehiculos_usuario.js`](file:///Users/user/Projects/APP_nueva/api/routes/vp_vehiculos_usuario.js)

| Método     | Ruta Completa                                           | Handler / Controlador    | Autenticación y Validadores                                | Qué Consulta o Modifica                                                                                                        | Caso de Uso / Soporte                                                        |
| :--------- | :------------------------------------------------------ | :----------------------- | :--------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **`GET`**  | `/api/vp_vehiculos_usuario`                             | `getItems`               | `authMiddleware(["all"])`                                  | **Gestión de vehículos particulares y movilidad propia: vp_vehiculos_usuario.**<br>_Tablas asociadas: `vp_vehiculos_usuario`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_vehiculos_usuario/id/:vus_id`                  | `getItem`                | `authMiddleware(["all"])`<br>`validatorGet`                | **Gestión de vehículos particulares y movilidad propia: vp_vehiculos_usuario.**<br>_Tablas asociadas: `vp_vehiculos_usuario`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_vehiculos_usuario/usuario/:vus_usuario`        | `getItemUsuario`         | `authMiddleware(["all"])`<br>`validatorGetUsuario`         | **Gestión de vehículos particulares y movilidad propia: vp_vehiculos_usuario.**<br>_Tablas asociadas: `vp_vehiculos_usuario`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_vehiculos_usuario/id/:vus_id/usu/:vus_usuario` | `getIValidateVehiculo`   | `authMiddleware(["all"])`<br>`validatorGetVehiculoUsuario` | **Gestión de vehículos particulares y movilidad propia: vp_vehiculos_usuario.**<br>_Tablas asociadas: `vp_vehiculos_usuario`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_vehiculos_usuario/registrar`                   | `createItem`             | `authMiddleware(["all"])`<br>`validatorCreate`             | **Gestión de vehículos particulares y movilidad propia: vp_vehiculos_usuario.**<br>_Tablas asociadas: `vp_vehiculos_usuario`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_vehiculos_usuario/updateEstado`                | `updateItem`             | `authMiddleware(["all"])`<br>`validatorGet`                | **Gestión de vehículos particulares y movilidad propia: vp_vehiculos_usuario.**<br>_Tablas asociadas: `vp_vehiculos_usuario`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_vehiculos_usuario/updateVehiculo`              | `updateItemVehiculo`     | `authMiddleware(["all"])`<br>`validatorVehiculo`           | **Gestión de vehículos particulares y movilidad propia: vp_vehiculos_usuario.**<br>_Tablas asociadas: `vp_vehiculos_usuario`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_vehiculos_usuario/vehiculos-usuario`           | `getVehiculosUsuario`    | `authMiddleware(["all"])`                                  | **Gestión de vehículos particulares y movilidad propia: vp_vehiculos_usuario.**<br>_Tablas asociadas: `vp_vehiculos_usuario`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_vehiculos_usuario/empresa/:empresaId`          | `getVehiculosPorEmpresa` | `authMiddleware(["all"])`<br>`validatorEmpresa`            | **Gestión de vehículos particulares y movilidad propia: vp_vehiculos_usuario.**<br>_Tablas asociadas: `vp_vehiculos_usuario`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |

---

### 📦 Módulo: `vp_tipo_vehiculos`

- **Prefijo de Ruta Base:** `/api/vp_tipo_vehiculos`
- **Archivo de Rutas:** [`api/routes/vp_tipo_vehiculos.js`](file:///Users/user/Projects/APP_nueva/api/routes/vp_tipo_vehiculos.js)

| Método     | Ruta Completa                       | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                                                  | Caso de Uso / Soporte                                                        |
| :--------- | :---------------------------------- | :-------------------- | :--------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **`GET`**  | `/api/vp_tipo_vehiculos`            | `getItems`            | `authMiddleware(["all"])`                      | **Gestión de vehículos particulares y movilidad propia: vp_tipo_vehiculos.**<br>_Tablas asociadas: `vp_tipo_vehiculos`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_tipo_vehiculos/id/:tip_id` | `getItem`             | `authMiddleware(["all"])`<br>`validatorGet`    | **Gestión de vehículos particulares y movilidad propia: vp_tipo_vehiculos.**<br>_Tablas asociadas: `vp_tipo_vehiculos`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_tipo_vehiculos/registrar`  | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate` | **Gestión de vehículos particulares y movilidad propia: vp_tipo_vehiculos.**<br>_Tablas asociadas: `vp_tipo_vehiculos`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |

---

### 📦 Módulo: `vp_comentarios`

- **Prefijo de Ruta Base:** `/api/vp_comentarios`
- **Archivo de Rutas:** [`api/routes/vp_comentarios.js`](file:///Users/user/Projects/APP_nueva/api/routes/vp_comentarios.js)

| Método     | Ruta Completa                             | Handler / Controlador | Autenticación y Validadores                     | Qué Consulta o Modifica                                                                                            | Caso de Uso / Soporte                                                        |
| :--------- | :---------------------------------------- | :-------------------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **`GET`**  | `/api/vp_comentarios`                     | `getItems`            | `authMiddleware(["all"])`                       | **Gestión de vehículos particulares y movilidad propia: vp_comentarios.**<br>_Tablas asociadas: `vp_comentarios`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`GET`**  | `/api/vp_comentarios/usuario/:vp_usuario` | `getItemUsuario`      | `authMiddleware(["all"])`<br>`validatorUsuario` | **Gestión de vehículos particulares y movilidad propia: vp_comentarios.**<br>_Tablas asociadas: `vp_comentarios`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_comentarios/registrar`           | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate`  | **Gestión de vehículos particulares y movilidad propia: vp_comentarios.**<br>_Tablas asociadas: `vp_comentarios`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_comentarios/updateEstado`        | `updateId`            | `authMiddleware(["all"])`<br>`validatorId`      | **Gestión de vehículos particulares y movilidad propia: vp_comentarios.**<br>_Tablas asociadas: `vp_comentarios`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |
| **`POST`** | `/api/vp_comentarios/updateTrip`          | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorId`      | **Gestión de vehículos particulares y movilidad propia: vp_comentarios.**<br>_Tablas asociadas: `vp_comentarios`._ | 💡 Control de registros y viajes en bicicletas/patinetas propias del usuario. |

---

### 📦 Módulo: `registroVehiculoParticular`

- **Prefijo de Ruta Base:** `/api/registroVehiculoParticular`
- **Archivo de Rutas:** [`api/routes/registroVehiculoParticular.js`](file:///Users/user/Projects/APP_nueva/api/routes/registroVehiculoParticular.js)

| Método       | Ruta Completa                                   | Handler / Controlador | Autenticación y Validadores                                              | Qué Consulta o Modifica                                                                                                 | Caso de Uso / Soporte                        |
| :----------- | :---------------------------------------------- | :-------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------- |
| **`GET`**    | `/api/registroVehiculoParticular`               | `getItems`            | `authMiddleware(["all"])`                                                | **Consulta / Obtiene registros del módulo registroVehiculoParticular.**<br>_Tabla/Modelo `registroVehiculoParticular`._ | 💡 Operaciones de registroVehiculoParticular. |
| **`GET`**    | `/api/registroVehiculoParticular/id/:id`        | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetRegistroVehiculoParticular`    | **Consulta / Obtiene registros del módulo registroVehiculoParticular.**<br>_Tabla/Modelo `registroVehiculoParticular`._ | 💡 Operaciones de registroVehiculoParticular. |
| **`GET`**    | `/api/registroVehiculoParticular/buscarDoc/doc` | `getItemBuscar`       | `authMiddleware(["all"])`<br>`validatorGetRegistroVehiculoParticular`    | **Consulta / Obtiene registros del módulo registroVehiculoParticular.**<br>_Tabla/Modelo `registroVehiculoParticular`._ | 💡 Operaciones de registroVehiculoParticular. |
| **`POST`**   | `/api/registroVehiculoParticular/register`      | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateRegistroVehiculoParticular` | **Crea / Registra registros del módulo registroVehiculoParticular.**<br>_Tabla/Modelo `registroVehiculoParticular`._    | 💡 Operaciones de registroVehiculoParticular. |
| **`DELETE`** | `/api/registroVehiculoParticular/:id`           | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorGetRegistroVehiculoParticular`    | **Elimina registros del módulo registroVehiculoParticular.**<br>_Tabla/Modelo `registroVehiculoParticular`._            | 💡 Operaciones de registroVehiculoParticular. |

---

### 📦 Módulo: `tipoVehiculosParticulares`

- **Prefijo de Ruta Base:** `/api/tipoVehiculosParticulares`
- **Archivo de Rutas:** [`api/routes/tipoVehiculosParticulares.js`](file:///Users/user/Projects/APP_nueva/api/routes/tipoVehiculosParticulares.js)

| Método       | Ruta Completa                             | Handler / Controlador | Autenticación y Validadores                                          | Qué Consulta o Modifica                                                                                               | Caso de Uso / Soporte                       |
| :----------- | :---------------------------------------- | :-------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ |
| **`GET`**    | `/api/tipoVehiculosParticulares`          | `getItems`            | `authMiddleware(["all"])`                                            | **Consulta / Obtiene registros del módulo tipoVehiculosParticulares.**<br>_Tabla/Modelo `tipoVehiculosParticulares`._ | 💡 Operaciones de tipoVehiculosParticulares. |
| **`GET`**    | `/api/tipoVehiculosParticulares/id/:id`   | `getItem`             | `validatorGetTipoVehiculoParticular`<br>`authMiddleware(["all"])`    | **Consulta / Obtiene registros del módulo tipoVehiculosParticulares.**<br>_Tabla/Modelo `tipoVehiculosParticulares`._ | 💡 Operaciones de tipoVehiculosParticulares. |
| **`POST`**   | `/api/tipoVehiculosParticulares/register` | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateTipoVehiculoParticular` | **Crea / Registra registros del módulo tipoVehiculosParticulares.**<br>_Tabla/Modelo `tipoVehiculosParticulares`._    | 💡 Operaciones de tipoVehiculosParticulares. |
| **`DELETE`** | `/api/tipoVehiculosParticulares/:id`      | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorGetTipoVehiculoParticular`    | **Elimina registros del módulo tipoVehiculosParticulares.**<br>_Tabla/Modelo `tipoVehiculosParticulares`._            | 💡 Operaciones de tipoVehiculosParticulares. |

---

## 🗂️ 6. Gamificación, Desafíos, Logros, Inducción y Capacitación

> Módulos de incentivos, retos por huella de carbono, insignias empresariales, cuestionarios de seguridad vial (Brain), encuestas de impacto y evaluaciones teórico-prácticas.

### 📦 Módulo: `logros`

- **Prefijo de Ruta Base:** `/api/logros`
- **Archivo de Rutas:** [`api/routes/logros.js`](file:///Users/user/Projects/APP_nueva/api/routes/logros.js)

| Método      | Ruta Completa                | Handler / Controlador | Autenticación y Validadores                          | Qué Consulta o Modifica                                                            | Caso de Uso / Soporte    |
| :---------- | :--------------------------- | :-------------------- | :--------------------------------------------------- | :--------------------------------------------------------------------------------- | :----------------------- |
| **`GET`**   | `/api/logros`                | `getItems`            | `authMiddleware(["all"])`                            | **Consulta / Obtiene registros del módulo logros.**<br>_Tabla/Modelo `logros`._    | 💡 Operaciones de logros. |
| **`GET`**   | `/api/logros/id/:id_logro`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetLogro`     | **Consulta / Obtiene registros del módulo logros.**<br>_Tabla/Modelo `logros`._    | 💡 Operaciones de logros. |
| **`GET`**   | `/api/logros/estado/:estado` | `getItemByState`      | `authMiddleware(["all"])`<br>`validatorGetEstado`    | **Consulta / Obtiene registros del módulo logros.**<br>_Tabla/Modelo `logros`._    | 💡 Operaciones de logros. |
| **`POST`**  | `/api/logros/updateEstado`   | `validatorGetLogro`   | `authMiddleware(["all"])`                            | **Crea / Registra registros del módulo logros.**<br>_Tabla/Modelo `logros`._       | 💡 Operaciones de logros. |
| **`PATCH`** | `/api/logros/:id_logro`      | `patchItem`           | `authMiddleware(["all"])`<br>`validatorUpdateLogros` | **Modifica parcialmente registros del módulo logros.**<br>_Tabla/Modelo `logros`._ | 💡 Operaciones de logros. |
| **`PUT`**   | `/api/logros/updateState`    | `validatorGetLogro`   | `authMiddleware(["all"])`                            | **Actualiza registros del módulo logros.**<br>_Tabla/Modelo `logros`._             | 💡 Operaciones de logros. |
| **`POST`**  | `/api/logros/registrar`      | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateLogro`  | **Crea / Registra registros del módulo logros.**<br>_Tabla/Modelo `logros`._       | 💡 Operaciones de logros. |

---

### 📦 Módulo: `progreso_logros`

- **Prefijo de Ruta Base:** `/api/progreso_logros`
- **Archivo de Rutas:** [`api/routes/progreso_logros.js`](file:///Users/user/Projects/APP_nueva/api/routes/progreso_logros.js)

| Método      | Ruta Completa                                              | Handler / Controlador       | Autenticación y Validadores                                 | Qué Consulta o Modifica                                                                              | Caso de Uso / Soporte             |
| :---------- | :--------------------------------------------------------- | :-------------------------- | :---------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :-------------------------------- |
| **`GET`**   | `/api/progreso_logros`                                     | `getItems`                  | `authMiddleware(["all"])`                                   | **Consulta / Obtiene registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._    | 💡 Operaciones de progreso_logros. |
| **`GET`**   | `/api/progreso_logros/id/:id`                              | `getItem`                   | `authMiddleware(["all"])`<br>`validatorGetProgresoLogro`    | **Consulta / Obtiene registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._    | 💡 Operaciones de progreso_logros. |
| **`GET`**   | `/api/progreso_logros/usuario_id/:usuario_id`              | `getItemUsuario`            | `authMiddleware(["all"])`<br>`validatorGetUsuario`          | **Consulta / Obtiene registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._    | 💡 Operaciones de progreso_logros. |
| **`POST`**  | `/api/progreso_logros/logro_progreso`                      | `getLogroProgreso`          | `validatorGetPro_logro`                                     | **Crea / Registra registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._       | 💡 Operaciones de progreso_logros. |
| **`GET`**   | `/api/progreso_logros/estado/:estado`                      | `getItemByState`            | `authMiddleware(["all"])`<br>`validatorGetEstado`           | **Consulta / Obtiene registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._    | 💡 Operaciones de progreso_logros. |
| **`POST`**  | `/api/progreso_logros/registrar`                           | `createItem`                | `authMiddleware(["all"])`<br>`validatorCreateProgresoLogro` | **Crea / Registra registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._       | 💡 Operaciones de progreso_logros. |
| **`GET`**   | `/api/progreso_logros/empresa/:empresa`                    | `getItemsByEmpresa`         | `authMiddleware(["all"])`<br>`validatorGetEmp`              | **Consulta / Obtiene registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._    | 💡 Operaciones de progreso_logros. |
| **`PATCH`** | `/api/progreso_logros/:id`                                 | `patchItem`                 | `validatorGetPro_logro_update`                              | **Modifica parcialmente registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._ | 💡 Operaciones de progreso_logros. |
| **`PATCH`** | `/api/progreso_logros/usuario/:usuario_id/logro/:logro_id` | `patchLogroProgreso`        | `validatorGetProgresoLogro`                                 | **Modifica parcialmente registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._ | 💡 Operaciones de progreso_logros. |
| **`PUT`**   | `/api/progreso_logros/updateState`                         | `validatorGetProgresoLogro` | `authMiddleware(["all"])`                                   | **Actualiza registros del módulo progreso_logros.**<br>_Tabla/Modelo `progreso_logros`._             | 💡 Operaciones de progreso_logros. |

---

### 📦 Módulo: `empresa_logro`

- **Prefijo de Ruta Base:** `/api/empresa_logro`
- **Archivo de Rutas:** [`api/routes/empresa_logro.js`](file:///Users/user/Projects/APP_nueva/api/routes/empresa_logro.js)

| Método      | Ruta Completa                                          | Handler / Controlador       | Autenticación y Validadores                          | Qué Consulta o Modifica                                                                          | Caso de Uso / Soporte           |
| :---------- | :----------------------------------------------------- | :-------------------------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------------- | :------------------------------ |
| **`GET`**   | `/api/empresa_logro`                                   | `getItems`                  | `authMiddleware(["all"])`                            | **Consulta / Obtiene registros del módulo empresa_logro.**<br>_Tabla/Modelo `empresa_logro`._    | 💡 Operaciones de empresa_logro. |
| **`GET`**   | `/api/empresa_logro/logro/:idLogro/empresa/:idEmpresa` | `getItem`                   | `authMiddleware(["all"])`<br>`validatorGetLogro`     | **Consulta / Obtiene registros del módulo empresa_logro.**<br>_Tabla/Modelo `empresa_logro`._    | 💡 Operaciones de empresa_logro. |
| **`GET`**   | `/api/empresa_logro/empresa/:idEmpresa`                | `getItemtoEmpresa`          | `validatorGetLogroEmp`                               | **Consulta / Obtiene registros del módulo empresa_logro.**<br>_Tabla/Modelo `empresa_logro`._    | 💡 Operaciones de empresa_logro. |
| **`GET`**   | `/api/empresa_logro/estado/:estado`                    | `getItemByState`            | `authMiddleware(["all"])`<br>`validatorGetEstado`    | **Consulta / Obtiene registros del módulo empresa_logro.**<br>_Tabla/Modelo `empresa_logro`._    | 💡 Operaciones de empresa_logro. |
| **`POST`**  | `/api/empresa_logro/updateEstado`                      | `validatorGetLogro`         | `authMiddleware(["all"])`                            | **Crea / Registra registros del módulo empresa_logro.**<br>_Tabla/Modelo `empresa_logro`._       | 💡 Operaciones de empresa_logro. |
| **`PATCH`** | `/api/empresa_logro/:id`                               | `patchItem`                 | `authMiddleware(["all"])`<br>`validatorUpdateLogros` | **Modifica parcialmente registros del módulo empresa_logro.**<br>_Tabla/Modelo `empresa_logro`._ | 💡 Operaciones de empresa_logro. |
| **`PUT`**   | `/api/empresa_logro/updateState`                       | `validatorGetLogro`         | `authMiddleware(["all"])`                            | **Actualiza registros del módulo empresa_logro.**<br>_Tabla/Modelo `empresa_logro`._             | 💡 Operaciones de empresa_logro. |
| **`POST`**  | `/api/empresa_logro/registrar`                         | `createItem`                | `authMiddleware(["all"])`<br>`validatorCreateItem`   | **Crea / Registra registros del módulo empresa_logro.**<br>_Tabla/Modelo `empresa_logro`._       | 💡 Operaciones de empresa_logro. |
| **`GET`**   | `/api/empresa_logro/empresa/:idEmpresa/dashboard`      | `getItemtoEmpresaWithLogro` | `authMiddleware(["all"])`<br>`validatorGetLogroEmp`  | **Consulta / Obtiene registros del módulo empresa_logro.**<br>_Tabla/Modelo `empresa_logro`._    | 💡 Operaciones de empresa_logro. |

---

### 📦 Módulo: `desafios`

- **Prefijo de Ruta Base:** `/api/desafios`
- **Archivo de Rutas:** [`api/routes/desafios.js`](file:///Users/user/Projects/APP_nueva/api/routes/desafios.js)

| Método      | Ruta Completa                  | Handler / Controlador | Autenticación y Validadores                        | Qué Consulta o Modifica                                                                | Caso de Uso / Soporte      |
| :---------- | :----------------------------- | :-------------------- | :------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------- |
| **`GET`**   | `/api/desafios`                | `getItems`            | `authMiddleware(["all"])`                          | **Consulta / Obtiene registros del módulo desafios.**<br>_Tabla/Modelo `desafios`._    | 💡 Operaciones de desafios. |
| **`GET`**   | `/api/desafios/id/:id_desafio` | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetDesafio` | **Consulta / Obtiene registros del módulo desafios.**<br>_Tabla/Modelo `desafios`._    | 💡 Operaciones de desafios. |
| **`GET`**   | `/api/desafios/estado/:estado` | `getItemByState`      | `authMiddleware(["all"])`<br>`validatorGetEstado`  | **Consulta / Obtiene registros del módulo desafios.**<br>_Tabla/Modelo `desafios`._    | 💡 Operaciones de desafios. |
| **`PUT`**   | `/api/desafios/updateEstado`   | `updateItemState`     | `authMiddleware(["all"])`                          | **Actualiza registros del módulo desafios.**<br>_Tabla/Modelo `desafios`._             | 💡 Operaciones de desafios. |
| **`PATCH`** | `/api/desafios/:id_desafio`    | `patchItem`           | `authMiddleware(["all"])`<br>`validatorGetDesafio` | **Modifica parcialmente registros del módulo desafios.**<br>_Tabla/Modelo `desafios`._ | 💡 Operaciones de desafios. |
| **`PUT`**   | `/api/desafios/updateState`    | `validatorGetDesafio` | `authMiddleware(["all"])`                          | **Actualiza registros del módulo desafios.**<br>_Tabla/Modelo `desafios`._             | 💡 Operaciones de desafios. |

---

### 📦 Módulo: `progreso_desafios`

- **Prefijo de Ruta Base:** `/api/progreso_desafios`
- **Archivo de Rutas:** [`api/routes/progreso_desafios.js`](file:///Users/user/Projects/APP_nueva/api/routes/progreso_desafios.js)

| Método      | Ruta Completa                                   | Handler / Controlador         | Autenticación y Validadores                                   | Qué Consulta o Modifica                                                                                  | Caso de Uso / Soporte               |
| :---------- | :---------------------------------------------- | :---------------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| **`GET`**   | `/api/progreso_desafios`                        | `getItems`                    | `authMiddleware(["all"])`                                     | **Consulta / Obtiene registros del módulo progreso_desafios.**<br>_Tabla/Modelo `progreso_desafios`._    | 💡 Operaciones de progreso_desafios. |
| **`GET`**   | `/api/progreso_desafios/id/:id`                 | `getItem`                     | `authMiddleware(["all"])`<br>`validatorGetProgresoDesafio`    | **Consulta / Obtiene registros del módulo progreso_desafios.**<br>_Tabla/Modelo `progreso_desafios`._    | 💡 Operaciones de progreso_desafios. |
| **`GET`**   | `/api/progreso_desafios/usuario_id/:usuario_id` | `getItemUsuario`              | `authMiddleware(["all"])`<br>`validatorGetUsuario`            | **Consulta / Obtiene registros del módulo progreso_desafios.**<br>_Tabla/Modelo `progreso_desafios`._    | 💡 Operaciones de progreso_desafios. |
| **`GET`**   | `/api/progreso_desafios/estado/:estado`         | `getItemByState`              | `authMiddleware(["all"])`<br>`validatorGetEstado`             | **Consulta / Obtiene registros del módulo progreso_desafios.**<br>_Tabla/Modelo `progreso_desafios`._    | 💡 Operaciones de progreso_desafios. |
| **`POST`**  | `/api/progreso_desafios/registrar`              | `createItem`                  | `authMiddleware(["all"])`<br>`validatorCreateProgresoDesafio` | **Crea / Registra registros del módulo progreso_desafios.**<br>_Tabla/Modelo `progreso_desafios`._       | 💡 Operaciones de progreso_desafios. |
| **`PATCH`** | `/api/progreso_desafios/:id_logro`              | `patchItem`                   | `authMiddleware(["all"])`<br>`validatorGetProgresoDesafio`    | **Modifica parcialmente registros del módulo progreso_desafios.**<br>_Tabla/Modelo `progreso_desafios`._ | 💡 Operaciones de progreso_desafios. |
| **`PUT`**   | `/api/progreso_desafios/updateState`            | `validatorGetProgresoDesafio` | `authMiddleware(["all"])`                                     | **Actualiza registros del módulo progreso_desafios.**<br>_Tabla/Modelo `progreso_desafios`._             | 💡 Operaciones de progreso_desafios. |

---

### 📦 Módulo: `productos`

- **Prefijo de Ruta Base:** `/api/productos`
- **Archivo de Rutas:** [`api/routes/productos.js`](file:///Users/user/Projects/APP_nueva/api/routes/productos.js)

| Método      | Ruta Completa                     | Handler / Controlador | Autenticación y Validadores                             | Qué Consulta o Modifica                                                                  | Caso de Uso / Soporte       |
| :---------- | :-------------------------------- | :-------------------- | :------------------------------------------------------ | :--------------------------------------------------------------------------------------- | :-------------------------- |
| **`GET`**   | `/api/productos`                  | `getItems`            | `authMiddleware(["all"])`                               | **Consulta / Obtiene registros del módulo productos.**<br>_Tabla/Modelo `productos`._    | 💡 Operaciones de productos. |
| **`GET`**   | `/api/productos/id/:id_producto`  | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetProducto`     | **Consulta / Obtiene registros del módulo productos.**<br>_Tabla/Modelo `productos`._    | 💡 Operaciones de productos. |
| **`GET`**   | `/api/productos/empresa/:empresa` | `getItemByEmpresa`    | `validatorGetEmp`                                       | **Consulta / Obtiene registros del módulo productos.**<br>_Tabla/Modelo `productos`._    | 💡 Operaciones de productos. |
| **`GET`**   | `/api/productos/nombre/:nombre`   | `getItemNombre`       | `authMiddleware(["all"])`<br>`validatorGetNombre`       | **Consulta / Obtiene registros del módulo productos.**<br>_Tabla/Modelo `productos`._    | 💡 Operaciones de productos. |
| **`POST`**  | `/api/productos/registrar`        | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateProductos` | **Crea / Registra registros del módulo productos.**<br>_Tabla/Modelo `productos`._       | 💡 Operaciones de productos. |
| **`POST`**  | `/api/productos/updateEstado`     | `updateItem`          | `authMiddleware(["all"])`<br>`validatorGetProducto`     | **Crea / Registra registros del módulo productos.**<br>_Tabla/Modelo `productos`._       | 💡 Operaciones de productos. |
| **`PATCH`** | `/api/productos/:id_producto`     | `patchItem`           | `authMiddleware(["all"])`<br>`validatorPatchProducto`   | **Modifica parcialmente registros del módulo productos.**<br>_Tabla/Modelo `productos`._ | 💡 Operaciones de productos. |

---

### 📦 Módulo: `preguntasBrain`

- **Prefijo de Ruta Base:** `/api/preguntasBrain`
- **Archivo de Rutas:** [`api/routes/preguntasBrain.js`](file:///Users/user/Projects/APP_nueva/api/routes/preguntasBrain.js)

| Método       | Ruta Completa                   | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                            | Caso de Uso / Soporte            |
| :----------- | :------------------------------ | :-------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------- |
| **`GET`**    | `/api/preguntasBrain`           | `getItems`            | `authMiddleware(["all"])`                      | **Consulta / Obtiene registros del módulo preguntasBrain.**<br>_Tabla/Modelo `preguntasBrain`._    | 💡 Operaciones de preguntasBrain. |
| **`GET`**    | `/api/preguntasBrain/id/:_id`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorID`     | **Consulta / Obtiene registros del módulo preguntasBrain.**<br>_Tabla/Modelo `preguntasBrain`._    | 💡 Operaciones de preguntasBrain. |
| **`POST`**   | `/api/preguntasBrain/registrar` | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate` | **Crea / Registra registros del módulo preguntasBrain.**<br>_Tabla/Modelo `preguntasBrain`._       | 💡 Operaciones de preguntasBrain. |
| **`PATCH`**  | `/api/preguntasBrain/:_id`      | `patchItem`           | `authMiddleware(["all"])`<br>`validatorID`     | **Modifica parcialmente registros del módulo preguntasBrain.**<br>_Tabla/Modelo `preguntasBrain`._ | 💡 Operaciones de preguntasBrain. |
| **`DELETE`** | `/api/preguntasBrain/:_id`      | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorID`     | **Elimina registros del módulo preguntasBrain.**<br>_Tabla/Modelo `preguntasBrain`._               | 💡 Operaciones de preguntasBrain. |

---

### 📦 Módulo: `respuestasBrain`

- **Prefijo de Ruta Base:** `/api/respuestasBrain`
- **Archivo de Rutas:** [`api/routes/respuestasBrain.js`](file:///Users/user/Projects/APP_nueva/api/routes/respuestasBrain.js)

| Método       | Ruta Completa                    | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                              | Caso de Uso / Soporte             |
| :----------- | :------------------------------- | :-------------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :-------------------------------- |
| **`GET`**    | `/api/respuestasBrain`           | `getItems`            | `authMiddleware(["all"])`                      | **Consulta / Obtiene registros del módulo respuestasBrain.**<br>_Tabla/Modelo `respuestasBrain`._    | 💡 Operaciones de respuestasBrain. |
| **`GET`**    | `/api/respuestasBrain/id/:_id`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorID`     | **Consulta / Obtiene registros del módulo respuestasBrain.**<br>_Tabla/Modelo `respuestasBrain`._    | 💡 Operaciones de respuestasBrain. |
| **`POST`**   | `/api/respuestasBrain/registrar` | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate` | **Crea / Registra registros del módulo respuestasBrain.**<br>_Tabla/Modelo `respuestasBrain`._       | 💡 Operaciones de respuestasBrain. |
| **`PATCH`**  | `/api/respuestasBrain/:_id`      | `patchItem`           | `authMiddleware(["all"])`<br>`validatorID`     | **Modifica parcialmente registros del módulo respuestasBrain.**<br>_Tabla/Modelo `respuestasBrain`._ | 💡 Operaciones de respuestasBrain. |
| **`DELETE`** | `/api/respuestasBrain/:_id`      | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorID`     | **Elimina registros del módulo respuestasBrain.**<br>_Tabla/Modelo `respuestasBrain`._               | 💡 Operaciones de respuestasBrain. |

---

### 📦 Módulo: `tematica`

- **Prefijo de Ruta Base:** `/api/tematica`
- **Archivo de Rutas:** [`api/routes/tematica.js`](file:///Users/user/Projects/APP_nueva/api/routes/tematica.js)

| Método       | Ruta Completa             | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                | Caso de Uso / Soporte      |
| :----------- | :------------------------ | :-------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------- |
| **`GET`**    | `/api/tematica`           | `getItems`            | _Público_                                      | **Consulta / Obtiene registros del módulo tematica.**<br>_Tabla/Modelo `tematica`._    | 💡 Operaciones de tematica. |
| **`GET`**    | `/api/tematica/all`       | `getAllTematicas`     | `authMiddleware(["all"])`                      | **Consulta / Obtiene registros del módulo tematica.**<br>_Tabla/Modelo `tematica`._    | 💡 Operaciones de tematica. |
| **`GET`**    | `/api/tematica/id/:_id`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorID`     | **Consulta / Obtiene registros del módulo tematica.**<br>_Tabla/Modelo `tematica`._    | 💡 Operaciones de tematica. |
| **`POST`**   | `/api/tematica/registrar` | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate` | **Crea / Registra registros del módulo tematica.**<br>_Tabla/Modelo `tematica`._       | 💡 Operaciones de tematica. |
| **`PATCH`**  | `/api/tematica/:_id`      | `patchItem`           | `authMiddleware(["all"])`<br>`validatorID`     | **Modifica parcialmente registros del módulo tematica.**<br>_Tabla/Modelo `tematica`._ | 💡 Operaciones de tematica. |
| **`DELETE`** | `/api/tematica/:_id`      | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorID`     | **Elimina registros del módulo tematica.**<br>_Tabla/Modelo `tematica`._               | 💡 Operaciones de tematica. |

---

### 📦 Módulo: `introduccion-movilidad`

- **Prefijo de Ruta Base:** `/api/introduccion-movilidad`
- **Archivo de Rutas:** [`api/routes/introduccion-movilidad.js`](file:///Users/user/Projects/APP_nueva/api/routes/introduccion-movilidad.js)

| Método       | Ruta Completa                                                    | Handler / Controlador | Autenticación y Validadores | Qué Consulta o Modifica                                                                                         | Caso de Uso / Soporte                    |
| :----------- | :--------------------------------------------------------------- | :-------------------- | :-------------------------- | :-------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| **`GET`**    | `/api/introduccion-movilidad/modulos`                            | `getModulos`          | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._ | 💡 Operaciones de introduccion-movilidad. |
| **`GET`**    | `/api/introduccion-movilidad/modulos/:id`                        | `getModuloDetalle`    | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._ | 💡 Operaciones de introduccion-movilidad. |
| **`POST`**   | `/api/introduccion-movilidad/modulos/:id/finalizar`              | `finalizarModulo`     | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._    | 💡 Operaciones de introduccion-movilidad. |
| **`GET`**    | `/api/introduccion-movilidad/admin/modulos`                      | `getAdminModulos`     | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._ | 💡 Operaciones de introduccion-movilidad. |
| **`POST`**   | `/api/introduccion-movilidad/admin/modulos`                      | `crearModulo`         | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._    | 💡 Operaciones de introduccion-movilidad. |
| **`PUT`**    | `/api/introduccion-movilidad/admin/modulos/:id`                  | `actualizarModulo`    | `authMiddleware(["all"])`   | **Actualiza registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._          | 💡 Operaciones de introduccion-movilidad. |
| **`DELETE`** | `/api/introduccion-movilidad/admin/modulos/:id`                  | `eliminarModulo`      | `authMiddleware(["all"])`   | **Elimina registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._            | 💡 Operaciones de introduccion-movilidad. |
| **`GET`**    | `/api/introduccion-movilidad/admin/modulos/:id_modulo/preguntas` | `getAdminPreguntas`   | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._ | 💡 Operaciones de introduccion-movilidad. |
| **`POST`**   | `/api/introduccion-movilidad/admin/preguntas`                    | `crearPregunta`       | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._    | 💡 Operaciones de introduccion-movilidad. |
| **`PUT`**    | `/api/introduccion-movilidad/admin/preguntas/:id`                | `actualizarPregunta`  | `authMiddleware(["all"])`   | **Actualiza registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._          | 💡 Operaciones de introduccion-movilidad. |
| **`DELETE`** | `/api/introduccion-movilidad/admin/preguntas/:id`                | `eliminarPregunta`    | `authMiddleware(["all"])`   | **Elimina registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._            | 💡 Operaciones de introduccion-movilidad. |
| **`GET`**    | `/api/introduccion-movilidad/admin/reportes`                     | `getAdminReportes`    | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo introduccion-movilidad.**<br>_Tabla/Modelo `introduccion-movilidad`._ | 💡 Operaciones de introduccion-movilidad. |

---

### 📦 Módulo: `bc_teorica`

- **Prefijo de Ruta Base:** `/api/bc_teorica`
- **Archivo de Rutas:** [`api/routes/bc_teorica.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_teorica.js)

| Método     | Ruta Completa               | Handler / Controlador | Autenticación y Validadores | Qué Consulta o Modifica                                                                 | Caso de Uso / Soporte        |
| :--------- | :-------------------------- | :-------------------- | :-------------------------- | :-------------------------------------------------------------------------------------- | :--------------------------- |
| **`GET`**  | `/api/bc_teorica`           | `getItems`            | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_teorica.**<br>_Tabla/Modelo `bc_teorica`._ | 💡 Operaciones de bc_teorica. |
| **`GET`**  | `/api/bc_teorica/id/:_id`   | `getItem`             | _Público_                   | **Consulta / Obtiene registros del módulo bc_teorica.**<br>_Tabla/Modelo `bc_teorica`._ | 💡 Operaciones de bc_teorica. |
| **`POST`** | `/api/bc_teorica/registrar` | `createItem`          | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo bc_teorica.**<br>_Tabla/Modelo `bc_teorica`._    | 💡 Operaciones de bc_teorica. |

---

### 📦 Módulo: `bc_practica`

- **Prefijo de Ruta Base:** `/api/bc_practica`
- **Archivo de Rutas:** [`api/routes/bc_practica.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_practica.js)

| Método      | Ruta Completa                         | Handler / Controlador    | Autenticación y Validadores | Qué Consulta o Modifica                                                                      | Caso de Uso / Soporte         |
| :---------- | :------------------------------------ | :----------------------- | :-------------------------- | :------------------------------------------------------------------------------------------- | :---------------------------- |
| **`GET`**   | `/api/bc_practica`                    | `getItems`               | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_practica.**<br>_Tabla/Modelo `bc_practica`._    | 💡 Operaciones de bc_practica. |
| **`GET`**   | `/api/bc_practica/remove`             | `removeOne`              | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_practica.**<br>_Tabla/Modelo `bc_practica`._    | 💡 Operaciones de bc_practica. |
| **`GET`**   | `/api/bc_practica/add`                | `addOne`                 | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_practica.**<br>_Tabla/Modelo `bc_practica`._    | 💡 Operaciones de bc_practica. |
| **`GET`**   | `/api/bc_practica/id/:_id`            | `getItem`                | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_practica.**<br>_Tabla/Modelo `bc_practica`._    | 💡 Operaciones de bc_practica. |
| **`PATCH`** | `/api/bc_practica/:_id`               | `patchItem`              | `authMiddleware(["all"])`   | **Modifica parcialmente registros del módulo bc_practica.**<br>_Tabla/Modelo `bc_practica`._ | 💡 Operaciones de bc_practica. |
| **`POST`**  | `/api/bc_practica/registrar`          | `createItem`             | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo bc_practica.**<br>_Tabla/Modelo `bc_practica`._       | 💡 Operaciones de bc_practica. |
| **`POST`**  | `/api/bc_practica/registrar-multiple` | `createMultipleItems`    | `authMiddleware(["all"])`   | **Crea / Registra registros del módulo bc_practica.**<br>_Tabla/Modelo `bc_practica`._       | 💡 Operaciones de bc_practica. |
| **`GET`**   | `/api/bc_practica/by-organization`    | `getItemsByOrganization` | `authMiddleware(["all"])`   | **Consulta / Obtiene registros del módulo bc_practica.**<br>_Tabla/Modelo `bc_practica`._    | 💡 Operaciones de bc_practica. |

---

### 📦 Módulo: `actividades`

- **Prefijo de Ruta Base:** `/api/actividades`
- **Archivo de Rutas:** [`api/routes/actividades.js`](file:///Users/user/Projects/APP_nueva/api/routes/actividades.js)

| Método       | Ruta Completa                | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                      | Caso de Uso / Soporte         |
| :----------- | :--------------------------- | :-------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------- | :---------------------------- |
| **`GET`**    | `/api/actividades`           | `getItems`            | `authMiddleware(["all"])`                      | **Consulta / Obtiene registros del módulo actividades.**<br>_Tabla/Modelo `actividades`._    | 💡 Operaciones de actividades. |
| **`GET`**    | `/api/actividades/id/:_id`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorID`     | **Consulta / Obtiene registros del módulo actividades.**<br>_Tabla/Modelo `actividades`._    | 💡 Operaciones de actividades. |
| **`POST`**   | `/api/actividades/registrar` | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate` | **Crea / Registra registros del módulo actividades.**<br>_Tabla/Modelo `actividades`._       | 💡 Operaciones de actividades. |
| **`PATCH`**  | `/api/actividades/:_id`      | `patchItem`           | `authMiddleware(["all"])`<br>`validatorID`     | **Modifica parcialmente registros del módulo actividades.**<br>_Tabla/Modelo `actividades`._ | 💡 Operaciones de actividades. |
| **`DELETE`** | `/api/actividades/:_id`      | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorID`     | **Elimina registros del módulo actividades.**<br>_Tabla/Modelo `actividades`._               | 💡 Operaciones de actividades. |

---

### 📦 Módulo: `participantes_actividades`

- **Prefijo de Ruta Base:** `/api/participantes_actividades`
- **Archivo de Rutas:** [`api/routes/participantes_actividades.js`](file:///Users/user/Projects/APP_nueva/api/routes/participantes_actividades.js)

| Método       | Ruta Completa                              | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                                                  | Caso de Uso / Soporte                       |
| :----------- | :----------------------------------------- | :-------------------- | :--------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ |
| **`GET`**    | `/api/participantes_actividades`           | `getItems`            | `authMiddleware(["all"])`                      | **Consulta / Obtiene registros del módulo participantes_actividades.**<br>_Tabla/Modelo `participantes_actividades`._    | 💡 Operaciones de participantes_actividades. |
| **`GET`**    | `/api/participantes_actividades/id/:_id`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorID`     | **Consulta / Obtiene registros del módulo participantes_actividades.**<br>_Tabla/Modelo `participantes_actividades`._    | 💡 Operaciones de participantes_actividades. |
| **`POST`**   | `/api/participantes_actividades/registrar` | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate` | **Crea / Registra registros del módulo participantes_actividades.**<br>_Tabla/Modelo `participantes_actividades`._       | 💡 Operaciones de participantes_actividades. |
| **`PATCH`**  | `/api/participantes_actividades/:_id`      | `patchItem`           | `authMiddleware(["all"])`<br>`validatorID`     | **Modifica parcialmente registros del módulo participantes_actividades.**<br>_Tabla/Modelo `participantes_actividades`._ | 💡 Operaciones de participantes_actividades. |
| **`DELETE`** | `/api/participantes_actividades/:_id`      | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorID`     | **Elimina registros del módulo participantes_actividades.**<br>_Tabla/Modelo `participantes_actividades`._               | 💡 Operaciones de participantes_actividades. |

---

### 📦 Módulo: `contenido`

- **Prefijo de Ruta Base:** `/api/contenido`
- **Archivo de Rutas:** [`api/routes/contenido.js`](file:///Users/user/Projects/APP_nueva/api/routes/contenido.js)

| Método       | Ruta Completa              | Handler / Controlador | Autenticación y Validadores                    | Qué Consulta o Modifica                                                                  | Caso de Uso / Soporte       |
| :----------- | :------------------------- | :-------------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------- | :-------------------------- |
| **`GET`**    | `/api/contenido`           | `getItems`            | `authMiddleware(["all"])`                      | **Consulta / Obtiene registros del módulo contenido.**<br>_Tabla/Modelo `contenido`._    | 💡 Operaciones de contenido. |
| **`GET`**    | `/api/contenido/id/:_id`   | `getItem`             | `authMiddleware(["all"])`<br>`validatorID`     | **Consulta / Obtiene registros del módulo contenido.**<br>_Tabla/Modelo `contenido`._    | 💡 Operaciones de contenido. |
| **`POST`**   | `/api/contenido/registrar` | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreate` | **Crea / Registra registros del módulo contenido.**<br>_Tabla/Modelo `contenido`._       | 💡 Operaciones de contenido. |
| **`PATCH`**  | `/api/contenido/:_id`      | `patchItem`           | `authMiddleware(["all"])`<br>`validatorID`     | **Modifica parcialmente registros del módulo contenido.**<br>_Tabla/Modelo `contenido`._ | 💡 Operaciones de contenido. |
| **`DELETE`** | `/api/contenido/:_id`      | `deleteItem`          | `authMiddleware(["all"])`<br>`validatorID`     | **Elimina registros del módulo contenido.**<br>_Tabla/Modelo `contenido`._               | 💡 Operaciones de contenido. |

---

### 📦 Módulo: `formtuimpacto`

- **Prefijo de Ruta Base:** `/api/formtuimpacto`
- **Archivo de Rutas:** [`api/routes/formtuimpacto.js`](file:///Users/user/Projects/APP_nueva/api/routes/formtuimpacto.js)

| Método       | Ruta Completa                    | Handler / Controlador | Autenticación y Validadores                        | Qué Consulta o Modifica                                                                       | Caso de Uso / Soporte           |
| :----------- | :------------------------------- | :-------------------- | :------------------------------------------------- | :-------------------------------------------------------------------------------------------- | :------------------------------ |
| **`GET`**    | `/api/formtuimpacto`             | `getItems`            | `authMiddleware(["all"])`                          | **Consulta / Obtiene registros del módulo formtuimpacto.**<br>_Tabla/Modelo `formtuimpacto`._ | 💡 Operaciones de formtuimpacto. |
| **`GET`**    | `/api/formtuimpacto/formFilter`  | `getItemsToDate`      | `authMiddleware(["all"])`                          | **Consulta / Obtiene registros del módulo formtuimpacto.**<br>_Tabla/Modelo `formtuimpacto`._ | 💡 Operaciones de formtuimpacto. |
| **`GET`**    | `/api/formtuimpacto/id/:form_id` | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetForm`    | **Consulta / Obtiene registros del módulo formtuimpacto.**<br>_Tabla/Modelo `formtuimpacto`._ | 💡 Operaciones de formtuimpacto. |
| **`POST`**   | `/api/formtuimpacto/registrar`   | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateForm` | **Crea / Registra registros del módulo formtuimpacto.**<br>_Tabla/Modelo `formtuimpacto`._    | 💡 Operaciones de formtuimpacto. |
| **`PUT`**    | `/api/formtuimpacto`             | `updateItem`          | `authMiddleware(["all"])`                          | **Actualiza registros del módulo formtuimpacto.**<br>_Tabla/Modelo `formtuimpacto`._          | 💡 Operaciones de formtuimpacto. |
| **`DELETE`** | `/api/formtuimpacto/:_id`        | `deleteItem`          | `authMiddleware(["all"])`                          | **Elimina registros del módulo formtuimpacto.**<br>_Tabla/Modelo `formtuimpacto`._            | 💡 Operaciones de formtuimpacto. |

---

## 🗂️ 7. Configuración General, Utilidades del Sistema y Archivos

> Catálogos generales de estados, horarios globales de operación, métricas agregadas de trips, control de versiones mínimas de app y carga/descarga de archivos.

### 📦 Módulo: `bc_estados`

- **Prefijo de Ruta Base:** `/api/bc_estados`
- **Archivo de Rutas:** [`api/routes/bc_estados.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_estados.js)

| Método     | Ruta Completa                | Handler / Controlador | Autenticación y Validadores                           | Qué Consulta o Modifica                                                                 | Caso de Uso / Soporte        |
| :--------- | :--------------------------- | :-------------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------- | :--------------------------- |
| **`GET`**  | `/api/bc_estados`            | `getItems`            | `authMiddleware(["all"])`                             | **Consulta / Obtiene registros del módulo bc_estados.**<br>_Tabla/Modelo `bc_estados`._ | 💡 Operaciones de bc_estados. |
| **`GET`**  | `/api/bc_estados/id/:est_id` | `getItem`             | `authMiddleware(["all"])`<br>`validatorGetEstado`     | **Consulta / Obtiene registros del módulo bc_estados.**<br>_Tabla/Modelo `bc_estados`._ | 💡 Operaciones de bc_estados. |
| **`POST`** | `/api/bc_estados/registrar`  | `createItem`          | `authMiddleware(["all"])`<br>`validatorCreateEstados` | **Crea / Registra registros del módulo bc_estados.**<br>_Tabla/Modelo `bc_estados`._    | 💡 Operaciones de bc_estados. |

---

### 📦 Módulo: `bc_horarios`

- **Prefijo de Ruta Base:** `/api/bc_horarios`
- **Archivo de Rutas:** [`api/routes/bc_horarios.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_horarios.js)

| Método     | Ruta Completa                                    | Handler / Controlador     | Autenticación y Validadores                            | Qué Consulta o Modifica                                                                   | Caso de Uso / Soporte         |
| :--------- | :----------------------------------------------- | :------------------------ | :----------------------------------------------------- | :---------------------------------------------------------------------------------------- | :---------------------------- |
| **`GET`**  | `/api/bc_horarios`                               | `getItems`                | `authMiddleware(["all"])`                              | **Consulta / Obtiene registros del módulo bc_horarios.**<br>_Tabla/Modelo `bc_horarios`._ | 💡 Operaciones de bc_horarios. |
| **`GET`**  | `/api/bc_horarios/id/:hor_id`                    | `getItem`                 | `authMiddleware(["all"])`<br>`validatorGetHorarios`    | **Consulta / Obtiene registros del módulo bc_horarios.**<br>_Tabla/Modelo `bc_horarios`._ | 💡 Operaciones de bc_horarios. |
| **`POST`** | `/api/bc_horarios/registrar`                     | `createItem`              | `authMiddleware(["all"])`<br>`validatorCreateHorarios` | **Crea / Registra registros del módulo bc_horarios.**<br>_Tabla/Modelo `bc_horarios`._    | 💡 Operaciones de bc_horarios. |
| **`GET`**  | `/api/bc_horarios/empresa/:hor_empresa`          | `getItemEmpresa`          | `authMiddleware(["all"])`<br>`validatorGetNombre`      | **Consulta / Obtiene registros del módulo bc_horarios.**<br>_Tabla/Modelo `bc_horarios`._ | 💡 Operaciones de bc_horarios. |
| **`GET`**  | `/api/bc_horarios/empresa_cortezza/:hor_empresa` | `getItemEmpresa_cortezza` | `authMiddleware(["external"])`<br>`validatorGetNombre` | **Consulta / Obtiene registros del módulo bc_horarios.**<br>_Tabla/Modelo `bc_horarios`._ | 💡 Operaciones de bc_horarios. |

---

### 📦 Módulo: `bc_indicadores_trip`

- **Prefijo de Ruta Base:** `/api/bc_indicadores_trip`
- **Archivo de Rutas:** [`api/routes/bc_indicadores_trip.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_indicadores_trip.js)

| Método      | Ruta Completa                                                | Handler / Controlador            | Autenticación y Validadores                                                                         | Qué Consulta o Modifica                                                                                      | Caso de Uso / Soporte                 |
| :---------- | :----------------------------------------------------------- | :------------------------------- | :-------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| **`GET`**   | `/api/bc_indicadores_trip`                                   | `getItems`                       | `authMiddleware(["all"])`                                                                           | **Consulta / Obtiene registros del módulo bc_indicadores_trip.**<br>_Tabla/Modelo `bc_indicadores_trip`._    | 💡 Operaciones de bc_indicadores_trip. |
| **`GET`**   | `/api/bc_indicadores_trip/trip/:ind_viaje`                   | `getItemTrip`                    | `authMiddleware(["all"])`<br>`validatorGetTrip`                                                     | **Consulta / Obtiene registros del módulo bc_indicadores_trip.**<br>_Tabla/Modelo `bc_indicadores_trip`._    | 💡 Operaciones de bc_indicadores_trip. |
| **`GET`**   | `/api/bc_indicadores_trip/usuario/:ind_usuario`              | `getItemsUser`                   | `authMiddleware(["all"])`<br>`validatorGetUser`                                                     | **Consulta / Obtiene registros del módulo bc_indicadores_trip.**<br>_Tabla/Modelo `bc_indicadores_trip`._    | 💡 Operaciones de bc_indicadores_trip. |
| **`POST`**  | `/api/bc_indicadores_trip/registrar`                         | `createItem`                     | `authMiddleware(["all"])`<br>`checkAchievement5Viajes(205`<br>`"ind_usuario")`<br>`validatorCreate` | **Crea / Registra registros del módulo bc_indicadores_trip.**<br>_Tabla/Modelo `bc_indicadores_trip`._       | 💡 Operaciones de bc_indicadores_trip. |
| **`PATCH`** | `/api/bc_indicadores_trip/:ind_id`                           | `patchItem`                      | `authMiddleware(["all"])`<br>`validatorGetTrip`                                                     | **Modifica parcialmente registros del módulo bc_indicadores_trip.**<br>_Tabla/Modelo `bc_indicadores_trip`._ | 💡 Operaciones de bc_indicadores_trip. |
| **`GET`**   | `/api/bc_indicadores_trip/with-prestamos`                    | `getItemsWithPrestamos`          | `authMiddleware(["all"])`                                                                           | **Consulta / Obtiene registros del módulo bc_indicadores_trip.**<br>_Tabla/Modelo `bc_indicadores_trip`._    | 💡 Operaciones de bc_indicadores_trip. |
| **`GET`**   | `/api/bc_indicadores_trip/with-prestamos/:ind_id`            | `getItemWithPrestamo`            | `authMiddleware(["all"])`<br>`validatorGetId`                                                       | **Consulta / Obtiene registros del módulo bc_indicadores_trip.**<br>_Tabla/Modelo `bc_indicadores_trip`._    | 💡 Operaciones de bc_indicadores_trip. |
| **`GET`**   | `/api/bc_indicadores_trip/with-prestamos/empresa/:empresaId` | `getItemsWithPrestamosByEmpresa` | `authMiddleware(["all"])`                                                                           | **Consulta / Obtiene registros del módulo bc_indicadores_trip.**<br>_Tabla/Modelo `bc_indicadores_trip`._    | 💡 Operaciones de bc_indicadores_trip. |

---

### 📦 Módulo: `bc_versiones_app`

- **Prefijo de Ruta Base:** `/api/bc_versiones_app`
- **Archivo de Rutas:** [`api/routes/bc_versiones_app.js`](file:///Users/user/Projects/APP_nueva/api/routes/bc_versiones_app.js)

| Método    | Ruta Completa                                  | Handler / Controlador | Autenticación y Validadores | Qué Consulta o Modifica                                                                             | Caso de Uso / Soporte              |
| :-------- | :--------------------------------------------- | :-------------------- | :-------------------------- | :-------------------------------------------------------------------------------------------------- | :--------------------------------- |
| **`GET`** | `/api/bc_versiones_app/nombre_app/:nombre_app` | `getItem`             | _Público_                   | **Consulta / Obtiene registros del módulo bc_versiones_app.**<br>_Tabla/Modelo `bc_versiones_app`._ | 💡 Operaciones de bc_versiones_app. |

---

### 📦 Módulo: `upload`

- **Prefijo de Ruta Base:** `/api/upload`
- **Archivo de Rutas:** [`api/routes/upload.js`](file:///Users/user/Projects/APP_nueva/api/routes/upload.js)

| Método     | Ruta Completa | Handler / Controlador | Autenticación y Validadores | Qué Consulta o Modifica | Caso de Uso / Soporte |
| :--------- | :------------ | :-------------------- | :-------------------------- | :---------------------- | :-------------------- |
| **`POST`** | `/api/upload` | `res) => {            |
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' }` | `upload.single('image')`<br>`async (req` | **Crea / Registra registros del módulo upload.**<br>_Tabla/Modelo `upload`._ | 💡 Operaciones de upload. |

---

## 🚀 Guía de Integración Rápida para Flujos de Soporte Automatizado (n8n / Webhooks / AI)

A continuación se detallan los flujos más frecuentes implementados en automatizaciones de soporte:

### 1. Diagnóstico Integral de Usuario
Cuando un usuario escribe a soporte por WhatsApp o formulario, el bot puede ejecutar en secuencia:
1. **Buscar usuario por documento:** `GET /api/users/documento/:doc` o `GET /api/bc_usuarios/cedula/:cedula`
2. **Verificar si tiene préstamo de bicicleta activo:** `GET /api/bc_prestamos/prestamoActivo/:pre_usuario`
3. **Verificar si tiene renta de parqueadero activa:** `GET /api/parqueo_renta/activa/:usu_id`
4. **Verificar si tiene penalizaciones o bloqueo:** `GET /api/bc_penalizaciones/usuario/:usu_id`
5. **Verificar token de notificaciones FCM:** `GET /api/tokenMsn/usuario/:usu_id`

### 2. Liberación / Finalización de Viaje Trancado (Bicicletas)
Cuando el usuario no pudo devolver la bicicleta o el candado no registró el cierre:
1. Consultar el ID del préstamo con `GET /api/bc_prestamos/prestamoActivo/:pre_usuario`
2. Ejecutar la finalización asistida según la tecnología de la estación / flota:
   - **3G:** `PATCH /api/bc_prestamos/finalize/3g/:pre_id`
   - **4G:** `PATCH /api/bc_prestamos/finalize/4g/:pre_id`
   - **5G:** `PATCH /api/bc_prestamos/finalize/5g/:pre_id`
3. Confirmar que la bicicleta quedó en estado Disponible: `GET /api/bc_bicicletas/id/:bic_id`

### 3. Reporte de Bicicleta Dañada o en Falla
1. Registrar reporte de falla: `POST /api/bc_fallas/registrar` o `POST /api/bc_vehiculos_fallas/registrar`
2. Cambiar estado de la bicicleta a "Mantenimiento": `POST /api/bc_bicicletas/updateEstado`

