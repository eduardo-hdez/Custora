const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');

router.get('/', (request, response) => {
  response.render('empleado/catalogo-productos', { title: 'Catalogo de Productos' });
});

router.get('/catalogo', (request, response) => {
  response.render('empleado/catalogo-productos', { title: 'Catalogo de Productos' });
});

router.get('/detalle-producto', (request, response) => {
  response.render('empleado/detalle-producto', { title: 'Detalle de Producto' });
});

router.get('/gestion-productos', (request, response) => {
  response.render('empleado/gestion-productos', { title: 'Gestión de Productos' });
});

router.get('/gestion-productos/anadir-producto', (request, response) => {
  const success = request.query.success === '1';
  response.render('empleado/anadir-producto', { title: 'Añadir Producto', success });
});

router.post('/gestion-productos/anadir-producto', productoController.post_anadirProducto);

router.get('/tabla-reservas', (request, response) => {
  response.render('empleado/tabla-reservas', { title: 'Tabla de Reservas' });
});

router.get('/detalle-reserva', (request, response) => {
  response.render('empleado/detalle-reserva', { title: 'Detalle de Reserva' });
});

router.get('/reporte', (request, response) => {
  response.render('empleado/reporte', { title: 'Reporte' });
});

module.exports = router;
