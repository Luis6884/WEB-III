//Crear una función que reciba un arreglo de números y devuelva el número mayor y el
//menor, en un objeto.

let obj =[23,4,52,3,7,23]
function mifuncion(x){
    let may=0
    let men=100
    for (let i=0;i<x.length;i++) {
        if (x[i]>=may) {
            may=x[i];
        }
    }
    for (let i=0;i<x.length;i++) {
        if (x[i]<=men) {
            men=x[i];
        }
    }
    console.log("el mayor es "+may);
    console.log("el menor es "+men);
}
mifuncion(obj)