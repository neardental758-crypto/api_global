# Sentencias SQL - Migración de Campos `bc_bicicletas`

Este documento contiene las sentencias SQL necesarias para actualizar la estructura de la tabla `bc_bicicletas` en la base de datos de producción, además de consideraciones importantes para una ejecución segura.

---

## 🚀 Sentencias SQL de Actualización (DDL)

Ejecuta la siguiente consulta en tu gestor de base de datos MySQL para añadir los nuevos campos. Todos los campos están definidos como **nullable** (`DEFAULT NULL`) para evitar romper la compatibilidad con el código actual en producción.

```sql
-- Sentencia SQL para agregar los nuevos campos de manera segura en producción
ALTER TABLE `bc_bicicletas` 
  ADD COLUMN `bic_numero_serie` VARCHAR(255) DEFAULT NULL COMMENT 'Número de serie físico de la bicicleta',
  ADD COLUMN `bic_modelo_vehiculo` VARCHAR(255) DEFAULT NULL COMMENT 'Modelo específico del vehículo',
  ADD COLUMN `bic_numero_bateria` VARCHAR(255) DEFAULT NULL COMMENT 'Número identificador de la batería asociada',
  ADD COLUMN `bic_numero_cargador` VARCHAR(255) DEFAULT NULL COMMENT 'Número identificador del cargador asociado',
  ADD COLUMN `bic_fecha_ingreso_operacion` DATETIME DEFAULT NULL COMMENT 'Fecha y hora en que el vehículo ingresó a operación';
```

---

## 🔍 Detalle y Mapeo de los Nuevos Campos

A continuación se detalla la correspondencia entre los tipos de datos en la base de datos MySQL y la definición en el modelo Sequelize (`api/models/mysql/bicicletas.js`):

| Campo Base de Datos | Tipo MySQL | Modelo Sequelize | Descripción |
| :--- | :--- | :--- | :--- |
| `bic_numero_serie` | `VARCHAR(255) DEFAULT NULL` | `DataTypes.STRING` | Número de serie único del fabricante. |
| `bic_modelo_vehiculo` | `VARCHAR(255) DEFAULT NULL` | `DataTypes.STRING` | Modelo del vehículo/bicicleta. |
| `bic_numero_bateria` | `VARCHAR(255) DEFAULT NULL` | `DataTypes.STRING` | Identificador único de la batería instalada. |
| `bic_numero_cargador` | `VARCHAR(255) DEFAULT NULL` | `DataTypes.STRING` | Identificador único de la batería/cargador. |
| `bic_fecha_ingreso_operacion` | `DATETIME DEFAULT NULL` | `DataTypes.DATE` | Fecha de entrada en servicio de la bicicleta. |

---

## ⚠️ Consideraciones Críticas para Producción

1. **Compatibilidad hacia atrás (Backward Compatibility):**
   Dado que los 5 nuevos campos aceptan valores nulos (`NULL`) y tienen un valor predeterminado `NULL`, las inserciones actuales hechas por la API o cualquier otro microservicio no fallarán. 

2. **Bloqueo de Tabla (Table Locking):**
   - En bases de datos MySQL/MariaDB bajo el motor InnoDB (que es el que usa la tabla según el dump), ejecutar un `ALTER TABLE` para agregar columnas suele ser una operación rápida en línea (Online DDL), pero dependiendo del volumen de registros y la versión exacta de MySQL, podría bloquear temporalmente las operaciones de escritura.
   - **Recomendación:** Se recomienda ejecutar este cambio en una ventana de mantenimiento con bajo tráfico o durante horas de menor uso de la aplicación para minimizar riesgos de timeout en producción.

3. **Copias de Seguridad (Backup):**
   Antes de ejecutar cualquier sentencia DDL en producción, asegúrate de contar con un backup reciente de la tabla `bc_bicicletas`.

---

## ↩️ Sentencia de Reversión (Rollback)

Si por alguna razón necesitas revertir los cambios y eliminar los campos recién creados, puedes ejecutar la siguiente sentencia:

```sql
-- Sentencia SQL para remover los nuevos campos si fuera necesario revertir la migración
ALTER TABLE `bc_bicicletas` 
  DROP COLUMN `bic_numero_serie`,
  DROP COLUMN `bic_modelo_vehiculo`,
  DROP COLUMN `bic_numero_bateria`,
  DROP COLUMN `bic_numero_cargador`,
  DROP COLUMN `bic_fecha_ingreso_operacion`;
```
