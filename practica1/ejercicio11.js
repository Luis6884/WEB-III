// Proporcione un ejemplo concreto de encadenamiento de promesas
const sumar = (a, b) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("suamndo "+a+" + "+b);
            resolve(a + b);
        }, 1000);
    });
};
const restar = (base, cantidad) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("restando "+base+" - "+cantidad);
            resolve(base - cantidad);
        }, 1000);
    });
};
const multiplicar = (base, factor) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("multiplicando "+base+" * "+factor);
            resolve(base * factor);
        }, 1000);
    });
};
/*sumar(5, 5)
    .then(resultadoSuma => {
        return restar(resultadoSuma, 2); 
    })
    .then(resultadoResta => {
        return multiplicar(resultadoResta, 10);
    })
    .then(resultadoFinal => {
        console.log("El resultado : ", resultadoFinal);
    })
    .catch(error => {
        console.error("Error ", error);
    });*/
    async function ejecutarCalculos() {
    try {
        const resSuma = await sumar(5, 5);
        const resResta = await restar(resSuma, 2);
        const resFinal = await multiplicar(resResta, 10);
        console.log("Resultado final:", resFinal);
    } catch (error) {
        console.error(error);
    }
}
ejecutarCalculos();