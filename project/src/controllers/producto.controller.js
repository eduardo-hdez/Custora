import Producto from '../models/producto.model.js';
import Campana from '../models/campana.model.js';
import {uploadProductoImagen} from '../utils/productoImagenStorage.js';

const SESSION_ANADIR_PRODUCTO_ERROR = 'anadirProductoError';
export async function renderDetalleProductoCliente(request, response) {
  const {id} = request.params;

  try {
    const {data, error} = await Producto.findById(id);

    if (error || data == null) {
      console.log(error);
      return response.status(404).render('cliente/detalle-producto', {
        title: 'Producto no encontrado',
        producto: null,
        errorDetalle: 'El producto solicitado no existe o ya no está disponible.',
      });
    }

    const nombre =
      data.nombre_producto || data.nombre || 'Producto';

    return response.render('cliente/detalle-producto', {
      title: nombre,
      producto: data,
      errorDetalle: null,
    });
  } catch (err) {
    return response.status(500).render('cliente/detalle-producto', {
      title: 'Error',
      producto: null,
      errorDetalle: 'No se pudo cargar el producto en este momento.',
    });
  }
}

export async function renderCatalogoCliente(request, response) {
  try {
    const [{data, error}, vistaCampaña] = await Promise.all([
      Producto.fetchAll(),
      Campana.getVistaCatalogoCampañaActiva(),
    ]);

    if (error) {
      throw error;
    }

    response.render('cliente/catalogo-productos', {
      title: 'Catálogo de Productos',
      productos: data || [],
      errorCatalogo: null,
      ...vistaCampaña,
    });
  } catch (error) {
    response.status(500).render('cliente/catalogo-productos', {
      title: 'Catálogo de Productos',
      productos: [],
      errorCatalogo: 'No se pudo cargar el catálogo en este momento.',
      ...Campana.CATALOGO_CAMPANA_FALLBACK,
    });
  }
}

export async function renderDetalleProductoEmpleado(request, response) {
  const {id} = request.params;

  try {
    const {data, error} = await Producto.findById(id);

    if (error || data == null) {
      return response.status(404).render('empleado/detalle-producto', {
        title: 'Producto no encontrado',
        producto: null,
        errorDetalle: 'El producto solicitado no existe o ya no está disponible.',
      });
    }

    const nombre = data.nombre_producto || data.nombre || 'Producto';

    return response.render('empleado/detalle-producto', {
      title: nombre,
      producto: data,
      errorDetalle: null,
    });
  } catch (err) {
    return response.status(500).render('empleado/detalle-producto', {
      title: 'Error',
      producto: null,
      errorDetalle: 'No se pudo cargar el producto en este momento.',
    });
  }
}

export async function renderCatalogoEmpleado(request, response) {
  try {
    const [{data, error}, vistaCampaña] = await Promise.all([
      Producto.fetchAll(),
      Campana.getVistaCatalogoCampañaActiva(),
    ]);

    if (error) {
      throw error;
    }

    response.render('empleado/catalogo-productos', {
      title: 'Catálogo de Productos',
      productos: data || [],
      errorCatalogo: null,
      mostrarLinkEditarCampana: true,
      ...vistaCampaña,
    });
  } catch (error) {
    response.status(500).render('empleado/catalogo-productos', {
      title: 'Catálogo de Productos',
      productos: [],
      errorCatalogo: 'No se pudo cargar el catálogo en este momento.',
      ...Campana.CATALOGO_CAMPANA_FALLBACK,
    });
  }
}

export async function renderAnadirProducto(request, response) {
  const success = request.query.success === '1';
  let errorMessage = request.session[SESSION_ANADIR_PRODUCTO_ERROR] ?? null;
  let campanas = [];
  let idCampanaActiva = null;

  if (errorMessage != null) {
    delete request.session[SESSION_ANADIR_PRODUCTO_ERROR];
  }
  if (!errorMessage && request.query.error === '1') {
    errorMessage =
        'Lo siento, ocurrió un error al añadir el producto a la base de datos. Revisa los datos e intenta de nuevo.';
  }

  try {
    const [campanasDb, campanaActiva] = await Promise.all([
      Campana.listarCampanas(),
      Campana.getCampanaActiva(),
    ]);

    campanas = campanasDb || [];
    idCampanaActiva = campanaActiva?.id_campana ?? null;
  } catch (error) {
    console.error('Error al cargar campañas para añadir producto:', error.message);
    if (!errorMessage) {
      errorMessage = 'No se pudieron cargar las campañas disponibles. Intenta de nuevo.';
    }
  }

  response.render('empleado/anadir-producto', {
    title: 'Añadir Producto',
    success,
    errorMessage,
    campanas,
    idCampanaActiva,
  });
}

export async function postAnadirProducto(request, response) {
  try {
    const file = request.file;
    if (!file) {
      request.session[SESSION_ANADIR_PRODUCTO_ERROR] =
          'Selecciona una imagen del producto (JPEG, JPG, PNG).';
      return response.redirect('/empleado/gestion-productos/anadir-producto');
    }

    const {publicUrl: foto} = await uploadProductoImagen(
        file.buffer,
        file.mimetype,
        request.body.idProducto,
    );

    const producto = new Producto(
        request.body.idProducto,
        request.body.nombreProducto,
        request.body.descripcion,
        request.body.precio,
        foto,
        request.body.pesoUnidad,
        request.body.unidadVenta,
        request.body.idCampana,
    );

    const {error} = await producto.save();
    if (error) {
      console.log(error);
      throw error;
    }
    return response.redirect('/empleado/gestion-productos/anadir-producto?success=1');
  } catch (error) {
    console.log(error);
    request.session[SESSION_ANADIR_PRODUCTO_ERROR] =
        'Lo siento, ocurrió un error al añadir el producto a la base de datos. Revisa los datos e intenta de nuevo.';
    return response.redirect('/empleado/gestion-productos/anadir-producto');
  }
}

export async function renderGestionProductos(request, response) {
  const success = request.query.success;
  const errorHabilitado = request.query.errorHabilitado === '1';
  try {
    const {data, error} = await Producto.fetchAllGestion();
    if (error) {
      throw error;
    }
    response.render('empleado/gestion-productos', {
      title: 'Gestión de Productos',
      productos: data || [],
      errorRecuperacion: null,
      errorHabilitado,
      success,
    });
  } catch (error) {
    response.status(500).render('empleado/gestion-productos', {
      title: 'Gestión de Productos',
      productos: [],
      errorRecuperacion: 1,
      errorHabilitado,
      success,
    });
  }
}

export async function deshabilitarProductos(request, response) {
  try {
    let productosDeshabilitar = request.body.productosDeshabilitar || [];

    if (!Array.isArray(productosDeshabilitar)) {
      productosDeshabilitar = [productosDeshabilitar];
    }

    if (productosDeshabilitar.length === 0) {
      // Respuesta AJAX
      if (request.xhr || request.headers.accept?.includes('application/json')) {
        return response.status(400).json({
          success: false,
          error: 'No hay productos seleccionados',
        });
      }
      // Fallback para formularios tradicionales
      return response.redirect('/empleado/gestion-productos?error=sin-seleccion');
    }

    const {error} = await Producto.deshabilitar(productosDeshabilitar);

    if (error) {
      console.error(error);
      throw error;
    }

    // Respuesta AJAX
    if (request.xhr || request.headers.accept?.includes('application/json')) {
      return response.json({
        success: true,
        message: 'Producto(s) deshabilitado(s) exitosamente',
        productos: productosDeshabilitar,
      });
    }

    // Fallback para formularios tradicionales
    return response.redirect('/empleado/gestion-productos?success=deshabilitar');
  } catch (error) {
    // Respuesta AJAX
    if (request.xhr || request.headers.accept?.includes('application/json')) {
      return response.status(500).json({
        success: false,
        error: 'Error al deshabilitar productos',
      });
    }
    // Fallback para formularios tradicionales
    return response.redirect('/empleado/gestion-productos?errorHabilitado=1');
  }
}

export async function rehabilitarProductos(request, response) {
  try {
    let productosRehabilitar = request.body.productosRehabilitar || [];

    if (!Array.isArray(productosRehabilitar)) {
      productosRehabilitar = [productosRehabilitar];
    }

    if (productosRehabilitar.length === 0) {
      // Respuesta AJAX
      if (request.xhr || request.headers.accept?.includes('application/json')) {
        return response.status(400).json({
          success: false,
          error: 'No hay productos seleccionados',
        });
      }
      // Fallback para formularios tradicionales
      return response.redirect('/empleado/gestion-productos?error=sin-seleccion');
    }

    const {error} = await Producto.rehabilitar(productosRehabilitar);

    if (error) {
      console.error(error);
      throw error;
    }

    // Respuesta AJAX
    if (request.xhr || request.headers.accept?.includes('application/json')) {
      return response.json({
        success: true,
        message: 'Producto(s) rehabilitado(s) exitosamente',
        productos: productosRehabilitar,
      });
    }

    // Fallback para formularios tradicionales
    return response.redirect('/empleado/gestion-productos?success=rehabilitar');
  } catch (error) {
    // Respuesta AJAX
    if (request.xhr || request.headers.accept?.includes('application/json')) {
      return response.status(500).json({
        success: false,
        error: 'Error al rehabilitar productos',
      });
    }
    // Fallback para formularios tradicionales
    return response.redirect('/empleado/gestion-productos?errorHabilitado=1');
  }
}

export async function deshabilitarProductosCatalogo(request, response) {
  try {
    let productosSeleccionados = request.body.productosSeleccionados || [];

    if (!Array.isArray(productosSeleccionados)) {
      productosSeleccionados = [productosSeleccionados];
    }

    if (productosSeleccionados.length === 0) {
      return response.redirect('/empleado/catalogo?error=sin-seleccion');
    }

    const {error} = await Producto.deshabilitar(productosSeleccionados);

    if (error) {
      console.error(error);
      throw error;
    }
    return response.redirect('/empleado/catalogo?success=deshabilitar');
  } catch (error) {
    return response.redirect('/empleado/catalogo?errorModificar=1');
  }
}

async function getEditarProducto(request, response) {
  try {
    const producto = await productoModel.obtenerProductoPorId(request.params.id);
    if (!producto) {
      return response.status(404).redirect('/empleado/catalogo-productos');
    }

    const campanas = await campanaModel.obtenerCampanas();
    const idCampanaActiva = campanas.find(c => c.activa)?.id ?? null;

    const errorSession = request.session[SESSION_EDITAR_PRODUCTO_ERROR] ?? null;
    if (errorSession) {
      delete request.session[SESSION_EDITAR_PRODUCTO_ERROR];
    }

    return response.render('empleado/editar-producto', {
      title: 'Editar producto',
      campanas,
      idCampanaActiva,
      errorMessage: errorSession,
      success: null,
      producto: {
        idProducto: producto.id,
        nombreProducto: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        foto: producto.foto,
        pesoUnidad: producto.pesoUnidad,
        unidadVenta: producto.unidadVenta,
        idCampana: producto.idCampana,
        habilitado: producto.habilitado,
      },
    });
  } catch (error) {
    console.error('Error al cargar producto:', error.message);
    return response.redirect('/empleado/catalogo-productos');
  }
} 