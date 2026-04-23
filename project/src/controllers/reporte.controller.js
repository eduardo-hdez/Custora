import { fetchDemandaProductosRanking } from '../models/reporte.model.js';

export async function renderReporte(request, response) {
  const base = {
    title: 'Reporte de Reservas',
    fechaActualizacion: new Date(),
  };

  try {
    const demanda = await fetchDemandaProductosRanking(3);

    return response.render('empleado/reporte', {
      ...base,
      errorReporte: null,
      ...demanda,
    });
  } catch (error) {
    console.error('[reporte] Error al generar el reporte:', error);

    return response.status(500).render('empleado/reporte', {
      ...base,
      errorReporte: 'No se pudo cargar el reporte en este momento.',
      productosMasSolicitados: [],
      productosMenosSolicitados: [],
    });
  }
}
