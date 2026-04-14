import express from 'express';
import * as productoController from '../controllers/producto.controller.js';
import { requireRol, ROL_EMPLEADO } from '../middleware/auth.middleware.js';
import campanaController from '../controllers/campana.controller.js';
import * as reservaController from '../controllers/reserva.controller.js';

const router = express.Router();
router.use(requireRol([ROL_EMPLEADO]));

router.get('/', productoController.renderCatalogoEmpleado);
router.get('/catalogo', productoController.renderCatalogoEmpleado);
router.post('/catalogo-productos/deshabilitar',productoController.deshabilitarProductosCatalogo);

router.get('/detalle-producto', (request, response) => {
  response.render('empleado/detalle-producto', { title: 'Detalle de Producto' });
});

router.get('/gestion-productos', productoController.renderGestionProductos);

router.get('/gestion-productos/anadir-producto', productoController.renderAnadirProducto);

router.post('/gestion-productos/anadir-producto', productoController.postAnadirProducto);

router.post('/gestion-productos/deshabilitar', productoController.deshabilitarProductos);

router.post('/gestion-productos/rehabilitar', productoController.rehabilitarProductos);

router.get('/tabla-reservas', reservaController.renderTablaReservas);

router.get('/detalle-reserva', (request, response) => {
  response.render('empleado/detalle-reserva', { title: 'Detalle de Reserva' });
});

router.get('/reporte', (request, response) => {
  response.render('empleado/reporte', { title: 'Reporte' });
});

router.get('/campanas', campanaController.renderCampanas);

router.get('/campanas/nueva', campanaController.renderNuevaCampana);
router.post('/campanas/nueva', campanaController.crearCampanaPost);

router.get('/campanas/:id/banners', campanaController.renderBannersCampana);

export default router;
