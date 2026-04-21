import { fetchReservas } from '../models/reporte.model.js';

function calcularDemandaProductos(filas) {
  const mapa = new Map();

  for (const fila of filas) {
    if (fila.estado_reserva !== true) continue;
    if (!fila.id_producto || fila.unidades_reservadas <= 0) continue;

    const entrada = mapa.get(fila.id_producto) ?? {
      idProducto: fila.id_producto,
      nombreProducto: fila.nombre_producto,
      totalUnidades: 0,
      totalRegistros: 0,
    };
    entrada.totalUnidades += fila.unidades_reservadas;
    entrada.totalRegistros += 1;
    mapa.set(fila.id_producto, entrada);
  }

  const ranking = Array.from(mapa.values()).sort((a, b) =>
    b.totalUnidades !== a.totalUnidades
      ? b.totalUnidades - a.totalUnidades
      : b.totalRegistros - a.totalRegistros,
  );

  return {
    productosMasSolicitados: ranking.slice(0, 3),
    productosMenosSolicitados: ranking.slice(-3).reverse(),
  };
}

export async function renderReporte(request, response) {
  const base = {
    title: 'Reporte de Reservas',
    fechaActualizacion: new Date(),
  };

  try {
    const filas = await fetchReservas();
    const demanda = calcularDemandaProductos(filas);

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
