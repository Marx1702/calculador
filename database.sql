-- Calculador de Costos - Database Schema
-- Importar en MySQL via phpMyAdmin o CLI

CREATE DATABASE IF NOT EXISTS u447396976_calculador_cos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE calculador_cos;

-- =====================
-- Tabla de Usuarios
-- =====================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- Tabla de Materiales
-- =====================
CREATE TABLE IF NOT EXISTS materiales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =====================
-- Tabla de Elementos
-- =====================
CREATE TABLE IF NOT EXISTS elementos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
  material_id INT,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES materiales(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =====================
-- Tabla de Proyectos
-- =====================
CREATE TABLE IF NOT EXISTS proyectos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  costo_hora DECIMAL(10,2) NOT NULL DEFAULT 0,
  horas_estimadas DECIMAL(10,2) NOT NULL DEFAULT 0,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =====================
-- Tabla de Presupuestos
-- =====================
CREATE TABLE IF NOT EXISTS presupuestos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  costo_hora DECIMAL(10,2) NOT NULL DEFAULT 0,
  horas_estimadas DECIMAL(10,2) NOT NULL DEFAULT 0,
  porcentaje_ganancia DECIMAL(5,2) NOT NULL DEFAULT 0,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =====================
-- Items del Presupuesto
-- =====================
CREATE TABLE IF NOT EXISTS presupuesto_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  presupuesto_id INT NOT NULL,
  elemento_id INT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
  FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE,
  FOREIGN KEY (elemento_id) REFERENCES elementos(id) ON DELETE CASCADE
);
