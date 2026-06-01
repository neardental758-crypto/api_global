-- SQL Script to add missing `can_iccid` column in live database `bc_candados` table
-- Run this query in your live MySQL database (e.g. via phpMyAdmin, DBeaver, or mysql terminal)

ALTER TABLE `bc_candados` ADD COLUMN `can_iccid` VARCHAR(50) DEFAULT NULL AFTER `can_numero_sim`;
