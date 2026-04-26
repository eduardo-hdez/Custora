import Carrito from '../models/carrito.model.js';
import Concesionaria from '../models/concesionaria.model.js';

async function getOrCreateCarrito(idConcesionaria) {
  const {data: carrito, error: errorGet} = await Carrito.getCartById(idConcesionaria);
  if (errorGet) return {carrito: null, error: errorGet};
  if (carrito) return {carrito, error: null};

  const {data: created, error: errorCreate} = await Carrito.createNewCart(idConcesionaria);
  if (errorCreate) return {carrito: null, error: errorCreate};

  return {carrito: {...(created ?? {}), productos_seleccionados: []}, error: null};
}

export async function agregarProductoCarrito(request, response) {
  const idConcesionaria = request.session.idConcesionaria;
  if (!idConcesionaria) return response.redirect('/login');

  const idProducto = request.body.id_producto;
  const cantidad = Math.max(1, Number(request.body.cantidad) || 1);

  if (!idProducto) return response.redirect('/cliente/catalogo');

  const {carrito, error: errorCart} = await getOrCreateCarrito(idConcesionaria);
  if (errorCart || !carrito?.id_carrito) return response.redirect('/cliente/catalogo');

  const productosEnCarrito = Array.isArray(carrito.productos_seleccionados) ? carrito.productos_seleccionados : [];
  const idAgregar = String(idProducto);
  const yaEstaEnCarrito = productosEnCarrito.some((ps) => {
    const idLinea = ps.id_producto ?? ps.producto?.id_producto;
    return idLinea != null && String(idLinea) === idAgregar;
  });

  if (!yaEstaEnCarrito) {
    const {error: errorInsert} = await Carrito.insertToCart(carrito.id_carrito, idProducto, cantidad);
    if (errorInsert) return response.redirect('/cliente/catalogo');
  }

  return response.redirect('/cliente/catalogo');
}

export async function eliminarProductoCarrito(request, response) {
  const idConcesionaria = request.session.idConcesionaria;
  if (!idConcesionaria) return response.redirect('/login');

  const idProducto = request.body.id_producto;
  if (!idProducto) return response.redirect('/cliente/carrito-reserva');

  const {data: carrito, error} = await Carrito.getCartById(idConcesionaria);
  if (error || !carrito?.id_carrito) return response.redirect('/cliente/carrito-reserva');

  const {error: errorRemove} = await Carrito.removeFromCart(carrito.id_carrito, idProducto);
  if (errorRemove) return response.redirect('/cliente/carrito-reserva');

  return response.redirect('/cliente/carrito-reserva');
}

export async function actualizarCantidadProducto(request, response) {
  const idConcesionaria = request.session.idConcesionaria;
  if (!idConcesionaria) {
    return response.status(401).json({ok: false, error: 'No autorizado'});
  }

  const idProducto = request.params.id_producto;
  const accion = request.body.accion;
  const cantidadSolicitadaRaw = request.body.cantidad;
  const cantidadSolicitada = Number(cantidadSolicitadaRaw);
  const usaCantidadAbsoluta = cantidadSolicitadaRaw !== undefined && cantidadSolicitadaRaw !== '';

  if (!idProducto) {
    return response.status(400).json({ok: false, error: 'Parámetros inválidos'});
  }
  if (usaCantidadAbsoluta && (!Number.isFinite(cantidadSolicitada) || cantidadSolicitada < 0)) {
    return response.status(400).json({ok: false, error: 'Cantidad inválida'});
  }
  if (!usaCantidadAbsoluta && (accion !== '+' && accion !== '-')) {
    return response.status(400).json({ok: false, error: 'Parámetros inválidos'});
  }

  const {data: carrito, error} = await Carrito.getCartById(idConcesionaria);
  if (error || !carrito?.id_carrito) {
    return response.status(404).json({ok: false, error: 'Carrito no encontrado'});
  }

  const items = Array.isArray(carrito.productos_seleccionados) ? carrito.productos_seleccionados : [];
  const idParam = String(idProducto);
  const line = items.find((ps) => {
    const idLinea = ps.id_producto ?? ps.producto?.id_producto;
    return idLinea != null && String(idLinea) === idParam;
  });
  const cantidadActual = line ? Math.max(0, Number(line.cantidad) || 0) : 0;
  if (cantidadActual === 0) {
    return response.status(404).json({ok: false, error: 'Producto no encontrado en carrito'});
  }

  const nuevaCantidad = usaCantidadAbsoluta ?
    Math.max(0, Math.floor(cantidadSolicitada)) :
    (accion === '+' ? cantidadActual + 1 : cantidadActual - 1);
  const idProductoDb = line.id_producto ?? line.producto?.id_producto ?? idProducto;
  const {error: errorUpdate} = await Carrito.updateCartItemQuantity(
      carrito.id_carrito,
      idProductoDb,
      nuevaCantidad,
  );
  if (errorUpdate) {
    return response.status(500).json({ok: false, error: 'No se pudo actualizar la cantidad'});
  }

  return response.json({ok: true, cantidad: Math.max(0, nuevaCantidad)});
}

export async function renderCarritoCliente(request, response) {
  const idConcesionaria = request.session.idConcesionaria;
  if (!idConcesionaria) return response.redirect('/login');

  // Ambas consultas corren en paralelo para reducir tiempo de espera
  const [{carrito, error}, {data: sucursales}] = await Promise.all([
    getOrCreateCarrito(idConcesionaria),
    Concesionaria.getSucursales(idConcesionaria),
  ]);

  if (error) {
    return response.status(500).render('cliente/carrito-reserva', {
      title: 'Carrito',
      carrito: null,
      sucursales: [],
      errorCarrito: 'Error al obtener el carrito',
    });
  }

  return response.render('cliente/carrito-reserva', {
    title: 'Carrito',
    carrito,
    sucursales: sucursales ?? [],
    errorCarrito: null,
  });
}
