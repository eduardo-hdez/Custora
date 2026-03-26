import express from 'express';
import * as productoController from '../controllers/producto.controller.js';
import {requireRol, ROL_EMPLEADO} from '../middleware/auth.middleware.js';
import campanaController from '../controllers/campana.controller.js';

const router = express.Router();
router.use(requireRol([ROL_EMPLEADO]));

router.get('/', (request, response) => {
  response.render('empleado/catalogo-productos', {title: 'Catalogo de Productos'});
});

router.get('/catalogo', (request, response) => {
  response.render('empleado/catalogo-productos', {title: 'Catalogo de Productos'});
});

router.get('/detalle-producto', (request, response) => {
  response.render('empleado/detalle-producto', {title: 'Detalle de Producto'});
});

router.get('/gestion-productos', productoController.renderGestionProductos);

router.get('/gestion-productos/anadir-producto', (request, response) => {
  const success = request.query.success === '1';
  response.render('empleado/anadir-producto', {title: 'Añadir Producto', success});
});

router.post('/gestion-productos/anadir-producto', productoController.anadirProducto);

router.post('/gestion-productos/deshabilitar', productoController.deshabilitarProductos);

router.get('/tabla-reservas', (request, response) => {
  response.render('empleado/tabla-reservas', {title: 'Tabla de Reservas'});
});

router.get('/detalle-reserva', (request, response) => {
  response.render('empleado/detalle-reserva', {title: 'Detalle de Reserva'});
});

router.get('/reporte', (request, response) => {
  response.render('empleado/reporte', {title: 'Reporte'});
});

router.get('/campanas', campanaController.renderCampanas);

router.get('/campanas/nueva', campanaController.renderNuevaCampana);
router.post('/campanas/nueva', campanaController.crearCampanaPost);

router.get('/campanas/:id/banners', campanaController.renderBannersCampana);

export default router;
