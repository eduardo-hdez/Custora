export function postCambiarCuenta(request, response) {
  const {idConcesionaria} = request.body;
  const concesionarias = request.session.concesionarias ?? [];

  const valida = concesionarias.includes(idConcesionaria);
  if (!valida) {
    return response.redirect('/cliente/catalogo');
  }

  request.session.idConcesionaria = idConcesionaria;
  response.redirect('/cliente/catalogo');
}
