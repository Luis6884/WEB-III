//Crear una función que determine si una cadena es palíndromo (se lee igual al derecho y
//al revés)
function mifuncion(x){
    let alareves='';
    for (let i =x.length-1 ; i >= 0; i--){
       alareves=alareves+x[i]; 
    }
    if (x===alareves) {
        return true;
    }else{
        return false;
    }
}
console.log(mifuncion('oruro'))
console.log("-----------")
console.log(mifuncion('hola'))