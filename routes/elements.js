const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// GET /api/elements?material_id=X
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT e.*, m.nombre AS material_nombre
      FROM elementos e
      LEFT JOIN materiales m ON e.material_id = m.id
      WHERE e.usuario_id = ?
    `;
    const params = [req.userId];

    if (req.query.material_id) {
      query += ' AND e.material_id = ?';
      params.push(req.query.material_id);
    }

    query += ' ORDER BY e.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error listando elementos:', err);
    res.status(500).json({ error: 'Error al obtener elementos' });
  }
});

// POST /api/elements
router.post('/', async (req, res) => {
  try {
    const { nombre, precio_unitario, cantidad, material_id } = req.body;

    if (!nombre || precio_unitario === undefined || cantidad === undefined) {
      return res.status(400).json({ error: 'Nombre, precio y cantidad son requeridos' });
    }

    const [result] = await pool.query(
      'INSERT INTO elementos (nombre, precio_unitario, cantidad, material_id, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [nombre.trim(), precio_unitario, cantidad, material_id || null, req.userId]
    );

    const [created] = await pool.query(
      `SELECT e.*, m.nombre AS material_nombre
       FROM elementos e
       LEFT JOIN materiales m ON e.material_id = m.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    res.status(201).json(created[0]);
  } catch (err) {
    console.error('Error creando elemento:', err);
    res.status(500).json({ error: 'Error al crear elemento' });
  }
});

// PUT /api/elements/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, precio_unitario, cantidad, material_id } = req.body;

    const [result] = await pool.query(
      `UPDATE elementos SET nombre = ?, precio_unitario = ?, cantidad = ?, material_id = ?
       WHERE id = ? AND usuario_id = ?`,
      [nombre.trim(), precio_unitario, cantidad, material_id || null, req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    const [updated] = await pool.query(
      `SELECT e.*, m.nombre AS material_nombre
       FROM elementos e
       LEFT JOIN materiales m ON e.material_id = m.id
       WHERE e.id = ?`,
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error('Error actualizando elemento:', err);
    res.status(500).json({ error: 'Error al actualizar elemento' });
  }
});

// DELETE /api/elements/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM elementos WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    res.json({ message: 'Elemento eliminado' });
  } catch (err) {
    console.error('Error eliminando elemento:', err);
    res.status(500).json({ error: 'Error al eliminar elemento' });
  }
});

module.exports = router;
