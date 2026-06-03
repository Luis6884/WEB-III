/*4. Crea un endpoint PATCH /categorias/:id que permita actualizar todos los
datos de la categoría con el ID especificado.*/

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

