import express from 'express';
import * as productoController from '../controllers/producto.controller.js';
import * as carritoController from '../controllers/carrito.controller.js';
import {confirmarReserva, getHistorialReservas, postCancelarReserva} from '../controllers/reserva.controller.js';
import {postCambiarCuenta} from '../controllers/cuenta.controller.js';
import {requireRol, ROL_CLIENTE} from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(requireRol([ROL_CLIENTE]));

router.get('/', productoController.renderCatalogoCliente);
router.get('/catalogo', productoController.renderCatalogoCliente);
router.get('/detalle-producto/:id', productoController.renderDetalleProductoCliente);

router.get('/carrito-reserva', carritoController.renderCarritoCliente);
router.post('/carrito/agregar', carritoController.agregarProductoCarrito);
router.post('/carrito/eliminar', carritoController.eliminarProductoCarrito);
router.post('/carrito/actualizar/:id_producto', carritoController.actualizarCantidadProducto);
router.post('/reserva/confirmar', confirmarReserva);
router.get('/historial-reservas', getHistorialReservas);
router.post('/reserva/:folio/cancelar', postCancelarReserva);

router.get('/detalle-reserva', (request, response) => {
  response.render('cliente/detalle-reserva', {title: 'Detalle de Reserva'});
});

router.get('/info-perfil', (request, response) => {
  response.render('cliente/info-perfil', {title: 'Información del Perfil'});
});

router.post('/cambiar-cuenta', postCambiarCuenta);

export default router;
