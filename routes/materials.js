const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/materials
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM materiales WHERE usuario_id = ? ORDER BY nombre ASC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error listando materiales:', err);
    res.status(500).json({ error: 'Error al obtener materiales' });
  }
});

// POST /api/materials
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre del material es requerido' });
    }

    const [result] = await pool.query(
      'INSERT INTO materiales (nombre, usuario_id) VALUES (?, ?)',
      [nombre.trim(), req.userId]
    );

    res.status(201).json({
      id: result.insertId,
      nombre: nombre.trim(),
      usuario_id: req.userId
    });
  } catch (err) {
    console.error('Error creando material:', err);
    res.status(500).json({ error: 'Error al crear material' });
  }
});

// DELETE /api/materials/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM materiales WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    res.json({ message: 'Material eliminado' });
  } catch (err) {
    console.error('Error eliminando material:', err);
    res.status(500).json({ error: 'Error al eliminar material' });
  }
});

module.exports = router;
