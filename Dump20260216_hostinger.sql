-- CREATE DATABASE  IF NOT EXISTS `bc_bd_next` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
-- USE `bc_bd_next`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: bcdatabase.c2ckmzcucnfk.sa-east-1.rds.amazonaws.com    Database: bc_bd_next
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
-- SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
-- SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

-- SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades` (
  `id` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `fechaCreacion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_agendado`
--

DROP TABLE IF EXISTS `bc_agendado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_agendado` (
  `_id` varchar(45) NOT NULL,
  `agendado_cedula` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `agendado_fecha` varchar(45) DEFAULT NULL,
  `agendado_estacion` varchar(45) DEFAULT NULL,
  `agendado_practica` varchar(45) NOT NULL,
  `agendado_resultado` varchar(45) DEFAULT NULL,
  `agendado_estado` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `agendado-usuario_idx` (`agendado_cedula`),
  KEY `agendado-practica_idx` (`agendado_practica`),
  CONSTRAINT `agendado-practica` FOREIGN KEY (`agendado_practica`) REFERENCES `bc_practica` (`_id`),
  CONSTRAINT `agendado-usuario` FOREIGN KEY (`agendado_cedula`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_agendamientos_incumplidos`
--

DROP TABLE IF EXISTS `bc_agendamientos_incumplidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_agendamientos_incumplidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agendamiento_id` int NOT NULL,
  `operario_id` varchar(255) NOT NULL,
  `estacion_id` varchar(255) NOT NULL,
  `empresa_id` varchar(255) NOT NULL,
  `dia_semana` varchar(50) NOT NULL,
  `fecha_incumplimiento` datetime NOT NULL,
  `revisado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_agendamiento` (`agendamiento_id`),
  KEY `idx_fecha` (`fecha_incumplimiento`),
  CONSTRAINT `bc_agendamientos_incumplidos_ibfk_1` FOREIGN KEY (`agendamiento_id`) REFERENCES `bc_agendamientos_operarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_agendamientos_operarios`
--

DROP TABLE IF EXISTS `bc_agendamientos_operarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_agendamientos_operarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `operario_id` varchar(255) NOT NULL,
  `estacion_id` varchar(255) NOT NULL,
  `empresa_id` varchar(255) NOT NULL,
  `dias_semana` varchar(255) NOT NULL,
  `notas` text,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_operario` (`operario_id`),
  KEY `idx_estacion` (`estacion_id`),
  KEY `idx_empresa` (`empresa_id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_bicicletas`
--

DROP TABLE IF EXISTS `bc_bicicletas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_bicicletas` (
  `bic_id` int NOT NULL AUTO_INCREMENT,
  `bic_nombre` varchar(255) NOT NULL,
  `bic_numero` varchar(255) NOT NULL,
  `bic_estacion` varchar(255) NOT NULL,
  `bic_estado` varchar(255) NOT NULL,
  `bic_descripcion` varchar(255) NOT NULL,
  `bic_created_at` datetime DEFAULT NULL,
  `bic_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`bic_id`),
  KEY `bicicleta-estacion` (`bic_estacion`),
  KEY `bicicleta-estado` (`bic_estado`),
  CONSTRAINT `bicicleta-estacion` FOREIGN KEY (`bic_estacion`) REFERENCES `bc_estaciones` (`est_estacion`) ON UPDATE CASCADE,
  CONSTRAINT `bicicleta-estado` FOREIGN KEY (`bic_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4139 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_bicicleteros`
--

DROP TABLE IF EXISTS `bc_bicicleteros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_bicicleteros` (
  `bro_id` int NOT NULL AUTO_INCREMENT,
  `bro_nombre` varchar(255) NOT NULL,
  `bro_estacion` varchar(255) NOT NULL,
  `bro_numero` varchar(255) NOT NULL,
  `bro_bicicleta` int NOT NULL,
  `bro_bluetooth` varchar(255) NOT NULL,
  `bro_clave` varchar(255) NOT NULL,
  PRIMARY KEY (`bro_id`),
  KEY `bicicletaro-estacion` (`bro_estacion`),
  KEY `bicicletero-bicicleta` (`bro_bicicleta`),
  CONSTRAINT `bicicletaro-estacion` FOREIGN KEY (`bro_estacion`) REFERENCES `bc_estaciones` (`est_estacion`) ON UPDATE CASCADE,
  CONSTRAINT `bicicletero-bicicleta` FOREIGN KEY (`bro_bicicleta`) REFERENCES `bc_bicicletas` (`bic_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=872 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_candados`
--

DROP TABLE IF EXISTS `bc_candados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_candados` (
  `can_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `can_imei` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `can_qr_numero` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `can_latitud` decimal(10,8) DEFAULT NULL,
  `can_longitud` decimal(11,8) DEFAULT NULL,
  `can_mac` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `can_bateria` int DEFAULT '0',
  `can_estado_candado` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'closed',
  `can_senal` int DEFAULT '0',
  `can_numero_sim` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `can_fecha_ultimo_comando` datetime DEFAULT NULL,
  `can_ultimo_comando` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `can_bicicleta` int NOT NULL,
  `can_created_at` datetime DEFAULT NULL,
  `can_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`can_id`),
  KEY `idx_imei` (`can_imei`),
  CONSTRAINT `candado-bicicleta` FOREIGN KEY (`can_bicicleta`) REFERENCES `bc_bicicletas` (`bic_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_categorias_componentes`
--

DROP TABLE IF EXISTS `bc_categorias_componentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_categorias_componentes` (
  `cat_id` int NOT NULL AUTO_INCREMENT,
  `cat_nombre` varchar(100) NOT NULL,
  `cat_descripcion` text,
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_comentarios_rentas`
--

DROP TABLE IF EXISTS `bc_comentarios_rentas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_comentarios_rentas` (
  `com_id` int NOT NULL AUTO_INCREMENT,
  `com_usuario` varchar(15) NOT NULL,
  `com_prestamo` int NOT NULL,
  `com_fecha` varchar(255) NOT NULL,
  `com_comentario` varchar(255) NOT NULL,
  `com_estado` varchar(255) NOT NULL,
  `com_calificacion` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`com_id`),
  KEY `comentario-usuario` (`com_usuario`),
  KEY `comentario-bicicleta` (`com_prestamo`),
  KEY `comentario-estado` (`com_estado`),
  CONSTRAINT `comentario-bicicleta` FOREIGN KEY (`com_prestamo`) REFERENCES `bc_prestamos` (`pre_id`) ON UPDATE CASCADE,
  CONSTRAINT `comentario-estado` FOREIGN KEY (`com_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE,
  CONSTRAINT `comentario-usuario` FOREIGN KEY (`com_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12266 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_componentes`
--

DROP TABLE IF EXISTS `bc_componentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_componentes` (
  `comp_id` int NOT NULL AUTO_INCREMENT,
  `comp_nombre` varchar(100) NOT NULL,
  `comp_descripcion` text,
  `categoria_id` int NOT NULL,
  PRIMARY KEY (`comp_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `bc_componentes_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `bc_categorias_componentes` (`cat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_empresas`
--

DROP TABLE IF EXISTS `bc_empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_empresas` (
  `emp_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `emp_nombre` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `emp_email` text CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `emp_estado` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `emp_costo` int DEFAULT '0',
  `_perfil` varchar(45) DEFAULT NULL,
  `_recompensas` varchar(45) DEFAULT NULL,
  `_3G` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `_4G` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `_5G` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `_electrohub` varchar(45) DEFAULT NULL,
  `_parquadero` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `_carro_compartido` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `_ruta_corporativa` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `_vehiculo_particular` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `emp_carro_compartido` tinyint DEFAULT '1',
  `emp_moto_compartido` tinyint DEFAULT '1',
  `aplicacion` varchar(255) DEFAULT NULL,
  `emp_logo` text,
  `emp_created_at` datetime DEFAULT NULL,
  `emp_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`emp_id`) USING BTREE,
  UNIQUE KEY `emp_nombre` (`emp_nombre`),
  KEY `empresa-estado` (`emp_estado`),
  KEY `empresa-contratos` (`emp_id`),
  CONSTRAINT `empresa-estado` FOREIGN KEY (`emp_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_estaciones`
--

DROP TABLE IF EXISTS `bc_estaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_estaciones` (
  `est_id` int NOT NULL AUTO_INCREMENT,
  `est_estacion` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `est_empresa` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `est_num_bicicleteros` int NOT NULL,
  `est_habilitada` int NOT NULL,
  `est_mac` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `est_electrica` int NOT NULL,
  `est_horario` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `est_last_conect` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `est_puestos_intercambiables` int NOT NULL,
  `est_latitud` float NOT NULL,
  `est_longitud` float NOT NULL,
  `est_ciudad` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `est_automatizada` int NOT NULL,
  `est_direccion` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `est_descripcion` varchar(45) DEFAULT 'Sin descripción',
  `est_rebalanceo` varchar(255) DEFAULT NULL,
  `est_created_at` datetime DEFAULT NULL,
  `est_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`est_id`,`est_estacion`) USING BTREE,
  UNIQUE KEY `est_estacion` (`est_estacion`),
  UNIQUE KEY `est_id` (`est_id`),
  KEY `estacion-usuario` (`est_direccion`),
  KEY `estacion-empresa` (`est_empresa`),
  CONSTRAINT `estacion-empresa` FOREIGN KEY (`est_empresa`) REFERENCES `bc_empresas` (`emp_nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_estado_componentes`
--

DROP TABLE IF EXISTS `bc_estado_componentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_estado_componentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bicicleta_id` int NOT NULL,
  `componente_id` int NOT NULL,
  `estado` enum('ok','cambio','ajuste','arreglo','revisión') DEFAULT 'ok',
  `ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bicicleta_id` (`bicicleta_id`),
  KEY `componente_id` (`componente_id`),
  CONSTRAINT `bc_estado_componentes_ibfk_1` FOREIGN KEY (`bicicleta_id`) REFERENCES `bc_bicicletas` (`bic_id`),
  CONSTRAINT `bc_estado_componentes_ibfk_2` FOREIGN KEY (`componente_id`) REFERENCES `bc_componentes` (`comp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=52268 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_estados`
--

DROP TABLE IF EXISTS `bc_estados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_estados` (
  `est_id` int NOT NULL AUTO_INCREMENT,
  `est_estado` varchar(255) NOT NULL,
  PRIMARY KEY (`est_id`,`est_estado`) USING BTREE,
  UNIQUE KEY `est_estado` (`est_estado`),
  UNIQUE KEY `est_id` (`est_id`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_fallas`
--

DROP TABLE IF EXISTS `bc_fallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_fallas` (
  `fal_id` int NOT NULL AUTO_INCREMENT,
  `fal_estado` varchar(255) NOT NULL,
  PRIMARY KEY (`fal_id`,`fal_estado`) USING BTREE,
  UNIQUE KEY `fal_estado` (`fal_estado`),
  UNIQUE KEY `fal_id` (`fal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_historial_claves`
--

DROP TABLE IF EXISTS `bc_historial_claves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_historial_claves` (
  `his_id` int NOT NULL AUTO_INCREMENT,
  `his_usuario` varchar(15) NOT NULL,
  `his_estacion` varchar(255) NOT NULL,
  `his_bicicletero` int NOT NULL,
  `his_bicicleta` int NOT NULL,
  `his_fecha` varchar(255) NOT NULL,
  `his_clave_old` varchar(255) NOT NULL,
  `his_clave_new` varchar(255) NOT NULL,
  `his_estado` varchar(255) NOT NULL,
  PRIMARY KEY (`his_id`),
  KEY `historial-usuario` (`his_usuario`),
  KEY `historial-bicicleta` (`his_bicicleta`),
  KEY `historial-bicicletero` (`his_bicicletero`),
  KEY `historial-estacion` (`his_estacion`),
  KEY `historial-estado` (`his_estado`),
  CONSTRAINT `historial-bicicleta` FOREIGN KEY (`his_bicicleta`) REFERENCES `bc_bicicletas` (`bic_id`) ON UPDATE CASCADE,
  CONSTRAINT `historial-bicicletero` FOREIGN KEY (`his_bicicletero`) REFERENCES `bc_bicicleteros` (`bro_id`) ON UPDATE CASCADE,
  CONSTRAINT `historial-estacion` FOREIGN KEY (`his_estacion`) REFERENCES `bc_estaciones` (`est_estacion`) ON UPDATE CASCADE,
  CONSTRAINT `historial-estado` FOREIGN KEY (`his_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE,
  CONSTRAINT `historial-usuario` FOREIGN KEY (`his_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17708 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_historial_mantenimientos`
--

DROP TABLE IF EXISTS `bc_historial_mantenimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_historial_mantenimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mantenimiento_id` int NOT NULL,
  `componente_id` int NOT NULL,
  `estado_anterior` enum('ok','cambio','ajuste','arreglo','revisión') DEFAULT NULL,
  `estado_nuevo` enum('ok','cambio','ajuste','arreglo','revisión') NOT NULL,
  `accion_realizada` enum('diagnóstico','reparación','reemplazo','ajuste','ninguna') NOT NULL,
  `comentario` text,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `operario_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mantenimiento_id` (`mantenimiento_id`),
  KEY `idx_componente_id` (`componente_id`),
  CONSTRAINT `fk_historial_mantenimiento` FOREIGN KEY (`mantenimiento_id`) REFERENCES `bc_mantenimientos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_mantenimiento` FOREIGN KEY (`mantenimiento_id`) REFERENCES `bc_mantenimientos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=52172 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_horarios`
--

DROP TABLE IF EXISTS `bc_horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_horarios` (
  `hor_id` int NOT NULL AUTO_INCREMENT,
  `hor_empresa` varchar(45) NOT NULL,
  `hor_mon` varchar(255) NOT NULL,
  `hor_tue` varchar(255) NOT NULL,
  `hor_wed` varchar(255) NOT NULL,
  `hor_thu` varchar(255) NOT NULL,
  `hor_fri` varchar(255) NOT NULL,
  `hor_sat` varchar(255) NOT NULL,
  `hor_sun` varchar(255) NOT NULL,
  PRIMARY KEY (`hor_id`),
  KEY `horarios-empresa` (`hor_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_indicadores_trip`
--

DROP TABLE IF EXISTS `bc_indicadores_trip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_indicadores_trip` (
  `ind_id` varchar(45) NOT NULL,
  `ind_usuario` varchar(45) NOT NULL,
  `ind_viaje` varchar(45) NOT NULL,
  `ind_modulo` varchar(45) NOT NULL,
  `ind_duracion` varchar(45) NOT NULL,
  `ind_distancia` varchar(45) NOT NULL,
  `ind_co2` varchar(45) NOT NULL,
  `ind_calorias` varchar(45) NOT NULL,
  PRIMARY KEY (`ind_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_mantenimientos`
--

DROP TABLE IF EXISTS `bc_mantenimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_mantenimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` varchar(45) NOT NULL,
  `bicicleta_id` int NOT NULL,
  `estacion_id` varchar(255) NOT NULL,
  `operario_id` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_finalizacion` timestamp NULL DEFAULT NULL,
  `comentarios` text,
  `bicicleta_password` int DEFAULT NULL,
  `tipo_mantenimiento` varchar(100) NOT NULL,
  `estado` enum('pendiente','en_proceso','finalizado','cancelado') DEFAULT 'pendiente',
  `prioridad` enum('baja','media','alta','urgente') NOT NULL DEFAULT 'media',
  PRIMARY KEY (`id`),
  KEY `idx_empresa_id` (`empresa_id`),
  KEY `idx_bicicleta_id` (`bicicleta_id`),
  KEY `idx_fecha_creacion` (`fecha_creacion`),
  KEY `idx_operario_id` (`operario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24076 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_notificaciones_rentas`
--

DROP TABLE IF EXISTS `bc_notificaciones_rentas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_notificaciones_rentas` (
  `not_id` int NOT NULL AUTO_INCREMENT,
  `not_renta_id` int NOT NULL,
  `not_usuario` varchar(255) NOT NULL,
  `not_fecha_vencimiento` date NOT NULL,
  `not_hora_vencimiento` varchar(20) NOT NULL,
  `not_estado` varchar(50) DEFAULT 'PENDIENTE',
  `not_fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`not_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2044 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_penalizaciones`
--

DROP TABLE IF EXISTS `bc_penalizaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_penalizaciones` (
  `pen_id` int NOT NULL AUTO_INCREMENT,
  `pen_tipo_penalizacion` int NOT NULL,
  `pen_novedad` varchar(255) NOT NULL,
  `pen_usuario` varchar(15) NOT NULL,
  `pen_fecha_creacion` varchar(255) NOT NULL,
  `pen_fecha_tiempo_ok` varchar(255) NOT NULL,
  `pen_fecha_dinero_ok` varchar(255) NOT NULL,
  `pen_estado` varchar(255) NOT NULL,
  `pen_fecha_apelado` varchar(255) NOT NULL,
  `pen_motivo_apelado` varchar(255) NOT NULL,
  PRIMARY KEY (`pen_id`),
  KEY `penalizacion-usuario` (`pen_usuario`),
  KEY `penalizacion-tipo_penalizacion` (`pen_tipo_penalizacion`),
  KEY `penalizacion-estado` (`pen_estado`),
  CONSTRAINT `penalizacion-estado` FOREIGN KEY (`pen_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE,
  CONSTRAINT `penalizacion-tipo_penalizacion` FOREIGN KEY (`pen_tipo_penalizacion`) REFERENCES `bc_tipo_penalizaciones` (`tpp_id`) ON UPDATE CASCADE,
  CONSTRAINT `penalizacion-usuario` FOREIGN KEY (`pen_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_permisos`
--

DROP TABLE IF EXISTS `bc_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_permisos` (
  `per_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `per_componente_pantalla` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `per_funcionalidad` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `per_tipo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `per_created_at` datetime DEFAULT NULL,
  `per_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`per_id`),
  KEY `idx_componente` (`per_componente_pantalla`),
  KEY `idx_tipo` (`per_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_practica`
--

DROP TABLE IF EXISTS `bc_practica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_practica` (
  `_id` varchar(45) NOT NULL,
  `practica_funcionario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `practica_cupos` int DEFAULT NULL,
  `practica_estacion` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `practica_fecha` varchar(45) DEFAULT NULL,
  `practica_hora_finalizar` varchar(45) DEFAULT NULL,
  `practica_estado` varchar(45) DEFAULT NULL,
  `reagendada` tinyint DEFAULT '0',
  PRIMARY KEY (`_id`),
  KEY `usuario-funcionario_idx` (`practica_funcionario`),
  KEY `practica-estacion_idx` (`practica_estacion`),
  CONSTRAINT `practica-estacion` FOREIGN KEY (`practica_estacion`) REFERENCES `bc_estaciones` (`est_estacion`),
  CONSTRAINT `usuario-funcionario` FOREIGN KEY (`practica_funcionario`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_preoperacionales`
--

DROP TABLE IF EXISTS `bc_preoperacionales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_preoperacionales` (
  `id` varchar(45) NOT NULL,
  `usuario` varchar(45) NOT NULL,
  `idViaje` varchar(45) NOT NULL,
  `modulo` varchar(45) NOT NULL,
  `respuestas` json NOT NULL,
  `comentario` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_prestamos`
--

DROP TABLE IF EXISTS `bc_prestamos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_prestamos` (
  `pre_id` int NOT NULL AUTO_INCREMENT,
  `pre_hora_server` varchar(255) NOT NULL,
  `pre_usuario` varchar(15) NOT NULL,
  `pre_bicicleta` int NOT NULL,
  `pre_retiro_estacion` varchar(255) NOT NULL,
  `pre_retiro_bicicletero` int NOT NULL,
  `pre_retiro_fecha` varchar(255) NOT NULL,
  `pre_retiro_hora` varchar(255) NOT NULL,
  `pre_devolucion_estacion` varchar(255) NOT NULL,
  `pre_devolucion_bicicletero` int NOT NULL,
  `pre_devolucion_fecha` varchar(255) NOT NULL,
  `pre_devolucion_hora` varchar(255) NOT NULL,
  `pre_duracion` mediumtext NOT NULL,
  `pre_dispositivo` varchar(255) NOT NULL,
  `pre_estado` varchar(255) NOT NULL,
  PRIMARY KEY (`pre_id`),
  KEY `prestamo-retiro-estacion` (`pre_retiro_estacion`),
  KEY `prestamo-devolucion-estacion` (`pre_devolucion_estacion`),
  KEY `prestamo-usuario` (`pre_usuario`),
  KEY `prestamo-bicicleta` (`pre_bicicleta`),
  KEY `prestamo-retiro-bicicletero` (`pre_retiro_bicicletero`),
  KEY `prestamo-devoculion-bicicletero` (`pre_devolucion_bicicletero`),
  KEY `prestamo-estado` (`pre_estado`),
  CONSTRAINT `prestamo-bicicleta` FOREIGN KEY (`pre_bicicleta`) REFERENCES `bc_bicicletas` (`bic_id`) ON UPDATE CASCADE,
  CONSTRAINT `prestamo-devoculion-bicicletero` FOREIGN KEY (`pre_devolucion_bicicletero`) REFERENCES `bc_bicicleteros` (`bro_id`) ON UPDATE CASCADE,
  CONSTRAINT `prestamo-devolucion-estacion` FOREIGN KEY (`pre_devolucion_estacion`) REFERENCES `bc_estaciones` (`est_estacion`) ON UPDATE CASCADE,
  CONSTRAINT `prestamo-estado` FOREIGN KEY (`pre_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE,
  CONSTRAINT `prestamo-retiro-bicicletero` FOREIGN KEY (`pre_retiro_bicicletero`) REFERENCES `bc_bicicleteros` (`bro_id`) ON UPDATE CASCADE,
  CONSTRAINT `prestamo-retiro-estacion` FOREIGN KEY (`pre_retiro_estacion`) REFERENCES `bc_estaciones` (`est_estacion`) ON UPDATE CASCADE,
  CONSTRAINT `prestamo-usuario` FOREIGN KEY (`pre_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33543 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_puntos`
--

DROP TABLE IF EXISTS `bc_puntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_puntos` (
  `pun_id` varchar(45) NOT NULL,
  `pun_usuario` varchar(45) NOT NULL,
  `pun_modulo` varchar(45) NOT NULL,
  `pun_fecha` varchar(255) NOT NULL,
  `pun_puntos` int NOT NULL,
  `pun_motivo` varchar(255) NOT NULL,
  PRIMARY KEY (`pun_id`),
  KEY `puntos-usuario` (`pun_usuario`),
  CONSTRAINT `puntos-usuario` FOREIGN KEY (`pun_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_registro_ext`
--

DROP TABLE IF EXISTS `bc_registro_ext`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_registro_ext` (
  `idUser` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `transporte_primario` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tiempo_casa_trabajo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tiempo_trabajo_casa` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `dias_trabajo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `satisfaccion_transporte` int DEFAULT NULL,
  `dinero_gastado_tranporte` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `factor_principal_modo_transporte` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `alternativas` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `percepcion_movilizarce_bici` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `barreras_movilizarce_bici` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `beneficios_movilizarce_bici` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `dias_semana_ejercicio` int DEFAULT NULL,
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_registros_pp`
--

DROP TABLE IF EXISTS `bc_registros_pp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_registros_pp` (
  `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `usuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `idViaje` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `fecha` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `vehiculo` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `distancia` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `respuestas` json DEFAULT NULL,
  `comentario` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_reservas`
--

DROP TABLE IF EXISTS `bc_reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_reservas` (
  `res_id` int NOT NULL AUTO_INCREMENT,
  `res_estacion` varchar(255) NOT NULL,
  `res_usuario` varchar(15) NOT NULL,
  `res_bicicleta` int NOT NULL,
  `res_fecha_inicio` varchar(255) NOT NULL,
  `res_hora_inicio` varchar(255) NOT NULL,
  `res_fecha_fin` varchar(255) NOT NULL,
  `res_hora_fin` varchar(255) NOT NULL,
  `res_estado` varchar(255) NOT NULL,
  PRIMARY KEY (`res_id`),
  KEY `reserva-estacion` (`res_estacion`),
  KEY `reserva-usuario` (`res_usuario`),
  KEY `reserva-bicicleta` (`res_bicicleta`),
  KEY `reserva-estado` (`res_estado`),
  CONSTRAINT `reserva-bicicleta` FOREIGN KEY (`res_bicicleta`) REFERENCES `bc_bicicletas` (`bic_id`) ON UPDATE CASCADE,
  CONSTRAINT `reserva-estacion` FOREIGN KEY (`res_estacion`) REFERENCES `bc_estaciones` (`est_estacion`) ON UPDATE CASCADE,
  CONSTRAINT `reserva-estado` FOREIGN KEY (`res_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE,
  CONSTRAINT `reserva-usuario` FOREIGN KEY (`res_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6328 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_roles`
--

DROP TABLE IF EXISTS `bc_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_roles` (
  `rol_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rol_nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `rol_descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rol_created_at` datetime DEFAULT NULL,
  `rol_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`rol_id`),
  UNIQUE KEY `rol_nombre` (`rol_nombre`),
  KEY `idx_nombre` (`rol_nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_roles_permisos`
--

DROP TABLE IF EXISTS `bc_roles_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_roles_permisos` (
  `rp_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rp_rol_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rp_permiso_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rp_created_at` datetime DEFAULT NULL,
  `rp_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`rp_id`),
  UNIQUE KEY `unique_rol_permiso` (`rp_rol_id`,`rp_permiso_id`),
  KEY `idx_rol` (`rp_rol_id`),
  KEY `idx_permiso` (`rp_permiso_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_tarjetas_nfc`
--

DROP TABLE IF EXISTS `bc_tarjetas_nfc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_tarjetas_nfc` (
  `tnfc_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `tnfc_numero_tarjeta` int NOT NULL,
  `tnfc_id_hexadecimal` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `tnfc_estado` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'Active',
  `tnfc_usuario_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`tnfc_id`),
  UNIQUE KEY `unique_numero` (`tnfc_numero_tarjeta`),
  KEY `idx_usuario` (`tnfc_usuario_id`),
  KEY `idx_hexadecimal` (`tnfc_id_hexadecimal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_teorica`
--

DROP TABLE IF EXISTS `bc_teorica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_teorica` (
  `_id` varchar(45) NOT NULL,
  `teorica_usuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `teorica_exitosas` int DEFAULT NULL,
  `teorica_fecha` varchar(45) DEFAULT NULL,
  `teorica_resultado` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `teorica-usuario_idx` (`teorica_usuario`),
  CONSTRAINT `teorica-usuario` FOREIGN KEY (`teorica_usuario`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_tickets_soporte`
--

DROP TABLE IF EXISTS `bc_tickets_soporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_tickets_soporte` (
  `tic_id` int NOT NULL AUTO_INCREMENT,
  `tic_usuario` varchar(15) NOT NULL,
  `tic_comentario` varchar(255) NOT NULL,
  `tic_respuesta` varchar(255) NOT NULL,
  `tic_fecha_creacion` varchar(255) NOT NULL,
  `tic_fecha_respuesta` varchar(255) NOT NULL,
  `tic_estado` varchar(255) NOT NULL,
  PRIMARY KEY (`tic_id`),
  KEY `ticket-usuario` (`tic_usuario`),
  KEY `ticket-estado` (`tic_estado`),
  CONSTRAINT `ticket-estado` FOREIGN KEY (`tic_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE,
  CONSTRAINT `ticket-usuario` FOREIGN KEY (`tic_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_tipo_penalizaciones`
--

DROP TABLE IF EXISTS `bc_tipo_penalizaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_tipo_penalizaciones` (
  `tpp_id` int NOT NULL AUTO_INCREMENT,
  `tpp_codigo_penalizacion` varchar(8) NOT NULL,
  `tpp_tiempo` int NOT NULL,
  `tpp_dinero` int NOT NULL,
  PRIMARY KEY (`tpp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_usuarios`
--

DROP TABLE IF EXISTS `bc_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_usuarios` (
  `usu_documento` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `usu_nombre` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `usu_empresa` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `usu_habilitado` int NOT NULL,
  `usu_viajes` int NOT NULL DEFAULT '0',
  `usu_edad` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usu_genero` varchar(16) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `usu_dir_trabajo` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `usu_dir_casa` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `usu_recorrido` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `usu_calificacion` float NOT NULL DEFAULT '5',
  `usu_ciudad` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usu_roles_carpooling` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `coorCasa` json DEFAULT NULL,
  `coorTrabajo` json DEFAULT NULL,
  `usu_img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `usu_creacion` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `usu_prueba` tinyint DEFAULT NULL,
  `usu_modulo_carpooling` tinyint DEFAULT '0',
  `usu_rol_dash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usu_avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usu_created_at` datetime DEFAULT NULL,
  `usu_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`usu_documento`),
  KEY `usuario-empresa_idx` (`usu_empresa`),
  KEY `usuario-direccion_idx` (`usu_dir_trabajo`) /*!80000 INVISIBLE */,
  CONSTRAINT `usuario-empresa` FOREIGN KEY (`usu_empresa`) REFERENCES `bc_empresas` (`emp_nombre`),
  CONSTRAINT `usuario-estacion` FOREIGN KEY (`usu_dir_trabajo`) REFERENCES `bc_estaciones` (`est_direccion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuario-extendido` FOREIGN KEY (`usu_documento`) REFERENCES `bc_registro_ext` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_usuarios_credenciales`
--

DROP TABLE IF EXISTS `bc_usuarios_credenciales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_usuarios_credenciales` (
  `uc_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `uc_usuario_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `uc_password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `uc_created_at` datetime DEFAULT NULL,
  `uc_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`uc_id`),
  UNIQUE KEY `unique_usuario` (`uc_usuario_id`),
  KEY `idx_usuario` (`uc_usuario_id`),
  CONSTRAINT `bc_usuarios_credenciales_ibfk_1` FOREIGN KEY (`uc_usuario_id`) REFERENCES `bc_usuarios` (`usu_documento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_usuarios_empresas`
--

DROP TABLE IF EXISTS `bc_usuarios_empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_usuarios_empresas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usu_documento` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `empresa_ids` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usu_documento` (`usu_documento`),
  CONSTRAINT `bc_usuarios_empresas_ibfk_1` FOREIGN KEY (`usu_documento`) REFERENCES `bc_usuarios` (`usu_documento`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_usuarios_permisos`
--

DROP TABLE IF EXISTS `bc_usuarios_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_usuarios_permisos` (
  `up_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `up_usuario_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `up_permiso_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `up_created_at` datetime DEFAULT NULL,
  `up_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`up_id`),
  UNIQUE KEY `unique_usuario_permiso` (`up_usuario_id`,`up_permiso_id`),
  KEY `idx_usuario` (`up_usuario_id`),
  KEY `idx_permiso` (`up_permiso_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_usuarios_referidos`
--

DROP TABLE IF EXISTS `bc_usuarios_referidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_usuarios_referidos` (
  `usuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `codigo` varchar(45) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `referente` varchar(45) DEFAULT 'null',
  PRIMARY KEY (`usuario`),
  CONSTRAINT `userREf` FOREIGN KEY (`usuario`) REFERENCES `bc_registro_ext` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_usuarios_roles`
--

DROP TABLE IF EXISTS `bc_usuarios_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_usuarios_roles` (
  `ur_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `ur_usuario_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `ur_rol_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `ur_created_at` datetime DEFAULT NULL,
  `ur_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ur_id`),
  UNIQUE KEY `unique_usuario_rol` (`ur_usuario_id`,`ur_rol_id`),
  KEY `idx_usuario` (`ur_usuario_id`),
  KEY `idx_rol` (`ur_rol_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_vehiculos_fallas`
--

DROP TABLE IF EXISTS `bc_vehiculos_fallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_vehiculos_fallas` (
  `vef_id` int NOT NULL AUTO_INCREMENT,
  `vef_usuario` varchar(15) NOT NULL,
  `vef_vehiculo` int NOT NULL,
  `vef_fecha` varchar(255) NOT NULL,
  `vef_falla` varchar(255) NOT NULL,
  `vef_estado` varchar(255) NOT NULL,
  PRIMARY KEY (`vef_id`),
  KEY `falla-usuario` (`vef_usuario`),
  KEY `falla-bicicleta` (`vef_vehiculo`),
  KEY `falla-falla` (`vef_falla`),
  KEY `falla-estado` (`vef_estado`),
  CONSTRAINT `falla-bicicleta` FOREIGN KEY (`vef_vehiculo`) REFERENCES `bc_bicicletas` (`bic_id`) ON UPDATE CASCADE,
  CONSTRAINT `falla-estado` FOREIGN KEY (`vef_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE,
  CONSTRAINT `falla-falla` FOREIGN KEY (`vef_falla`) REFERENCES `bc_fallas` (`fal_estado`) ON UPDATE CASCADE,
  CONSTRAINT `falla-usuario` FOREIGN KEY (`vef_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bc_versiones_app`
--

DROP TABLE IF EXISTS `bc_versiones_app`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bc_versiones_app` (
  `id` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `nombre_app` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `ultima_version_android` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `ultima_version_ios` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoComentarios`
--

DROP TABLE IF EXISTS `compartidoComentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoComentarios` (
  `_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `idEnvio` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `idRecibido` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `relacion` varchar(45) NOT NULL,
  `calificacion` varchar(45) NOT NULL,
  `comentario` varchar(45) NOT NULL,
  `idViaje` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`_id`),
  KEY `usuario-enviado` (`idEnvio`),
  KEY `usuario-recibido_idx` (`idRecibido`),
  KEY `viaje-comentario` (`idViaje`),
  CONSTRAINT `usuario-enviado` FOREIGN KEY (`idEnvio`) REFERENCES `bc_usuarios` (`usu_documento`),
  CONSTRAINT `usuario-recibido` FOREIGN KEY (`idRecibido`) REFERENCES `bc_usuarios` (`usu_documento`),
  CONSTRAINT `viaje-comentario` FOREIGN KEY (`idViaje`) REFERENCES `compartidoViajeActivo` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoConductor`
--

DROP TABLE IF EXISTS `compartidoConductor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoConductor` (
  `_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `daviplata` tinyint DEFAULT '0',
  `nequi` tinyint DEFAULT '0',
  `viajes` int DEFAULT '0',
  `fechaInscripcion` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  CONSTRAINT `conductorCarpooling-usuario` FOREIGN KEY (`_id`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoIndicadores`
--

DROP TABLE IF EXISTS `compartidoIndicadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoIndicadores` (
  `_id` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `idUsuario` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '0',
  `idViaje` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '0',
  `distancia` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `codos` float DEFAULT NULL,
  `calorias` float DEFAULT NULL,
  `dinero` int DEFAULT NULL,
  `tiempo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `indicador-usuario_idx` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoPagos`
--

DROP TABLE IF EXISTS `compartidoPagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoPagos` (
  `_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `idViaje` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `idConductor` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `idPasajero` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `idSolicitud` varchar(45) NOT NULL,
  `valor` varchar(45) NOT NULL,
  `metodo` varchar(45) DEFAULT NULL,
  `estado` varchar(45) NOT NULL,
  PRIMARY KEY (`_id`),
  KEY `idViaje_idx` (`idViaje`),
  KEY `idConductor_idx` (`idConductor`) /*!80000 INVISIBLE */,
  KEY `idPasajero_idx` (`idPasajero`),
  KEY `solicitud-pago_idx` (`idSolicitud`),
  CONSTRAINT `idViaje` FOREIGN KEY (`idViaje`) REFERENCES `compartidoViajeActivo` (`_id`),
  CONSTRAINT `solicitud-pago` FOREIGN KEY (`idSolicitud`) REFERENCES `compartidoSolicitud` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoPasajero`
--

DROP TABLE IF EXISTS `compartidoPasajero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoPasajero` (
  `_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `fechaInscripcion` varchar(45) DEFAULT NULL,
  `viajes` int DEFAULT '0',
  PRIMARY KEY (`_id`),
  CONSTRAINT `usuario-pasajero` FOREIGN KEY (`_id`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoPenalizacion`
--

DROP TABLE IF EXISTS `compartidoPenalizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoPenalizacion` (
  `_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `idUsuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `idViaje` varchar(45) DEFAULT NULL,
  `penalizadoHasta` varchar(45) DEFAULT NULL,
  `penalizadoDesde` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `usuario-penalizado` (`idUsuario`),
  KEY `viaje-penalizacion` (`idViaje`),
  CONSTRAINT `usuario-penalizado` FOREIGN KEY (`idUsuario`) REFERENCES `bc_usuarios` (`usu_documento`),
  CONSTRAINT `viaje-penalizacion` FOREIGN KEY (`idViaje`) REFERENCES `compartidoViajeActivo` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoSolicitud`
--

DROP TABLE IF EXISTS `compartidoSolicitud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoSolicitud` (
  `_id` varchar(45) NOT NULL,
  `idSolicitante` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `fechaSolicitud` varchar(45) DEFAULT NULL,
  `idViajeSolicitado` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `estadoSolicitud` varchar(45) DEFAULT NULL,
  `metodoSolicitado` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `solicitud-usuario_idx` (`idSolicitante`),
  KEY `solicitud-activo` (`idViajeSolicitado`),
  CONSTRAINT `pasajero-viajes` FOREIGN KEY (`idSolicitante`) REFERENCES `compartidoPasajero` (`_id`),
  CONSTRAINT `solicitud-usuario` FOREIGN KEY (`idSolicitante`) REFERENCES `bc_usuarios` (`usu_documento`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoSolicitudesNoEncontradas`
--

DROP TABLE IF EXISTS `compartidoSolicitudesNoEncontradas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoSolicitudesNoEncontradas` (
  `id` varchar(45) NOT NULL,
  `idSolicitante` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `fechaSolicitud` varchar(45) DEFAULT NULL,
  `posicion1` json DEFAULT NULL,
  `posicion2` json DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `fechaCreacion` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sol_idsolicitante_idx` (`idSolicitante`),
  CONSTRAINT `sol-user` FOREIGN KEY (`idSolicitante`) REFERENCES `compartidoPasajero` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoVehiculo`
--

DROP TABLE IF EXISTS `compartidoVehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoVehiculo` (
  `_id` varchar(45) NOT NULL,
  `marca` varchar(45) DEFAULT NULL,
  `modelo` varchar(45) DEFAULT NULL,
  `color` varchar(45) DEFAULT NULL,
  `placa` varchar(45) DEFAULT NULL,
  `idpropietario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `tipo` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `vehiculo-conductor_idx` (`idpropietario`),
  CONSTRAINT `vehiculo-propietario` FOREIGN KEY (`idpropietario`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compartidoViajeActivo`
--

DROP TABLE IF EXISTS `compartidoViajeActivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartidoViajeActivo` (
  `_id` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `idOrganizacion` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `lSalida` varchar(255) DEFAULT NULL,
  `llegada` varchar(255) DEFAULT NULL,
  `conductor` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `fecha` varchar(45) DEFAULT NULL,
  `vehiculo` varchar(45) NOT NULL,
  `asientosIda` int DEFAULT NULL,
  `estado` varchar(45) DEFAULT NULL,
  `polilyne` mediumtext NOT NULL,
  `coorSalida` json DEFAULT NULL,
  `coorDestino` json DEFAULT NULL,
  `distancia` float DEFAULT NULL,
  `precio` int DEFAULT NULL,
  `asientosVuelta` int DEFAULT NULL,
  `distanciaGoogle` varchar(45) DEFAULT NULL,
  `fechaCreacion` varchar(45) DEFAULT NULL,
  `duracionGoogle` varchar(45) DEFAULT NULL,
  `pagoAceptado` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `viaje-conductor_idx` (`conductor`),
  KEY `conductor-vehiculo_idx` (`vehiculo`),
  CONSTRAINT `conductor-usuario` FOREIGN KEY (`conductor`) REFERENCES `bc_usuarios` (`usu_documento`),
  CONSTRAINT `conductor-vehiculo` FOREIGN KEY (`vehiculo`) REFERENCES `compartidoVehiculo` (`_id`),
  CONSTRAINT `conductor-viajes` FOREIGN KEY (`conductor`) REFERENCES `compartidoConductor` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contenido`
--

DROP TABLE IF EXISTS `contenido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contenido` (
  `_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `id_tematica` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `nombre_contenido` varchar(255) DEFAULT NULL,
  `link_video` varchar(255) DEFAULT NULL,
  `num_preguntas` int DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `tematica-contenido_idx` (`id_tematica`),
  CONSTRAINT `tematica-contenido` FOREIGN KEY (`id_tematica`) REFERENCES `tematica` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contratos`
--

DROP TABLE IF EXISTS `contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contratos` (
  `_id` varchar(45) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `idOrganizacion` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `fechaInicio` varchar(45) DEFAULT NULL,
  `fechaFinal` varchar(45) DEFAULT NULL,
  `vecesRenovado` int NOT NULL DEFAULT '0',
  `fechaUpdate` varchar(45) DEFAULT NULL,
  `estado` varchar(45) DEFAULT NULL,
  `notaContrato` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `idx_idOrganizacion` (`idOrganizacion`),
  CONSTRAINT `contrato-empresa` FOREIGN KEY (`idOrganizacion`) REFERENCES `bc_empresas` (`emp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `desafios`
--

DROP TABLE IF EXISTS `desafios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `desafios` (
  `id_desafio` varchar(255) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `valor` int NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` varchar(50) NOT NULL DEFAULT 'inactivo',
  `criterios` json DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_fin` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_desafio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `empresa_logro`
--

DROP TABLE IF EXISTS `empresa_logro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa_logro` (
  `id` varchar(45) NOT NULL,
  `idEmpresa` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `idLogro` varchar(45) NOT NULL,
  `valor` int NOT NULL,
  `meta` int DEFAULT NULL,
  `puntosGanar` int DEFAULT NULL,
  `inicio` datetime DEFAULT NULL,
  `fin` datetime DEFAULT NULL,
  `fechaCreacion` datetime NOT NULL,
  `estado` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `emplogro_logro_idx` (`idLogro`),
  KEY `emplogro_empresa_idx` (`idEmpresa`),
  KEY `emplogro_estados_idx` (`estado`),
  CONSTRAINT `emplogro_empresa` FOREIGN KEY (`idEmpresa`) REFERENCES `bc_empresas` (`emp_nombre`),
  CONSTRAINT `emplogro_estados` FOREIGN KEY (`estado`) REFERENCES `bc_estados` (`est_estado`),
  CONSTRAINT `emplogro_logro` FOREIGN KEY (`idLogro`) REFERENCES `logros` (`id_logro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `formOrganization`
--

DROP TABLE IF EXISTS `formOrganization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `formOrganization` (
  `idformOrganization` varchar(30) NOT NULL,
  `color1` varchar(6) NOT NULL,
  `color2` varchar(6) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `imagen` varchar(45) NOT NULL,
  PRIMARY KEY (`idformOrganization`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `formtuimpacto`
--

DROP TABLE IF EXISTS `formtuimpacto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `formtuimpacto` (
  `form_id` varchar(30) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `apellido` varchar(45) DEFAULT NULL,
  `email` varchar(45) NOT NULL,
  `ciudad` varchar(45) DEFAULT NULL,
  `distanciaTotal` varchar(45) DEFAULT NULL,
  `registro` datetime DEFAULT NULL,
  `alternativa` varchar(45) DEFAULT NULL,
  `cualAlternativa` varchar(500) DEFAULT NULL,
  `ejercicio` varchar(45) DEFAULT NULL,
  `gustoPorPrograma` varchar(45) DEFAULT NULL,
  `biciElectricaCompartida` varchar(45) DEFAULT NULL,
  `edad` varchar(45) DEFAULT NULL,
  `genero` varchar(45) DEFAULT NULL,
  `textGenero` varchar(45) DEFAULT NULL,
  `transportePrimario` json DEFAULT NULL,
  `tiempoCasaTrabajo` varchar(45) DEFAULT NULL,
  `tiempoTrabajoCasa` varchar(45) DEFAULT NULL,
  `diasDesplazamientoAlTrabajo` varchar(45) DEFAULT NULL,
  `horarioHabitualDesde` time DEFAULT NULL,
  `horarioHabitualHasta` time DEFAULT NULL,
  `showGastoPromedioTransporteSemana` varchar(45) DEFAULT NULL,
  `satisfaccionTransporte` varchar(45) DEFAULT NULL,
  `factor` varchar(45) DEFAULT NULL,
  `cualFactor` varchar(500) DEFAULT NULL,
  `viable` varchar(45) DEFAULT NULL,
  `motivo` varchar(45) DEFAULT NULL,
  `cualMotivo` varchar(500) DEFAULT NULL,
  `beneficio` varchar(45) DEFAULT NULL,
  `cualBeneficio` varchar(500) DEFAULT NULL,
  `conocePrograma` varchar(45) DEFAULT NULL,
  `disposicion` varchar(45) DEFAULT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  `cualDescripcion` varchar(500) DEFAULT NULL,
  `textBeneficio` varchar(255) DEFAULT NULL,
  `textSostenible` varchar(255) DEFAULT NULL,
  `coDos` varchar(45) DEFAULT NULL,
  `costoTransporte` varchar(45) DEFAULT NULL,
  `tiempoPerdido` varchar(45) DEFAULT NULL,
  `calorias` varchar(45) DEFAULT NULL,
  `arboles` varchar(45) DEFAULT NULL,
  `ahorro` varchar(45) DEFAULT NULL,
  `diasBeneficio` varchar(45) DEFAULT NULL,
  `caloriasBeneficio` varchar(45) DEFAULT NULL,
  `residencia` json DEFAULT NULL,
  `trabajo` json DEFAULT NULL,
  `totalTiempoViaje` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`form_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logros`
--

DROP TABLE IF EXISTS `logros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logros` (
  `id_logro` varchar(45) NOT NULL,
  `descripcion` text,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `imagen` longtext,
  `estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_logro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `n8n_extensiones`
--

DROP TABLE IF EXISTS `n8n_extensiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `n8n_extensiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_prestamo` varchar(45) NOT NULL,
  `documento_usuario` varchar(45) NOT NULL,
  `descripcion` varchar(45) NOT NULL,
  `fecha_creacion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `n8n_peticiones`
--

DROP TABLE IF EXISTS `n8n_peticiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `n8n_peticiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `documento_usuario` varchar(45) NOT NULL,
  `peticion` varchar(255) NOT NULL,
  `workflow` varchar(45) NOT NULL,
  `fecha_creacion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=640 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `n8n_soporte`
--

DROP TABLE IF EXISTS `n8n_soporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `n8n_soporte` (
  `id` varchar(45) NOT NULL,
  `documento_usuario` varchar(45) NOT NULL,
  `solicitud` varchar(255) NOT NULL,
  `fecha` varchar(45) NOT NULL,
  `da_soporte` varchar(45) NOT NULL,
  `estado` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `oficinas`
--

DROP TABLE IF EXISTS `oficinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oficinas` (
  `_id` varchar(45) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `direccion` varchar(45) DEFAULT NULL,
  `ciudad` varchar(45) DEFAULT NULL,
  `coor` json DEFAULT NULL,
  `idOrganizacion` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  PRIMARY KEY (`_id`),
  KEY `oficina-empresa_idx` (`idOrganizacion`),
  CONSTRAINT `oficina-empresa` FOREIGN KEY (`idOrganizacion`) REFERENCES `bc_empresas` (`emp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parqueo_feedback`
--

DROP TABLE IF EXISTS `parqueo_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parqueo_feedback` (
  `id` varchar(255) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `renta_parqueo` varchar(255) NOT NULL,
  `fecha` varchar(255) NOT NULL,
  `comentario` varchar(255) NOT NULL,
  `calificacion` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `renta_idx` (`renta_parqueo`),
  KEY `usuario-parq` (`usuario`),
  CONSTRAINT `renta` FOREIGN KEY (`renta_parqueo`) REFERENCES `parqueo_renta` (`id`),
  CONSTRAINT `usuario-parq` FOREIGN KEY (`usuario`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parqueo_horarios`
--

DROP TABLE IF EXISTS `parqueo_horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parqueo_horarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parqueadero` varchar(255) NOT NULL,
  `hor_mon` varchar(255) NOT NULL,
  `hor_tue` varchar(255) NOT NULL,
  `hor_wed` varchar(255) NOT NULL,
  `hor_thu` varchar(255) NOT NULL,
  `hor_fri` varchar(255) NOT NULL,
  `hor_sat` varchar(255) NOT NULL,
  `hor_sun` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `parqueadero_hor_idx` (`parqueadero`),
  CONSTRAINT `parqueadero_hor` FOREIGN KEY (`parqueadero`) REFERENCES `parqueo_parqueaderos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2147483647 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parqueo_lugar`
--

DROP TABLE IF EXISTS `parqueo_lugar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parqueo_lugar` (
  `id` varchar(225) NOT NULL,
  `numero` varchar(255) NOT NULL,
  `parqueadero` varchar(255) NOT NULL,
  `bluetooth` varchar(255) NOT NULL,
  `qr` varchar(255) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `voltaje` varchar(45) NOT NULL DEFAULT 'null',
  `estado` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `parqueadero_idx` (`parqueadero`),
  KEY `estado_idx` (`estado`),
  CONSTRAINT `estado_par` FOREIGN KEY (`estado`) REFERENCES `bc_estados` (`est_estado`),
  CONSTRAINT `parqueadero` FOREIGN KEY (`parqueadero`) REFERENCES `parqueo_parqueaderos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parqueo_movimientos`
--

DROP TABLE IF EXISTS `parqueo_movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parqueo_movimientos` (
  `id` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `usuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `parqueo` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `fecha_registro` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `valor` int NOT NULL,
  `concepto` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parqueo_parqueaderos`
--

DROP TABLE IF EXISTS `parqueo_parqueaderos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parqueo_parqueaderos` (
  `id` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `empresa` varchar(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `capacidad` varchar(255) NOT NULL,
  `latitud` varchar(255) NOT NULL,
  `longitud` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `ciudad` varchar(255) NOT NULL,
  `distancia_mts` int NOT NULL,
  `duracion_reserva_min` int NOT NULL,
  `estado` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `estado_idx` (`estado`),
  KEY `empresa_idx` (`empresa`),
  CONSTRAINT `empresa` FOREIGN KEY (`empresa`) REFERENCES `bc_empresas` (`emp_nombre`),
  CONSTRAINT `estado` FOREIGN KEY (`estado`) REFERENCES `bc_estados` (`est_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parqueo_renta`
--

DROP TABLE IF EXISTS `parqueo_renta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parqueo_renta` (
  `id` varchar(255) NOT NULL,
  `usuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `parqueadero` varchar(255) NOT NULL,
  `lugar_parqueo` varchar(255) NOT NULL,
  `vehiculo` varchar(255) NOT NULL,
  `fecha` varchar(255) NOT NULL,
  `inicio` varchar(255) NOT NULL,
  `fin` varchar(255) NOT NULL,
  `duracion` varchar(255) NOT NULL,
  `dispositivo` varchar(255) NOT NULL,
  `estado` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `parqueadero_par_idx` (`parqueadero`),
  KEY `lugar_idx` (`lugar_parqueo`),
  KEY `estado_idx` (`estado`),
  KEY `usuario` (`usuario`),
  CONSTRAINT `estado-parqueo` FOREIGN KEY (`estado`) REFERENCES `bc_estados` (`est_estado`),
  CONSTRAINT `lugar` FOREIGN KEY (`lugar_parqueo`) REFERENCES `parqueo_lugar` (`id`),
  CONSTRAINT `parqueadero_par` FOREIGN KEY (`parqueadero`) REFERENCES `parqueo_parqueaderos` (`id`),
  CONSTRAINT `usuario` FOREIGN KEY (`usuario`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parqueo_reservas`
--

DROP TABLE IF EXISTS `parqueo_reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parqueo_reservas` (
  `id` varchar(255) CHARACTER SET latin5 COLLATE latin5_bin NOT NULL,
  `usuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `parqueadero` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `lugar_parqueo` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `fecha` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `hora_inicio` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `hora_fin` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `dispositivo` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `estado` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_reserva` (`usuario`) /*!80000 INVISIBLE */,
  KEY `parqueadero_reserva` (`parqueadero`) /*!80000 INVISIBLE */,
  KEY `estado_reserva` (`estado`),
  KEY `lugar_fk` (`lugar_parqueo`),
  CONSTRAINT `estado_fk` FOREIGN KEY (`estado`) REFERENCES `bc_estados` (`est_estado`),
  CONSTRAINT `lugar_fk` FOREIGN KEY (`lugar_parqueo`) REFERENCES `parqueo_lugar` (`id`),
  CONSTRAINT `parq_res` FOREIGN KEY (`parqueadero`) REFERENCES `parqueo_parqueaderos` (`id`),
  CONSTRAINT `usu_res` FOREIGN KEY (`usuario`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parqueo_tyc`
--

DROP TABLE IF EXISTS `parqueo_tyc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parqueo_tyc` (
  `usuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `fecha_inscripcion` varchar(255) NOT NULL,
  `ultimo_vehiculo` varchar(45) NOT NULL,
  `telefono` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `saldo` int NOT NULL,
  `estado` varchar(45) NOT NULL,
  PRIMARY KEY (`usuario`),
  CONSTRAINT `usuario_tyc` FOREIGN KEY (`usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `participantes_actividades`
--

DROP TABLE IF EXISTS `participantes_actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participantes_actividades` (
  `id` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `participante` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `actividad` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `tiempo` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `velocidad` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `puesto` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  PRIMARY KEY (`id`),
  KEY `participante-actividad_idx` (`actividad`),
  CONSTRAINT `participante-actividad` FOREIGN KEY (`actividad`) REFERENCES `actividades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `preguntasBrain`
--

DROP TABLE IF EXISTS `preguntasBrain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preguntasBrain` (
  `_id` varchar(45) NOT NULL,
  `id_contenido` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `texto_pregunta` text,
  PRIMARY KEY (`_id`),
  KEY `contenido-pregunta_idx` (`id_contenido`),
  CONSTRAINT `pregunta-contenido` FOREIGN KEY (`id_contenido`) REFERENCES `contenido` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` varchar(45) NOT NULL,
  `empresa` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `cantidad` int DEFAULT NULL,
  `valor` int DEFAULT NULL,
  `nivel` int DEFAULT NULL,
  `imagen` longtext,
  `estado` varchar(45) DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `predoctos_empresa_idx` (`empresa`),
  CONSTRAINT `predoctos_empresa` FOREIGN KEY (`empresa`) REFERENCES `bc_empresas` (`emp_nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `progreso_desafios`
--

DROP TABLE IF EXISTS `progreso_desafios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progreso_desafios` (
  `id` varchar(45) NOT NULL,
  `usuario_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `desafio_id` varchar(45) NOT NULL,
  `progreso` double NOT NULL DEFAULT '0',
  `estado` varchar(45) NOT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_usuarios` (`usuario_id`),
  KEY `fk_desafios` (`desafio_id`),
  CONSTRAINT `fk_desafios` FOREIGN KEY (`desafio_id`) REFERENCES `desafios` (`id_desafio`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `bc_usuarios` (`usu_documento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `progreso_logros`
--

DROP TABLE IF EXISTS `progreso_logros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progreso_logros` (
  `id` varchar(45) NOT NULL,
  `usuario_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `logro_id` varchar(45) DEFAULT NULL,
  `progreso` double DEFAULT NULL,
  `estado` varchar(45) NOT NULL,
  `ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_progreso` (`usuario_id`),
  KEY `logros_progreso` (`logro_id`),
  CONSTRAINT `logros_progreso` FOREIGN KEY (`logro_id`) REFERENCES `logros` (`id_logro`),
  CONSTRAINT `usuario_progreso` FOREIGN KEY (`usuario_id`) REFERENCES `bc_usuarios` (`usu_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `respuestaBrain`
--

DROP TABLE IF EXISTS `respuestaBrain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `respuestaBrain` (
  `_id` varchar(255) NOT NULL,
  `id_pregunta` varchar(45) NOT NULL,
  `texto_respuesta` text,
  `es_correcta` tinyint DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `respuesta-pregunta_idx` (`id_pregunta`),
  CONSTRAINT `respuesta-pregunta` FOREIGN KEY (`id_pregunta`) REFERENCES `preguntasBrain` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sesiones_usuarios`
--

DROP TABLE IF EXISTS `sesiones_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones_usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usu_documento` varchar(255) NOT NULL,
  `fecha_ingreso` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` datetime DEFAULT NULL,
  `acciones` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_usu_documento` (`usu_documento`),
  KEY `idx_fecha_ingreso` (`fecha_ingreso`),
  KEY `idx_fecha_cierre` (`fecha_cierre`)
) ENGINE=InnoDB AUTO_INCREMENT=5625 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tematica`
--

DROP TABLE IF EXISTS `tematica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tematica` (
  `_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `nombre_tematica` varchar(255) DEFAULT NULL,
  `logo_tematica` text,
  `tematica_activa` tinyint DEFAULT '0',
  PRIMARY KEY (`_id`),
  KEY `tematica-contenido_idx` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tokenMsn`
--

DROP TABLE IF EXISTS `tokenMsn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokenMsn` (
  `_id` varchar(45) NOT NULL,
  `documento` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `documento_UNIQUE` (`documento`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vp_comentarios`
--

DROP TABLE IF EXISTS `vp_comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vp_comentarios` (
  `com_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `com_usuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `com_comentario` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `com_calificacion` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `com_fecha` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `com_id_viaje` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  PRIMARY KEY (`com_id`),
  KEY `comentario-usuario` (`com_usuario`),
  KEY `comentario-viaje_idx` (`com_id_viaje`),
  CONSTRAINT `comentario-viaje` FOREIGN KEY (`com_id_viaje`) REFERENCES `vp_viajes` (`via_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vp_tipo_vehiculos`
--

DROP TABLE IF EXISTS `vp_tipo_vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vp_tipo_vehiculos` (
  `tip_id` int NOT NULL AUTO_INCREMENT,
  `tip_nombre` varchar(255) NOT NULL,
  `tip_estado` varchar(255) NOT NULL,
  `tip_mostrar` tinyint DEFAULT '0',
  PRIMARY KEY (`tip_id`,`tip_nombre`) USING BTREE,
  UNIQUE KEY `tip_nombre` (`tip_nombre`),
  UNIQUE KEY `tip_id` (`tip_id`),
  KEY `tipo-estado` (`tip_estado`),
  CONSTRAINT `tipo-estado` FOREIGN KEY (`tip_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vp_vehiculos_usuario`
--

DROP TABLE IF EXISTS `vp_vehiculos_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vp_vehiculos_usuario` (
  `vus_id` varchar(45) NOT NULL,
  `vus_usuario` varchar(15) NOT NULL,
  `vus_tipo` varchar(255) NOT NULL,
  `vus_marca` varchar(255) NOT NULL,
  `vus_modelo` varchar(255) NOT NULL,
  `vus_cilindraje` varchar(255) NOT NULL,
  `vus_color` varchar(255) NOT NULL,
  `vus_serial` varchar(255) NOT NULL,
  `vus_fecha_registro` varchar(255) NOT NULL,
  `vus_img` varchar(255) NOT NULL,
  `vus_estado` varchar(255) NOT NULL,
  PRIMARY KEY (`vus_id`),
  KEY `vehiculo-usuario` (`vus_usuario`),
  KEY `vehiculo-tipo` (`vus_tipo`),
  KEY `vehiculo-estado` (`vus_estado`),
  CONSTRAINT `vehiculo-estado` FOREIGN KEY (`vus_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE,
  CONSTRAINT `vehiculo-tipo` FOREIGN KEY (`vus_tipo`) REFERENCES `vp_tipo_vehiculos` (`tip_nombre`) ON UPDATE CASCADE,
  CONSTRAINT `vehiculo-usuario` FOREIGN KEY (`vus_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vp_viajes`
--

DROP TABLE IF EXISTS `vp_viajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vp_viajes` (
  `via_id` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_usuario` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_vehiculo` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_partida` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_llegada` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_fecha_creacion` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_duracion` varchar(15) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_kilometros` varchar(15) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_calorias` varchar(15) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_co2` varchar(15) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `via_img` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `via_estado` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  PRIMARY KEY (`via_id`),
  KEY `viaje-estado` (`via_estado`),
  KEY `viaje-usuario` (`via_usuario`),
  KEY `viaje-vehiculo` (`via_vehiculo`),
  KEY `viaje-comentario` (`via_id`),
  CONSTRAINT `viaje-estado` FOREIGN KEY (`via_estado`) REFERENCES `bc_estados` (`est_estado`) ON UPDATE CASCADE,
  CONSTRAINT `viaje-usuario` FOREIGN KEY (`via_usuario`) REFERENCES `bc_usuarios` (`usu_documento`) ON UPDATE CASCADE,
  CONSTRAINT `viaje-vehiculo` FOREIGN KEY (`via_vehiculo`) REFERENCES `vp_vehiculos_usuario` (`vus_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
-- SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-16 17:16:33
