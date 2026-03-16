//Proporcione un ejemplo para convertir una promesa en un callback.
const obtenerClimaPromesa = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const exito = true;
            if (exito) {
                resolve({ temp: 22, ciudad: "La Paz" });
            } else {
                reject("Error al conectar con el satélite");
            }
        }, 1500);
    });
};
function obtenerClimaCallback(callback) {
    obtenerClimaPromesa()
        .then((datos) => {
            callback(null, datos);
        })
        .catch((error) => {
            callback(error, null);
        });
}
obtenerClimaCallback((err, clima) => {
    if (err) {
        console.error("Hubo un fallo:", err);
        return;
    }
    console.log("Resultado ", clima.ciudad, "a", clima.temp, "C");
});