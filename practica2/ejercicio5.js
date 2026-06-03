/*5. Crea un endpoint DELETE /categorias/:id que elimine la categoría indicada
y, al mismo tiempo, elimine automáticamente todos los productos que
pertenecen a esa categoría.*/

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