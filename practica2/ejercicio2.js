//2. Crea un endpoint GET /categorias que devuelva todas las categorías
//registradas en la base de datos.
exports.obtenerCategorias = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};