import Producto from '../models/producto.model.js';

export async function renderCatalogoCliente(request, response) {
  try {
    const { data, error } = await Producto.fetchAll();

    if (error) {
      throw error;
    }

    response.render('cliente/catalogo-productos', {
      title: 'Catálogo de Productos',
      productos: data || [],
      errorCatalogo: null
    });
  } catch (error) {
    response.status(500).render('cliente/catalogo-productos', {
      title: 'Catálogo de Productos',
      productos: [],
      errorCatalogo: 'No se pudo cargar el catálogo en este momento.'
    });
  }
}

export function anadirProducto(request, response, next) {
    const producto = new Producto(request.body.idProducto, request.body.nombreProducto,
        request.body.descripcion, request.body.precio, request.body.foto,
        request.body.pesoUnidad, request.body.unidadVenta, request.body.idCampania); //instancia de la clase
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
        });
}
