//Clases:
class Producto{
    //Constructor:
    constructor(nombre,precio,stock){
        this.nombre = nombre.toUpperCase();
        this.precio = parseFloat(precio);
        this.stock = parseInt(stock);
    }

    //Metodos:
    //Sirve para modificar manualmente el precio de un producto:
    modificarPecio(nuevoPrecio) {
        this.precio = parseFloat(nuevoPrecio);
    }

    //Sirve para modificar manualmente el stock de un producto:
    modificarStockManual(nuevoStock){
        this.stock = parseInt(nuevoStock) ;
    }

    //Reduce la cantidad disponible de un producto por venta:
    reducirStock(cantidadVendida){
        this.stock = this.stock - cantidadVendida;
    }

    //Metodo para instanciar productos desde datos guardados en formato JSON
    instanciarJSON(datos){
        return new Producto(datos.nombre, datos.precio, datos.stock);
    }
}

class Pedido{
    constructor(nombreCliente, listado){
        this.nombreCliente = nombreCliente ? nombreCliente : 'generico';
        this.productosPedidos = [];
        listado.forEach((item) => this.productosPedidos.push(item));
    }

    agregarProductoAlPedido(nombreProducto, cantidad){
        this.productosPedidos.push({nombreProducto, cantidad});
    }

    mostrarResumen(nuevoPedido){
        let fecha = new Date();
        let resumen = ` Item        Cantidad        Total`;
        for(let item of nuevoPedido.productosPedidos){
            resumen = resumen + `
            ${item.nombreProducto}          ${item.cantidad}        ${listadoProductos.find((elem) => elem.nombre === item.nombreProducto).precio * item.cantidad}`
        }
        alert(`Pedido de ${nuevoPedido.nombreCliente} creado el ${fecha.getDay()} del ${fecha.getMonth()} del ${fecha.getFullYear()}
                ${resumen} 
            El total del pedido es ${this.calcularTotal(nuevoPedido)}`);
    }

    calcularTotal(nuevoPedido){
        let total = 0;
        for(let item of nuevoPedido.productosPedidos){
            total = total + listadoProductos.find((elem) => elem.nombre === item.nombreProducto).precio * item.cantidad;
        }
        return total;
    }

}

//Variables sobre productos:
let listadoProductos = [new Producto("tenedor",150,30), new Producto("Cuchara",180,27), new Producto("Plato",200,15)]; //Almacena instancias de la clase Producto. Inicia con tenedor y cuchara.
let listadoProductosJSON = JSON.stringify(listadoProductos); //Convertir el listado de productos iniciales en string
localStorage.setItem("listadoProductosGuardada",listadoProductosJSON); //Guardo el string en local

//Variables sobre pedidos:
let listadoPedidos = []; //Almacena instancias de la clase Pedido
let listadoPedidosJSON = JSON.stringify(listadoPedidos); //Convertir el listado de pedidos iniciales en string
localStorage.setItem("listadoPedidosGuardado",listadoPedidosJSON); //Guardo el string en local

//Otras variables
let monedaSeleccionada = 'peso';
let cotizacion;
cotizacion = obtenerCotizacion();

//Funciones:
    //  0 - Intro
const tours = [ 
    { //objeto 1, indice 0: interfaz pedidos. En la option "steps" guardo un array con un objeto por cada paso.
    steps: [ 
        { element: document.querySelector('.nombreCliente'), intro: 'Ingresa el nombre del cliente acá' },
        { element: document.querySelector('.dropDownProductos'), intro: 'Selecciona el producto en la lista' },
        { element: document.querySelector('.cantidadInput'), intro: 'Ingresa la cantidad para ese producto' },
        { element: document.querySelector('.totalInput'), intro: 'El total se calcula automáticamente en pesos argentinos' },
        { element: document.querySelector('#totalPedido'), intro: 'El total del pedido se muestra acá en la moneda seleccionada' },
        { element: document.querySelector('#agregarProductoBtn'), intro: 'Agregá filas para sumar productos al pedido' },
        { element: document.querySelector('.botonConfirmarVenta'), intro: 'Confirmá la venta para terminar' },
    ]
    },
    { //objeto 2, indice 1: interfaz agregar productos
        steps: [
            { element: document.querySelector('.nombreAgregar'), intro: 'Ingresa el nombre del producto que desea agregar' },
            { element: document.querySelector('.cantidadAgregar'), intro: 'Seleccione el stock de ese producto a agregar' },
            { element: document.querySelector('.precioAgregar'), intro: 'Seleccione el precio de ese producto' },
            { element: document.querySelector('#agregarOtro'), intro: 'Agregue una nueva linea para agregar otro producto' },
            { element: document.querySelector('.btnConfAgregar'), intro: 'Confirme los cambios para terminar' },
        ]
    },
    { //objeto 3, indice 1: interfaz modificar productos
        steps: [
            { element: document.querySelector('.dropDownModificar'), intro: 'Selecciona el producto que queres modificar' },
            { element: document.querySelector('.cantidadModificar'), intro: 'Seleccione el nuevo stock para ese producto' },
            { element: document.querySelector('.precioModificar'), intro: 'Ingresa el nuevo precio de ese producto' },
            { element: document.querySelector('#modificarOtro'), intro: 'Agregue una nueva linea para modificar otro producto' },
            { element: document.querySelector('.btnConfModifica'), intro: 'Confirme los cambios para terminar' },
        ]
    }
]
    //listener para el boton de iniciar tour
document.getElementById('startTour').addEventListener('click', function() {
    let indice;
    let intActual = Array.from(document.querySelectorAll('.interfaz')).find(item => !item.classList.contains('d-none'));
    if(intActual.id == 'interfazPedidos'){indice = 0;}
    else if(intActual.id == 'interfazAgregar'){indice = 1;}
    else { indice = 2;}
    introJs().setOptions(tours[indice]).start();
});  

    //  1 - Generar las opciones en los dropdowns:
let listaDrop = document.querySelector('.dropDownProductos');  //en la interfaz pedidos
generarOpciones(listaDrop);

function generarOpciones(listaDrop) {
    //vaciar las opciones actuales:
    let actuales = listaDrop.querySelectorAll("option");
    actuales.forEach(elem => elem.remove());

    //recuperar desde local el listado de objetos:
    let productosGuardados = localStorage.getItem("listadoProductosGuardada"); //recupero el string
    let listaProdObj = JSON.parse(productosGuardados); //los transformo en objetos

    listaProdObj.forEach((producto) => {
        const option = document.createElement('option');
        option.value = Number(producto.precio); //asigno el precio al value de la opción seleccionada, para usarlo en calcularTotalRenglon
        option.text = `${producto.nombre}`;
        listaDrop.appendChild(option);
    });
}

listaDrop = document.querySelector('.dropDownModificar'); //en la interfaz modificar
generarOpciones(listaDrop);

    //  2 - Asignar eventos a la primera linea de pedidos.
let primeraCantidad = document.querySelector(".cantidadInput").addEventListener("change", calcularTotalRenglon); //selecciona el primero
let primerProducto = document.querySelector(".dropDownProductos").addEventListener("change", calcularTotalRenglon);

    //  3 - Agregar nuevo renglón a la lista y asignarle eventos a los componentes de cada renglon:
let botonAgregar = document.querySelector("#agregarProductoBtn");
botonAgregar.addEventListener("click", agregarLinea);
function agregarLinea(){
    let plantilla = document.querySelector('.plantillaNuevoRenglon');
    let contenido = plantilla.content; //esto es un document fragment
    let clon = contenido.cloneNode(true); 
    clon.querySelector("div").classList.add("agregadas"); //esta clase es para despues borrarla con el boton confirmar venta
    //generar opciones al nuevo dropdown
    nuevoDropDownn= clon.querySelector(".dropDownProductos");
    generarOpciones(nuevoDropDownn);

    //darle funcion al boton eliminar
    clon.querySelector(".eliminarProducto").addEventListener("click", (event)=>{
        let contenedor = event.target.closest('.lineaProductos');
        contenedor.remove();
        calcularTotal();
    })

    //evento change en el input para la cantidad
    clon.querySelector(".cantidadInput").addEventListener("change", calcularTotalRenglon);

    //evento change en el dropdown de productos
    clon.querySelector(".dropDownProductos").addEventListener("change", calcularTotalRenglon);
    
    document.getElementById('pedidoForm').appendChild(clon);

}

    //  4 - calcular el total del renglon y mostrarlo en el lugar correspondiente
function calcularTotalRenglon(event){
    let precioItemSeleccionado = Number(event.target.closest(".lineaProductos").querySelector(".dropDownProductos").value);
    let cantidadSeleccionada = Number(event.target.closest(".lineaProductos").querySelector(".cantidadInput").value);
    event.target.closest(".lineaProductos").querySelector(".totalInput").value = cantidadSeleccionada * precioItemSeleccionado;
    calcularTotal();
    return;
}

    // 5 - calcular el total del pedido y mostrarlo en el span del footer de card pedido
function calcularTotal(){
    let total = 0;
    let itemsEnElPedido = document.querySelectorAll(".totalInput"); //tengo todos los elementos total del pedido
    itemsEnElPedido.forEach((item)=>{
        let totalItem = Number(item.value);
        total += totalItem;
    })
    if (monedaSeleccionada === 'dolar'){total = total/cotizacion;} //si la moneda seleccionada es dolar, convierto
    document.getElementById("totalPedido").innerText = total; 
    return;
}

    // 6 - Guardar el pedido con el nombre del cliente y refrescar el sector de nuevo pedido
let confVta = document.querySelector(".botonConfirmarVenta").addEventListener("click",confirmarVenta);

function confirmarVenta(){
    //obtengo el nombre del cliente:
    let nombre = document.querySelector(".nombreCliente").value;
    //armo un array con el listado de productos del pedido:
    let items = Array.from(document.querySelectorAll(".dropDownProductos")) //array con todos los dropdowns, es decir con todos objetos dropdown
    //console.log(items);
    let productos = items.map((item) => item.options[item.selectedIndex].text); //array sólo con los nombres del producto seleccionado en cada dropdown
    //console.log(productos);
    //Ahora puedo instanciar un pedido:
    let nuevoPedido = new Pedido(nombre,productos);
    //guardar el nuevo pedido agregandolo al local storage.
    listadoPedidos = localStorage.getItem("listadoPedidosGuardado"); //recupero lo que esta guardado
    listadoPedidos = JSON.parse(listadoPedidos); //lo paso de string a objetos
    listadoPedidos.push(nuevoPedido); //le pusheo el nuevo objeto pedido
    localStorage.setItem("listadoPedidosGuardado",JSON.stringify(listadoPedidos)); //lo stringifeo y lo guardo de nuevo con la misma clave
    //borrar los datos del pedido para poder preparar otro
    let renglonesAgregados = document.querySelectorAll(".agregadas");
    renglonesAgregados.forEach((item)=> item.remove());
    Swal.fire({
        title: "Éxito!",
        text: "Pedido guardado correctamente",
        icon: "success"
    });
} 

// 7 - Ir a la interfaz modificar y generar opciones en el dropdown
    let botonModificar = document.querySelector(".btnModifica").addEventListener("click", ()=>{
        let listaDrop = document.querySelector('.dropDownModificar');  
        generarOpciones(listaDrop); //referescar las opciones que tienen los dropdowns
        document.getElementById("interfazModificar").classList.remove("d-none");
        document.getElementById("interfazPedidos").classList.add("d-none");
        document.getElementById("interfazAgregar").classList.add("d-none");
})

// 8 - Agregar linea para modificar mas productos
let btnModificarOtro = document.getElementById("modificarOtro").addEventListener("click",agregarLineaModifica);

function agregarLineaModifica(){
    let plantilla = document.querySelector('.plantillaNuevoRenglonModifica');
    let contenido = plantilla.content; //esto es un document fragment
    let clon = contenido.cloneNode(true); 
    //generar opciones al nuevo dropdown
    nuevoDropDownn = clon.querySelector(".dropDownModificar");
    generarOpciones(nuevoDropDownn);

    //darle funcion al boton eliminar
    clon.querySelector(".eliminarProductoModifica").addEventListener("click", (event)=>{
        let contenedor = event.target.closest('.lineaProductosModifica');
        contenedor.remove();
    })
    document.getElementById('moficaProductoForm').appendChild(clon);
}

// 9 - Confirmar la modificación, guardar los nuevos datos y volver a la interfaz pedidos
    let botonConfirmaModifica = document.querySelector(".btnConfModifica").addEventListener("click",()=>{

    //Capturar los nombres para modificar el producto
        let items = Array.from(document.querySelectorAll(".dropDownModificar")) //array con todos los objetos dropdown
        let productosAmodificar = items.map((item) => item.options[item.selectedIndex].text); //array con los nombres de los productos a modificar
    //capturar los precios
        let precios = Array.from(document.querySelectorAll(".precioModificar")) //array con todos los objetos input de precios
        let nuevosPrecios = precios.map((item) => item.value); //array con los precios de los productos a modificar
    //capturar los stocks
        let stocks = Array.from(document.querySelectorAll(".cantidadModificar")) //array con los objetos input de los stocks
        let nuevosStocks = stocks.map((item) => item.value); //array con los stocks de los productos a modificar

    //Capturar los productos guardados en localStorage: traerlos como json y parsearlos.
        listadoGuardado = JSON.parse(localStorage.getItem('listadoProductosGuardada')); //listado productos contiene un array de objetos con los productos guardados pero sin acceso a metodos
        
        let instanciador = listadoGuardado.map((obj) => new Producto(obj.nombre, obj.precio, obj.stock));
        listadoProductos = instanciador;
        //console.log(listadoProductos);

    //Usar los metodos de la clase producto para modificar los datos:
    //del precio:
        productosAmodificar.forEach((prod)=>{
            let existe = listadoProductos.find((obj) => obj.nombre === prod);
            //console.log(existe);
            if(existe){
                existe.modificarPecio(nuevosPrecios[productosAmodificar.indexOf(prod)]);
            }
        }); 
    //del stock:
        productosAmodificar.forEach((prod)=>{
            let existe = listadoProductos.find((obj) => obj.nombre === prod);
            if(existe){
                existe.modificarStockManual(nuevosStocks[productosAmodificar.indexOf(prod)]);
            }  
        });
    //Volver a guardar todo en local:
        localStorage.setItem('listadoProductosGuardada',JSON.stringify(listadoProductos));
    //volver:
        let listaDrop = document.querySelector('.dropDownProductos');  
        generarOpciones(listaDrop); //referescar las opciones que tienen los dropdowns
        //probando sweet alert
        Swal.fire({
            title: "Éxito!",
            text: "Los datos se modificaron correctamente",
            icon: "success"
        });
        document.getElementById("interfazPedidos").classList.remove("d-none");
        document.getElementById("interfazModificar").classList.add("d-none");
        document.getElementById("interfazAgregar").classList.add("d-none");
});

// 10 - Agregar productos
    //event listeners para los botones de esta interfaz
document.querySelector(".btnAgregarProductos").addEventListener("click",agregarProductos);
document.getElementById("agregarOtro").addEventListener("click",agregarLineaAgrega);
document.querySelector(".btnConfAgregar").addEventListener("click", confirmarAgregar);
    //mostrar la interfaz agregar:
function agregarProductos(){
    document.getElementById("interfazAgregar").classList.remove("d-none");
    document.getElementById("interfazModificar").classList.add("d-none");
    document.getElementById("interfazPedidos").classList.add("d-none");
}
    //Agregar linea: 
function agregarLineaAgrega(){
    let plantilla = document.querySelector('.plantillaNuevoRenglonAgrega');
    let contenido = plantilla.content; //esto es un document fragment
    let clon = contenido.cloneNode(true); 

    //darle funcion al boton eliminar
    clon.querySelector(".eliminarProductoAgrega").addEventListener("click", (event)=>{
        let contenedor = event.target.closest('.lineaProductosAgrega');
        contenedor.remove();
    })
    document.getElementById('agregaProductoForm').appendChild(clon);
}
    //Confirmar agregar y volver:
function confirmarAgregar(){
//Capturar un array con todos los nombres de los prodcutos a agregar.
    let nombres = Array.from(document.querySelectorAll(".nombreAgregar")) //array con todos los objetos input de nombres
    let nuevosNombres = nombres.map((item) => item.value); //array con los nombres de los productos a agregar
//Capturar un array con todos las nuevas cantidades.
    let stocks = Array.from(document.querySelectorAll(".cantidadAgregar")) //array con todos los objetos input de cantidad
    let nuevosStocks = stocks.map((item) => Number(item.value)); //array con las cantidades a agregar
//Capturar un array con todos los nuevos stocks.
    let precios = Array.from(document.querySelectorAll(".precioAgregar")) //array con todos los objetos input de precios
    let nuevosPrecios = precios.map((item) => Number(item.value)); //array con los precios a agregar

    //console.log(nuevosNombres);
    //console.log(nuevosPrecios);
    //console.log(nuevosStocks);
//Instanciar todos los nuevos productos usando el constructor de la clase e ir guardandolos en un array. (Podría confirmar que no haya ya uno con ese nombre antes de instanciarlo.)
    let paraAgregar = [];
    nuevosNombres.forEach((nombre) => {
        paraAgregar.push(new Producto(nombre,nuevosPrecios[nuevosNombres.indexOf(nombre)],nuevosStocks[nuevosNombres.indexOf(nombre)]));
    })
    //console.log(paraAgregar);
//recuperar el json guardado, parsearlo para transformarlo en un array, concatenar el array a agregar, stringifear todo y guardarlo en local. 
    let stringAgregar = JSON.stringify(JSON.parse(localStorage.getItem("listadoProductosGuardada")).concat(paraAgregar));
    //console.log(stringAgregar);
    localStorage.setItem("listadoProductosGuardada",stringAgregar);

//Volver a la interfaz nuevo pedido.
    Swal.fire({
        title: "Éxito!",
        text: "Los productos se agregaron correctamente",
        icon: "success"
    });
    document.getElementById("interfazPedidos").classList.remove("d-none");
    document.getElementById("interfazAgregar").classList.add("d-none");
    document.getElementById("interfazModificar").classList.add("d-none");
    let listaDrop = document.querySelector('.dropDownProductos');  
    generarOpciones(listaDrop); //referescar las opciones que tienen los dropdowns
}

// 11 - Seleccionar moneda
document.querySelector('.btnMoneda').addEventListener("click",()=>{
    Swal.fire({
        title: "Seleccione la moneda en la que desea cotizar el pedido",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Pesos Argentinos",
        confirmButtonColor: "#0dcaf0",
        denyButtonText: `Dólar oficial`,
        denyButtonColor: "#198754"
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
        Swal.fire("Moneda seleccionada", "Los precios se muestran en Pesos Argentinos", "success");
        monedaSeleccionada = 'peso';
        document.querySelector('.btnMoneda').innerText = `Moneda seleccionada: ${monedaSeleccionada}`;
        calcularTotal();
    } else if (result.isDenied) {
        Swal.fire("Moneda seleccionada", "Los precios se muestran en Dólares cotización oficial", "success");
        monedaSeleccionada = 'dolar';
        document.querySelector('.btnMoneda').innerText = `Moneda seleccionada: ${monedaSeleccionada}`;
        calcularTotal();
    }
    });
})

// 12 - APIs
    //Dolar API: Obtener la cotización del dólar oficial y guardarla en una variable cada 1 minuto
setInterval(obtenerCotizacion, 60000);
function obtenerCotizacion(){
    fetch("https://dolarapi.com/v1/dolares/oficial")
    .then(response => response.json())
    .then(data => cotizacion = data.venta);
    //console.log(cotizacion);
    return cotizacion;
}

