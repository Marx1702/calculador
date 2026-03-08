USE calculador_costos;

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

CREATE TABLE IF NOT EXISTS presupuesto_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  presupuesto_id INT NOT NULL,
  elemento_id INT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
  FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE,
  FOREIGN KEY (elemento_id) REFERENCES elementos(id) ON DELETE CASCADE
);
