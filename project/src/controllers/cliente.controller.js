import Concesionaria from '../models/concesionaria.model.js';

export async function renderPerfil(request, response) {
  const idUsuario = request.session.idUsuario;
  const idConcesionariaActiva = request.session.idConcesionaria;
  const correo = request.session.correo;

  try {
    // 1. Obtener todas las concesionarias asociadas al usuario
    const { data: concesionariasData, error: errorConcesionarias } = await Concesionaria.findByUsuario(idUsuario);
    
    if (errorConcesionarias) {
      console.error('Error al obtener concesionarias del usuario:', errorConcesionarias);
      throw errorConcesionarias;
    }

    // 2. Para cada concesionaria, obtener sus sucursales
    const concesionariasConSucursales = await Promise.all(
      (concesionariasData || []).map(async (concesionaria) => {
        const { data: sucursales, error: errorSucursales } = await Concesionaria.getSucursales(concesionaria.id_concesionaria);
        
        if (errorSucursales) {
          console.error(`Error al obtener sucursales para concesionaria ${concesionaria.id_concesionaria}:`, errorSucursales);
          return {
            ...concesionaria,
            sucursales: []
          };
        }

        return {
          ...concesionaria,
          sucursales: sucursales || []
        };
      })
    );

    // 3. Renderizar la vista
    response.render('cliente/info-perfil', {
      title: 'Información del Perfil',
      correo: correo,
      concesionarias: concesionariasConSucursales,
      idConcesionariaActiva: idConcesionariaActiva
    });

  } catch (error) {
    console.error('Error al renderizar perfil:', error);
    response.status(500).render('cliente/info-perfil', {
      title: 'Información del Perfil',
      correo: correo,
      concesionarias: [],
      idConcesionariaActiva: idConcesionariaActiva,
      error: 'No se pudo cargar la información del perfil.'
    });
  }
}
