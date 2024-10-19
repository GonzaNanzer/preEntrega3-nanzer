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


//Funciones:
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
    event.target.closest(".lineaProductos").querySelector(".totalInput").value = precioItemSeleccionado * cantidadSeleccionada;
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
} 

// 7 - Ir a la interfaz modificar y generar opciones en el dropdown
let botonModificar = document.querySelector(".btnModifica").addEventListener("click", ()=>{
    document.getElementById("interfazPedidos").classList.add("d-none");
    document.getElementById("interfazModificar").classList.remove("d-none");
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
        console.log(listadoProductos);

    //Usar los metodos de la clase producto para modificar los datos:
    //del precio:
        productosAmodificar.forEach((prod)=>{
            let existe = listadoProductos.find((obj) => obj.nombre === prod);
            console.log(existe);
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
        document.getElementById("interfazModificar").classList.add("d-none");
        document.getElementById("interfazPedidos").classList.remove("d-none");
    
});

// 10 - Agregar productos
