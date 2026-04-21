import Carrito from '../models/carrito.model.js';

export async function injectCantidadProductosCarrito(request, response, next) {
  response.locals.cantidadProductosCarrito = 0;

  const idConcesionaria = request.session?.idConcesionaria;
  if (!idConcesionaria) return next();

  const {data: carrito, error} = await Carrito.getCartById(idConcesionaria);
  if (error || !carrito?.productos_seleccionados) return next();

  response.locals.cantidadProductosCarrito = carrito.productos_seleccionados.reduce((total, item) => {
    const cantidad = Number(item.cantidad) || 0;
    return total + Math.max(0, cantidad);
  }, 0);

  next();
}
