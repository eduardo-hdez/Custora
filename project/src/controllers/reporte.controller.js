import {
  fetchDemandaProductosRanking,
  fetchTopConcesionariasRanking,
  fetchIngresosHoy,
  fetchPromedioIngresosDiarios,
  fetchSingleTopConcesionaria,
  fetchSingleTopSucursal,
  fetchTopProductosCalificados
} from '../models/reporte.model.js';

export async function renderReporte(request, response) {
  const base = {
    title: 'Reporte de Reservas',
    fechaActualizacion: new Date(),
  };

  try {
    const [demanda, topConcesionarias, ingresosHoy, promedioIngresosDiarios, singleTopConcesionaria, singleTopSucursal, mejoresProductos] = await Promise.all([
      fetchDemandaProductosRanking(3),
      fetchTopConcesionariasRanking(5),
      fetchIngresosHoy(),
      fetchPromedioIngresosDiarios(),
      fetchSingleTopConcesionaria(),
      fetchSingleTopSucursal(),
      fetchTopProductosCalificados(5)
    ]);

    const sinReservas = topConcesionarias.length === 0 && demanda.productosMasSolicitados.length === 0;

    return response.render('empleado/reporte', {
      ...base,
      errorReporte: null,
      infoReporte: sinReservas ? 'Actualmente no existen reservas en la campaña seleccionada. Las métricas se actualizarán cuando se registren nuevas reservas.' : null,
      ...demanda,
      topConcesionarias,
      ingresosHoy,
      promedioIngresosDiarios,
      singleTopConcesionaria,
      singleTopSucursal,
      mejoresProductos
    });
  } catch (error) {
    console.error('[reporte] Error al generar el reporte:', error);

    return response.status(500).render('empleado/reporte', {
      ...base,
      errorReporte: 'Lo siento. No se pudieron recuperar los datos o generar el reporte en este momento. Por favor, intenta más tarde.',
      infoReporte: null,
      productosMasSolicitados: [],
      productosMenosSolicitados: [],
      topConcesionarias: [],
      ingresosHoy: [],
      promedioIngresosDiarios: [],
      singleTopConcesionaria: [],
      singleTopSucursal: [],
      mejoresProductos: []
    });
  }
}
