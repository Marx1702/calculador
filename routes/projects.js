const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT *, (costo_hora * horas_estimadas) AS costo_total FROM proyectos WHERE usuario_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error listando proyectos:', err);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const { nombre, costo_hora, horas_estimadas } = req.body;

    if (!nombre || costo_hora === undefined || horas_estimadas === undefined) {
      return res.status(400).json({ error: 'Nombre, costo/hora y horas son requeridos' });
    }

    const [result] = await pool.query(
      'INSERT INTO proyectos (nombre, costo_hora, horas_estimadas, usuario_id) VALUES (?, ?, ?, ?)',
      [nombre.trim(), costo_hora, horas_estimadas, req.userId]
    );

    const [created] = await pool.query(
      'SELECT *, (costo_hora * horas_estimadas) AS costo_total FROM proyectos WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(created[0]);
  } catch (err) {
    console.error('Error creando proyecto:', err);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM proyectos WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    console.error('Error eliminando proyecto:', err);
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
});

module.exports = router;
