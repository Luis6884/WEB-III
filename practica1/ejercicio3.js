//Crear una función que reciba un arreglo de números y devuelva en un objeto a los pares
//e impares:
const numeros =[1,2,3,4,5]
function mifuncion(x){
    const pares=[];
    const impares=[];
    for (let i = 0; i < x.length; i++) {
        if (x[i]%2==0) {
            pares.push(x[i]);
        }else{
            impares.push(x[i]);
        }
    }
    console.log("pares  "+pares);
    console.log("impares  "+impares);
}
mifuncion(numeros)