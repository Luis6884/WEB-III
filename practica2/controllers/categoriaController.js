const db = require('../db');

exports.crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion || null]
        );
        res.status(201).json({ id: result.insertId, nombre, descripcion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerCategorias = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerCategoriaConProductos = async (req, res) => {
    const { id } = req.params;
    try {
        const [categoria] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        if (categoria.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        const [productos] = await db.query('SELECT * FROM productos WHERE categoria_id = ?', [id]);
        res.json({ ...categoria[0], productos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        const nuevoNombre = nombre !== undefined ? nombre : existing[0].nombre;
        const nuevaDesc = descripcion !== undefined ? descripcion : existing[0].descripcion;
        await db.query(
            'UPDATE categorias SET nombre = ?, descripcion = ?, updatedAt = NOW() WHERE id = ?',
            [nuevoNombre, nuevaDesc, id]
        );
        res.json({ mensaje: 'Categoría actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.eliminarCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json({ mensaje: 'Categoría y sus productos eliminados' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};