export function postCambiarCuenta(request, response) {
  const {idConcesionaria} = request.body;
  const concesionarias = request.session.concesionarias ?? [];

  const valida = concesionarias.includes(idConcesionaria);
  if (!valida) {
    if (request.xhr || request.headers.accept?.includes('application/json')) {
      return response.status(400).json({
        success: false,
        error: 'Concesionaria no válida',
      });
    }
    return response.redirect('/cliente/catalogo');
  }

  request.session.idConcesionaria = idConcesionaria;

  if (request.xhr || request.headers.accept?.includes('application/json')) {
    return response.json({
      success: true,
      message: 'Cuenta actualizada correctamente',
      idConcesionaria: idConcesionaria,
    });
  }
  response.redirect('/cliente/catalogo');
}
