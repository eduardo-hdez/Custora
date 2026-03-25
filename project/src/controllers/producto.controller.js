import Producto from '../models/producto.model.js';

export const post_anadirProducto = (request, response, next) => {
    const producto = new Producto(request.body.idProducto, request.body.nombreProducto,
        request.body.descripcion, request.body.precio, request.body.foto,
        request.body.pesoUnidad, request.body.unidadVenta, request.body.idCampania); //instancia de la clase
    producto.save()
        .then(({ data, error }) => {
            if (error) {
                console.log(error);
                throw error;
            }
            return response.redirect('/empleado/gestion-productos/anadir-producto');
        })
        .catch((error) => {
            console.log(error);
        });
};