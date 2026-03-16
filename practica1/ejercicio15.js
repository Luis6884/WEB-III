//Proporcione un ejemplo para convertir un callback en una promesa.

function prepararConCallbacks() {

    setTimeout(() => {
        console.log("1. Agua calentada ");
        
        setTimeout(() => {
            console.log("2. Cafe servido en la taza");
            
            setTimeout(() => {
                console.log("3. Agua añadida");
                prepararConPromesas();
            }, 1000);
            
        }, 1000);
        
    }, 1000);
}


const paso1 = () => {
    return new Promise((resolve) => {
        setTimeout(() => { 
            console.log("1. Agua caliente "); 
            resolve("Éxito"); 
        }, 1000);
    });
};
paso1().then((mensaje) => {
    console.log("La promesa terminó con:", mensaje);
});