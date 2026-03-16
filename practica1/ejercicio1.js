//Crear una función que cuente cuántas veces aparece cada vocal en un texto y devuelva el
//resultado en un objeto.
const obj={
    cadena:"eufori",
    a:0,
    e:0,
    i:0,
    o:0,
    u:0,
}
function mifuncion(obj){
    for (let i = 0; i < obj.cadena.length; i++) {
        if (obj.cadena[i]=="a") {
            obj.a++;
        }
        if (obj.cadena[i]=="e") {
            obj.e++;
        }
        if (obj.cadena[i]=="i") {
            obj.i++;
        }
        if (obj.cadena[i]=="o") {
            obj.o++;
        }
        if (obj.cadena[i]=="u") {
            obj.u++;
        }
    }
}
mifuncion(obj)
console.log(obj)