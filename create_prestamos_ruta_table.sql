-- SQL script to create the bc_prestamos_ruta table for 5G route persistence
CREATE TABLE IF NOT EXISTS `bc_prestamos_ruta` (
  `pr_id` INT NOT NULL AUTO_INCREMENT,
  `pr_prestamo_id` INT NOT NULL,
  `pr_ruta` LONGTEXT DEFAULT NULL,
  `pr_created_at` DATETIME DEFAULT NULL,
  `pr_updated_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`pr_id`),
  UNIQUE KEY `unique_prestamo` (`pr_prestamo_id`),
  CONSTRAINT `fk_prestamo_ruta` FOREIGN KEY (`pr_prestamo_id`) REFERENCES `bc_prestamos` (`pre_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
