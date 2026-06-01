-- SQL Script to adjust database schema for `bc_candados` table (Option A)
-- Run this query in your live MySQL database (e.g. via phpMyAdmin, DBeaver, or mysql terminal)

-- Step 1: Drop the existing strict foreign key constraint `candado-bicicleta`
ALTER TABLE `bc_candados` DROP FOREIGN KEY `candado-bicicleta`;

-- Step 2: Make the `can_bicicleta` column NULLABLE and set the default value to NULL
-- (This ensures new locks starting telemetry reports can easily have null/empty vehicle values without violating constraints)
ALTER TABLE `bc_candados` MODIFY COLUMN `can_bicicleta` INT DEFAULT NULL;

-- Step 3: (Optional) Re-create the foreign key with `ON DELETE SET NULL` and `ON UPDATE CASCADE`
-- This keeps data consistency (if a bicycle is deleted, the padlock is automatically unassigned),
-- while still allowing locks to report with no bicycle assigned (NULL) perfectly fine!
-- ALTER TABLE `bc_candados` ADD CONSTRAINT `candado-bicicleta` FOREIGN KEY (`can_bicicleta`) REFERENCES `bc_bicicletas` (`bic_id`) ON DELETE SET NULL ON UPDATE CASCADE;
