// Proporcione un ejemplo para migrar una función con promesas a async/await.
const calentarAgua = (tiempo) => new Promise((resolve) => {
    setTimeout(() => {
        console.log("1. Agua caliente");
        resolve("Agua Lista");
    }, tiempo);
});

const ponerCafe = (tiempo) => new Promise((resolve) => {
    setTimeout(() => {
        console.log("2. Café puesto en la taza");
        resolve("Café en taza");
    }, tiempo);
});

const servirAgua = (tiempo) => new Promise((resolve) => {
    setTimeout(() => {
        console.log("3. Agua servida en la taza");
        resolve("¡CAFÉ LISTO!");
    }, tiempo);
});


function versionPromesas() {
    
    calentarAgua(1000)
        .then(() => {
            return ponerCafe(1000); // Retornamos para seguir la cadena
        })
        .then(() => {
            return servirAgua(1000);
        })
        .then((mensajeFinal) => {
            console.log("Resultado:", mensajeFinal);
            console.log("--- FIN PROMESAS ---");
            
            versionAsyncAwait();
        })
        .catch(err => console.error("Error:", err));
}
async function versionAsyncAwait() {
    console.log("\n--- INICIANDO CON ASYNC/AWAIT ---");
    
    try {
        await calentarAgua(1000);
        await ponerCafe(1000);
        const resultado = await servirAgua(1000);
        
        console.log("Resultado:", resultado);        
    } catch (error) {
        console.error("Fallo en la cafetera:", error);
    }
}
versionPromesas();