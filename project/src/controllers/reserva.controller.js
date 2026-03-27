import Reserva from '../models/reserva.model.js';
import Carrito from '../models/carrito.model.js';
import Campana from '../models/campana.model.js';
import {enviarConfirmacionReserva} from '../services/email.service.js';

export async function confirmarReserva(request, response) {
  const idConcesionaria = request.session.idConcesionaria;
  if (!idConcesionaria) return response.redirect('/login');

  const idSucursal = request.body.id_sucursal;
  if (!idSucursal) return response.redirect('/cliente/carrito-reserva');

  const { data: carrito, error: errorCarrito } = await Carrito.getCartById(idConcesionaria);
  if (errorCarrito || !carrito?.id_carrito) return response.redirect('/cliente/carrito-reserva');

  const productos = Array.isArray(carrito.productos_seleccionados) ? carrito.productos_seleccionados : [];
  if (productos.length === 0) return response.redirect('/cliente/carrito-reserva');

  const [folio, campana] = await Promise.all([
    Reserva.generarFolio(),
    Campana.getCampanaActiva(),
  ]);

  const { error: errorReserva } = await Reserva.crear(folio, idConcesionaria, idSucursal, campana?.id_campana);
  if (errorReserva) {
    console.error('[reserva] crear error:', errorReserva);
    return response.redirect('/cliente/carrito-reserva');
  }

  const { error: errorProductos } = await Reserva.insertarProductos(folio, productos);
  if (errorProductos) {
    console.error('[reserva] insertarProductos error:', errorProductos);
    return response.redirect('/cliente/carrito-reserva');
  }

  await Carrito.clearCart(carrito.id_carrito);

  enviarConfirmacionReserva(request.session.correo, folio, productos);

  return response.render('cliente/confirmacion-reserva', {
    title: 'Reserva Confirmada',
    folio,
  });
}
