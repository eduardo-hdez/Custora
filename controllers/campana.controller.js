const campanaModel = require('../models/campana.model');

function toISODate(value) {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
}

function clasificarCampana(fechaInicio, fechaFin) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  if (fin < hoy) return 'pasada';
  if (inicio > hoy) return 'programada';
  return 'actual';
}

async function renderCampanas(request, response) {
  try {
    const campanasDb = await campanaModel.listarCampanas();

    const campanas = campanasDb.map((item) => ({
      id: item.id_campaña,
      nombre: item.nombre_campaña,
      fechaInicio: toISODate(item.fecha_inicio),
      fechaFin: toISODate(item.fecha_fin),
      estadoCalculado: clasificarCampana(item.fecha_inicio, item.fecha_fin),
    }));

    return response.render('empleado/campaña', {
      title: 'Campañas',
      campanasPasadas: campanas.filter((c) => c.estadoCalculado === 'pasada'),
      campanaActual: campanas.filter((c) => c.estadoCalculado === 'actual'),
      campanasProgramadas: campanas.filter((c) => c.estadoCalculado === 'programada'),
    });
  } catch (error) {
    console.error('Error al listar campañas:', error.message);
    return response.status(500).render('empleado/campaña', {
      title: 'Campañas',
      campanasPasadas: [],
      campanaActual: [],
      campanasProgramadas: [],
    });
  }
}

function renderNuevaCampana(request, response) {
  return response.render('empleado/campaña-nueva', { title: 'Nueva campaña' });
}

function renderBannersCampana(request, response) {
  return response.render('empleado/campaña-banners', {
    title: 'Banners de la campaña',
    campanaId: request.params.id,
  });
}

module.exports = {
  renderCampanas,
  renderNuevaCampana,
  renderBannersCampana,
};
