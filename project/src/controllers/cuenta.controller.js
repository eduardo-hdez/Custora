export function postCambiarCuenta(request, response) {
  const {idConcesionaria, returnTo} = request.body;
  const concesionarias = request.session.concesionarias ?? [];
  const fallbackPath = '/cliente/catalogo';
  const redirectPath =
    typeof returnTo === 'string' && returnTo.startsWith('/cliente') ?
      returnTo :
      fallbackPath;

  const valida = concesionarias.includes(idConcesionaria);
  if (!valida) {
    if (request.xhr || request.headers.accept?.includes('application/json')) {
      return response.status(400).json({
        success: false,
        error: 'Concesionaria no válida',
      });
    }
    return response.redirect(redirectPath);
  }

  request.session.idConcesionaria = idConcesionaria;

  return request.session.save((saveError) => {
    if (saveError) {
      console.error('Error al guardar sesión al cambiar cuenta:', saveError);
      if (request.xhr || request.headers.accept?.includes('application/json')) {
        return response.status(500).json({
          success: false,
          error: 'No se pudo actualizar la cuenta',
        });
      }
      return response.redirect('/cliente/catalogo');
    }

    if (request.xhr || request.headers.accept?.includes('application/json')) {
      return response.json({
        success: true,
        message: 'Cuenta actualizada correctamente',
        idConcesionaria: idConcesionaria,
        redirectTo: redirectPath,
      });
    }
    return response.redirect(redirectPath);
  });
}
