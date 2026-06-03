/*3. Crea un endpoint GET /categorias/:id que devuelva la categoría con el ID
especificado y además, incluya todos los productos que pertenecen a esa
categoría.*/
//SQL //
/*
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2),
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);
*/
exports.obtenerCategoriaConProductos = async (req, res) => {
    const { id } = req.params;

    try {
        const [categoria] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        if (categoria.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        const [productos] = await db.query('SELECT * FROM productos WHERE categoria_id = ?', [id]);

        res.json({
            ...categoria[0],
            productos
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

