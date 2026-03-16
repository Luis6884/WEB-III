//Crear una promesa que devuelva un mensaje de éxito después de 3 segundos
function miFuncion() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("Exito");
        }, 3000);
    });
}
miFuncion().then((mensaje) => {
    console.log(mensaje);
});