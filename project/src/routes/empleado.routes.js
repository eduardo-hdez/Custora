import express from 'express';
import * as productoController from '../controllers/producto.controller.js';
import { requireRol, ROL_EMPLEADO } from '../middleware/auth.middleware.js';
import { parseProductoMultipart } from '../middleware/uploadProducto.middleware.js';
import { parseCampanaMultipart, parseCampanaEditMultipart } from '../middleware/uploadCampana.middleware.js';
import campanaController from '../controllers/campana.controller.js';
import * as reservaController from '../controllers/reserva.controller.js';
import * as reporteController from '../controllers/reporte.controller.js';
import { uploadCargaMasiva } from '../middleware/uploadCargaMasiva.middleware.js';

const router = express.Router();
router.use(requireRol([ROL_EMPLEADO]));

router.get('/', productoController.renderCatalogoEmpleado);
router.get('/catalogo', productoController.renderCatalogoEmpleado);
router.post('/catalogo-productos/deshabilitar', productoController.deshabilitarProductosCatalogo);

router.get('/producto/editar/:id',productoController.getEditarProducto);
router.post('/producto/editar/:id', parseProductoMultipart,productoController.postEditarProducto);

router.get('/detalle-producto/:id', productoController.renderDetalleProductoEmpleado);

router.get('/gestion-productos', productoController.renderGestionProductos);

router.get('/gestion-productos/anadir-producto', productoController.renderAnadirProducto);

router.post(
  '/gestion-productos/anadir-producto',
  parseProductoMultipart,
  productoController.postAnadirProducto,
);

router.post('/gestion-productos/carga-masiva', uploadCargaMasiva.single('cargaMasiva'), productoController.postCargaMasiva);

router.post('/gestion-productos/deshabilitar', productoController.deshabilitarProductos);

router.post('/gestion-productos/rehabilitar', productoController.rehabilitarProductos);

router.get('/tabla-reservas', reservaController.renderTablaReservas);

router.get('/detalle-reserva', (request, response) => {
  response.render('empleado/detalle-reserva', { title: 'Detalle de Reserva' });
});

router.get('/reporte', reporteController.renderReporte);

router.get('/campanas', campanaController.renderCampanas);
router.get('/campanas/nueva', campanaController.renderNuevaCampana);
router.post('/campanas/nueva', parseCampanaMultipart, campanaController.crearCampanaPost);
router.get('/campanas/:id/editar', campanaController.renderEditarCampana);
router.post('/campanas/:id/editar', parseCampanaEditMultipart, campanaController.editarCampanaPost);
router.get('/campanas/:id/banners', campanaController.renderBannersCampana);
router.post('/campanas/:id/estado', campanaController.toggleEstadoCampana);

export default router;
