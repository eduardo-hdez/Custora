import Producto from '../models/producto.model.js';

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
    const {data, error} = await Producto.fetchAll();

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

export function anadirProducto(request, response, next) {
  const producto = new Producto(request.body.idProducto, request.body.nombreProducto,
      request.body.descripcion, request.body.precio, request.body.foto,
      request.body.pesoUnidad, request.body.unidadVenta, request.body.idCampania); // instancia de la clase
  producto.save()
      .then(({data, error}) => {
        if (error) {
          console.log(error);
          throw error;
        }
        return response.redirect('/empleado/gestion-productos/anadir-producto?success=1');
      })
      .catch((error) => {
        console.log(error);
      });
}

export async function renderGestionProductos(request, response) {
  try {
    const {data, error} = await Producto.fetchAll();

    if (error) {
      throw error;
    }

    response.render('empleado/gestion-productos', {
      title: 'Gestión de Productos',
      productos: data || [],
      errorCatalogo: null,
    });
  } catch (error) {
    response.status(500).render('empleado/gestion-productos', {
      title: 'Gestión de Productos',
      productos: [],
      errorCatalogo: 'No se pudieron cargar los productos en este momento.',
    });
  }
}

export async function deshabilitarProductos(request, response) {
  try {
    let productosSeleccionados = request.body.productosSeleccionados || [];

    if (!Array.isArray(productosSeleccionados)) {
      productosSeleccionados = [productosSeleccionados];
    }

    if (productosSeleccionados.length === 0) {
      return response.redirect('/empleado/gestion-productos?error=sin-seleccion');
    }

    const {error} = await Producto.deshabilitar(productosSeleccionados);

    if (error) {
      console.error(error);
      return response.redirect('/empleado/gestion-productos?error=deshabilitar');
    }
    return response.redirect('/empleado/gestion-productos?success=deshabilitados');
  } catch (error) {
    console.error(error);
    return response.redirect('/empleado/gestion-productos?error=deshabilitar');
  }
}
