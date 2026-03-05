const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  response.render('cliente/catalogo_productos', { title: 'Catalogo de Productos' });
});

router.get('/catalogo', (request, response) => {
  response.render('cliente/catalogo_productos', { title: 'Catalogo de Productos' });
});

router.get('/carrito', (request, response) => {
  response.render('cliente/carrito_reserva', { title: 'Carrito' });
});

router.get('/detalle_producto', (request, response) => {
  response.render('cliente/detalle_producto', { title: 'Detalle de Producto' });
});

router.get('/historial_reservas', (request, response) => {
  response.render('cliente/historial_reservas', { title: 'Historial de Reservas' });
});

router.get('/detalle_reserva', (request, response) => {
  response.render('cliente/detalle_reserva', { title: 'Detalle de Reserva' });
});

router.get('/info_perfil', (request, response) => {
  response.render('cliente/info_perfil', { title: 'Información del Perfil' });
});

module.exports = router;
