import express from 'express';
import * as productoController from '../controllers/producto.controller.js';
import {postCambiarCuenta} from '../controllers/cuenta.controller.js';
import {requireRol, ROL_CLIENTE} from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(requireRol([ROL_CLIENTE]));

router.get('/', productoController.renderCatalogoCliente);
router.get('/catalogo', productoController.renderCatalogoCliente);
router.get('/detalle-producto/:id', productoController.renderDetalleProductoCliente);

router.get('/carrito-reserva', (request, response) => {
  response.render('cliente/carrito-reserva', {title: 'Carrito'});
});

router.get('/historial-reservas', (request, response) => {
  response.render('cliente/historial-reservas', {title: 'Historial de Reservas'});
});

router.get('/detalle-reserva', (request, response) => {
  response.render('cliente/detalle-reserva', {title: 'Detalle de Reserva'});
});

router.get('/info-perfil', (request, response) => {
  response.render('cliente/info-perfil', {title: 'Información del Perfil'});
});

router.post('/cambiar-cuenta', postCambiarCuenta);

export default router;
