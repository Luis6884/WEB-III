//Proporcione un ejemplo concreto donde el anidamiento de promesas se puede
//reescribir mejor con async/await haciendo el código más limpio y mantenible.
const calentarAgua = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('1. Calentando el agua...');
            resolve();
        }, 2000);
    });
};
const prepararTaza = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('2. Poniendo el café en la taza...');
            resolve();
        }, 3000);
    });
};
const servirCafe = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('3. Poniendo el agua en la taza. ¡Café listo!');
            resolve();
        }, 4000);
    });
}
/*mifuncion(function() {
    preparando(function() {
        lista();
    });
})
*/
// ASYNC/AWAIT
async function prepararDesayuno() { 
    await calentarAgua();
    await prepararTaza();  
    await servirCafe();   
}
prepararDesayuno();