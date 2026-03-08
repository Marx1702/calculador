const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// GET /api/budgets — list all budgets with items and totals
router.get('/', async (req, res) => {
  try {
    const [budgets] = await pool.query(
      'SELECT * FROM presupuestos WHERE usuario_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    // Load items for each budget
    for (const budget of budgets) {
      const [items] = await pool.query(
        `SELECT pi.*, e.nombre AS elemento_nombre, e.precio_unitario,
                m.nombre AS material_nombre
         FROM presupuesto_items pi
         JOIN elementos e ON pi.elemento_id = e.id
         LEFT JOIN materiales m ON e.material_id = m.id
         WHERE pi.presupuesto_id = ?`,
        [budget.id]
      );
      budget.items = items;

      // Calculate totals
      const costoMateriales = items.reduce((sum, item) => {
        return sum + (parseFloat(item.precio_unitario) * parseFloat(item.cantidad));
      }, 0);
      const costoTiempo = parseFloat(budget.costo_hora) * parseFloat(budget.horas_estimadas);
      const subtotal = costoMateriales + costoTiempo;
      const ganancia = subtotal * (parseFloat(budget.porcentaje_ganancia) / 100);

      budget.costo_materiales = costoMateriales;
      budget.costo_tiempo = costoTiempo;
      budget.subtotal = subtotal;
      budget.ganancia = ganancia;
      budget.precio_final = subtotal + ganancia;
    }

    res.json(budgets);
  } catch (err) {
    console.error('Error listando presupuestos:', err);
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
});

// POST /api/budgets — create a new budget with items
router.post('/', async (req, res) => {
  try {
    const { nombre, costo_hora, horas_estimadas, porcentaje_ganancia, items } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const [result] = await pool.query(
      `INSERT INTO presupuestos (nombre, costo_hora, horas_estimadas, porcentaje_ganancia, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre.trim(), costo_hora || 0, horas_estimadas || 0, porcentaje_ganancia || 0, req.userId]
    );

    const budgetId = result.insertId;

    // Insert items
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(
          'INSERT INTO presupuesto_items (presupuesto_id, elemento_id, cantidad) VALUES (?, ?, ?)',
          [budgetId, item.elemento_id, item.cantidad]
        );
      }
    }

    res.status(201).json({ id: budgetId, message: 'Presupuesto creado' });
  } catch (err) {
    console.error('Error creando presupuesto:', err);
    res.status(500).json({ error: 'Error al crear presupuesto' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM presupuestos WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    res.json({ message: 'Presupuesto eliminado' });
  } catch (err) {
    console.error('Error eliminando presupuesto:', err);
    res.status(500).json({ error: 'Error al eliminar presupuesto' });
  }
});

module.exports = router;
