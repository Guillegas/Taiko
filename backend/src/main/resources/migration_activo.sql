-- Migración: añadir columna activo a la tabla usuarios
-- Ejecutar una sola vez en psql o tu cliente SQL
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
