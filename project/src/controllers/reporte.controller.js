import {
  fetchDemandaProductosRanking,
  fetchTopConcesionariasRanking,
  fetchIngresosHoy,
  fetchPromedioIngresosDiarios
} from '../models/reporte.model.js';

export async function renderReporte(request, response) {
  const base = {
    title: 'Reporte de Reservas',
    fechaActualizacion: new Date(),
  };

  try {
    const [demanda, topConcesionarias, ingresosHoy, promedioIngresosDiarios] = await Promise.all([
      fetchDemandaProductosRanking(3),
      fetchTopConcesionariasRanking(5),
      fetchIngresosHoy(),
      fetchPromedioIngresosDiarios()
    ]);

    return response.render('empleado/reporte', {
      ...base,
      errorReporte: null,
      ...demanda,
      topConcesionarias,
      ingresosHoy,
      promedioIngresosDiarios
    });
  } catch (error) {
    console.error('[reporte] Error al generar el reporte:', error);

    return response.status(500).render('empleado/reporte', {
      ...base,
      errorReporte: 'No se pudo cargar el reporte en este momento.',
      productosMasSolicitados: [],
      productosMenosSolicitados: [],
      topConcesionarias: [],
      ingresosHoy: [],
      promedioIngresosDiarios: []
    });
  }
}
