import Producto from '../models/producto.model.js';
import Campana from '../models/campana.model.js';
import { uploadProductoImagen } from '../utils/productoImagenStorage.js';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

const SESSION_ANADIR_PRODUCTO_ERROR = 'anadirProductoError';
const SESSION_EDITAR_PRODUCTO_ERROR = 'editarProductoError';

const MAX_COMENTARIO_LENGTH = 500;

const normalizeComentario = (comentarioRaw) => {
  if (typeof comentarioRaw !== 'string') return null;
  const comentario = comentarioRaw.trim();
  return comentario.length > 0 ? comentario : null;
};

const getFechaCalificacionHoy = () => new Date().toISOString().slice(0, 10);

export async function renderDetalleProductoCliente(request, response) {
  const { id } = request.params;
  const successCalificacion = request.query.calificacion === 'ok';
  const errorCalificacion = request.query.calificacion === 'error';

  try {
    const { data, error } = await Producto.findById(id);

    if (error || data == null) {
      console.log(error);
      return response.status(404).render('cliente/detalle-producto', {
        title: 'Producto no encontrado',
        producto: null,
        errorDetalle: 'El producto solicitado no existe o ya no está disponible.',
        mensajeCalificacion: null,
      });
    }

    const nombre =
      data.nombre_producto || data.nombre || 'Producto';

    return response.render('cliente/detalle-producto', {
      title: nombre,
      producto: data,
      errorDetalle: null,
      mensajeCalificacion: successCalificacion ?
        'Reseña publicada correctamente' :
        null,
      errorCalificacion: errorCalificacion ?
        'No se pudo registrar la reseña. Intenta nuevamente.' :
        null,
    });
  } catch (err) {
    return response.status(500).render('cliente/detalle-producto', {
      title: 'Error',
      producto: null,
      errorDetalle: 'No se pudo cargar el producto en este momento.',
      mensajeCalificacion: null,
    });
  }
}

export async function renderCalificacion(request, response) {
  const { id } = request.params;
  const errorCalificacion = request.query.error;

  try {
    const { data, error } = await Producto.findById(id);
    if (error || data == null) {
      return response.status(404).render('cliente/calificacion', {
        title: 'Calificar producto',
        producto: null,
        errorDetalle: 'El producto solicitado no existe o ya no está disponible.',
        errorCalificacion: null,
        formData: { puntuacion: '', comentario: '' },
      });
    }

    return response.render('cliente/calificacion', {
      title: 'Calificar producto',
      producto: data,
      errorDetalle: null,
      errorCalificacion: errorCalificacion || null,
      formData: { puntuacion: '', comentario: '' },
    });
  } catch (err) {
    return response.status(500).render('cliente/calificacion', {
      title: 'Calificar producto',
      producto: null,
      errorDetalle: 'No se pudo cargar el producto en este momento.',
      errorCalificacion: null,
      formData: { puntuacion: '', comentario: '' },
    });
  }
}

export async function registrarCalificacion(request, response) {
  const { id } = request.params;
  const idConcesionaria = request.session.idConcesionaria;
  const puntuacion = Number(request.body.puntuacion);
  const comentario = normalizeComentario(request.body.comentario);

  const { data: producto, error: errorProducto } = await Producto.findById(id);
  if (errorProducto || producto == null) {
    return response.status(404).render('cliente/calificacion', {
      title: 'Calificar producto',
      producto: null,
      errorDetalle: 'El producto solicitado no existe o ya no está disponible.',
      errorCalificacion: null,
      formData: { puntuacion: request.body.puntuacion || '', comentario: request.body.comentario || '' },
    });
  }

  if (!idConcesionaria) {
    return response.status(401).render('cliente/calificacion', {
      title: 'Calificar producto',
      producto,
      errorDetalle: null,
      errorCalificacion: 'No se encontró la concesionaria activa. Cambia de cuenta e intenta nuevamente.',
      formData: { puntuacion: request.body.puntuacion || '', comentario: request.body.comentario || '' },
    });
  }

  if (!Number.isFinite(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return response.status(400).render('cliente/calificacion', {
      title: 'Calificar producto',
      producto,
      errorDetalle: null,
      errorCalificacion: 'La puntuación debe ser un número entre 1 y 5.',
      formData: { puntuacion: request.body.puntuacion || '', comentario: request.body.comentario || '' },
    });
  }

  if (comentario != null && comentario.length > MAX_COMENTARIO_LENGTH) {
    return response.status(400).render('cliente/calificacion', {
      title: 'Calificar producto',
      producto,
      errorDetalle: null,
      errorCalificacion: `El comentario no puede exceder ${MAX_COMENTARIO_LENGTH} caracteres.`,
      formData: { puntuacion: request.body.puntuacion || '', comentario: request.body.comentario || '' },
    });
  }

  const { error: errorInsert } = await Producto.insertCalificacion({
    id_producto: id,
    id_concesionaria: idConcesionaria,
    puntuacion,
    comentario,
    fecha_calificacion: getFechaCalificacionHoy(),
  });

  if (errorInsert) {
    console.error('Error al registrar calificación:', errorInsert.message);
    return response.redirect(`/cliente/detalle-producto/${encodeURIComponent(id)}?calificacion=error`);
  }

  return response.redirect(`/cliente/detalle-producto/${encodeURIComponent(id)}?calificacion=ok`);
}

export async function renderCatalogoCliente(request, response) {
  try {
    const [{ data, error }, vistaCampaña] = await Promise.all([
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
  const { id } = request.params;

  try {
    const { data, error } = await Producto.findById(id);

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
    const [{ data, error }, vistaCampaña] = await Promise.all([
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

    const { publicUrl: foto } = await uploadProductoImagen(
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

    const { error } = await producto.save();
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

export async function postCargaMasiva(request, response) {
  try {
    if (!request.file) {
      return response.redirect('/empleado/gestion-productos?errorCargaMasiva=1');
    }
    const resultados = [];
    const errores = [];

    const stream = Readable.from(request.file.buffer);

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => {
          if (!row.id_producto || !row.nombre_producto || !row.descripcion_producto || !row.precio_producto || !row.peso_unidad || !row.unidad_venta_producto || !row.id_campana) {
            errores.push({ row, error: 'Campos obligatorios faltantes' });
            return;
          }
          resultados.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (errores.length > 0) {
      return response.redirect('/empleado/gestion-productos?errorCargaMasiva=1');
    }
    for (const fila of resultados) {
      try {
        await Producto.insertarFila(fila);
      } catch (error) {
        errores.push({ fila, error: error.message });
      }
    }

    if (errores.length > 0) {
      return response.redirect('/empleado/gestion-productos?errorCargaMasiva=1');
    }

    return response.redirect('/empleado/gestion-productos?success=carga-masiva');
  } catch (error) {
    console.error(error);
    return response.redirect('/empleado/gestion-productos?errorCargaMasiva=1');
  }

}

export async function renderGestionProductos(request, response) {
  const success = request.query.success;
  const errorHabilitado = request.query.errorHabilitado === '1';
  const errorCargaMasiva = request.query.errorCargaMasiva === '1';
  try {
    const { data, error } = await Producto.fetchAllGestion();
    if (error) {
      throw error;
    }
    response.render('empleado/gestion-productos', {
      title: 'Gestión de Productos',
      productos: data || [],
      errorRecuperacion: null,
      errorHabilitado,
      errorCargaMasiva,
      success,
    });
  } catch (error) {
    response.status(500).render('empleado/gestion-productos', {
      title: 'Gestión de Productos',
      productos: [],
      errorRecuperacion: 1,
      errorHabilitado,
      errorCargaMasiva,
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

    const { error } = await Producto.deshabilitar(productosDeshabilitar);

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

    const { error } = await Producto.rehabilitar(productosRehabilitar);

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

    const { error } = await Producto.deshabilitar(productosSeleccionados);

    if (error) {
      console.error(error);
      throw error;
    }
    return response.redirect('/empleado/catalogo?success=deshabilitar');
  } catch (error) {
    return response.redirect('/empleado/catalogo?errorModificar=1');
  }
}

export async function getEditarProducto(request, response) {
  try {
    console.log('ID recibido:', request.params.id);
    const producto = await Producto.obtenerProductoPorId(request.params.id);
    console.log('Producto obtenido:', producto);
    if (!producto) {
      return response.status(404).redirect('/empleado/catalogo');
    }

  const [campanas, campanaActiva] = await Promise.all([
  Campana.listarCampanas(),
  Campana.getCampanaActiva(),
]);
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
    return response.redirect('/empleado/catalogo');
  }
} 

export async function postEditarProducto(request, response) {
  try {
    const { idProducto, nombreProducto, descripcion, precio, pesoUnidad, unidadVenta, idCampana, habilitado } = request.body;

    let fotoUrl = null;

    // Solo sube imagen si el usuario mandó una nueva
    if (request.file) {
      const { publicUrl } = await uploadProductoImagen(
        request.file.buffer,
        request.file.mimetype,
        idProducto,
      );
      fotoUrl = publicUrl;
    }

    await Producto.actualizarProducto({
      idProducto,
      nombreProducto,
      descripcion,
      precio,
      pesoUnidad,
      unidadVenta,
      idCampana,
      habilitado: habilitado === 'true',
      foto: fotoUrl, // null si no se subió nueva → COALESCE en el RPC conserva la anterior
    });

    return response.redirect(`/empleado/catalogo`);

  } catch (error) {
    console.error('Error al editar producto:', error.message);
    request.session[SESSION_EDITAR_PRODUCTO_ERROR] = 'Ocurrió un error al guardar los cambios.';
    return response.redirect(`/empleado/producto/editar/${request.body.idProducto}`);
  }
}