const express = require('express');
const app = express();
const categoriaRoutes = require('./routes/categorias');

app.use(express.json());
app.use('/categorias', categoriaRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});