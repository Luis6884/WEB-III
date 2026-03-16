//Realizar un código para ejecutar una función callback después 2 segundos.

function mifuncion(collback){
    setTimeout(() => {
        collback();
    },2000)
}
mifuncion(()=>{console.log('hola mundo')});