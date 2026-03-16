//Proporcione un ejemplo concreto donde el anidamiento de callbacks se puede
//reescribir mejor con async/await haciendo el código más limpio y mantenible.

const calentarAgua = () => new Promise(res => setTimeout(() => {
    console.log('1. Calentando el agua...'); res();
}, 2000));

const prepararTaza = () => new Promise(res => setTimeout(() => {
    console.log('2. Poniendo el café...'); res();
}, 3000));

const servirCafe = () => new Promise(res => setTimeout(() => {
    console.log('3. ¡Café listo!'); res();
}, 4000));

/*paso1(function() {
    paso2(function() {
        paso3(function() {
            // Callback Hell...
        });
    });
});
*/

async function prepararDesayuno() { 
    console.log("Iniciando desayuno...");
    await calentarAgua();
    await prepararTaza();  
    await servirCafe();     
}
prepararDesayuno();