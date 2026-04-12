import Producto from '../models/producto.model.js';

export async function renderDetalleProductoCliente(request, response) {
  const { id } = request.params;

  try {
    const { data, error } = await Producto.findById(id);

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
    const { data, error } = await Producto.fetchAll();

    if (error) {
      throw error;
    }

    response.render('cliente/catalogo-productos', {
      title: 'Catálogo de Productos',
      productos: data || [],
      errorCatalogo: null,
    });
  } catch (error) {
    response.status(500).render('cliente/catalogo-productos', {
      title: 'Catálogo de Productos',
      productos: [],
      errorCatalogo: 'No se pudo cargar el catálogo en este momento.',
    });
  }
}

export async function renderAnadirProducto(request, response) {
  const success = request.query.success === '1';
  const error = request.query.error === '1';
  response.render('empleado/anadir-producto', { title: 'Añadir Producto', success, error });
}

export function postAnadirProducto(request, response, next) {
  const producto = new Producto(request.body.idProducto, request.body.nombreProducto,
    request.body.descripcion, request.body.precio, request.body.foto,
    request.body.pesoUnidad, request.body.unidadVenta, request.body.idCampana); // instancia de la clase
  producto.save()
    .then(({ data, error }) => {
      if (error) {
        console.log(error);
        throw error;
      }
      return response.redirect('/empleado/gestion-productos/anadir-producto?success=1');
    })
    .catch((error) => {
      console.log(error);
      return response.redirect('/empleado/gestion-productos/anadir-producto?error=1');
    });
}

export async function renderGestionProductos(request, response) {
  const success = request.query.success;
  const errorModificar = request.query.errorModificar === '1';
  try {
    const { data, error } = await Producto.fetchAllGestion();
    if (error) {
      throw error;
    }
    response.render('empleado/gestion-productos', {
      title: 'Gestión de Productos',
      productos: data || [],
      errorRecuperacion: null,
      errorModificar,
      success,
    });
  } catch (error) {
    response.status(500).render('empleado/gestion-productos', {
      title: 'Gestión de Productos',
      productos: [],
      errorRecuperacion: 1,
      errorModificar,
      success
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
      return response.redirect('/empleado/gestion-productos?error=sin-seleccion');
    }

    const { error } = await Producto.deshabilitar(productosDeshabilitar);

    if (error) {
      console.error(error);
      throw error;
    }
    return response.redirect('/empleado/gestion-productos?success=deshabilitar');

  } catch (error) {
    return response.redirect('/empleado/gestion-productos?errorModificar=1');
  }
}

export async function rehabilitarProductos(request, response) {
  try {
    let productosRehabilitar = request.body.productosRehabilitar || [];

    if (!Array.isArray(productosRehabilitar)) {
      productosRehabilitar = [productosRehabilitar];
    }

    if (productosRehabilitar.length === 0) {
      return response.redirect('/empleado/gestion-productos?error=sin-seleccion');
    }

    const { error } = await Producto.rehabilitar(productosRehabilitar);

    if (error) {
      console.error(error);
      throw error;
    }
    return response.redirect('/empleado/gestion-productos?success=rehabilitar');

  } catch (error) {
    return response.redirect('/empleado/gestion-productos?errorModificar=1');
  }
}
