//Crear una función que invierta el orden de las palabras en una frase.
function mifuncion(x){
    let z='';
    for (let i = x.length-1; i >=0; i--) {
        z=z+x[i];
    }
    console.log(z);
}
mifuncion('abcd');