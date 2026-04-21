import supabase from '../config/supabase.js';

export async function fetchReservas(filtros = {}) {
  const { soloActivas = false, fechaDesde, fechaHasta } = filtros;

  let queryReservas = supabase
    .from('reserva')
    .select('folio, fecha_reserva, fecha_hora_reserva, estado_reserva');

  if (soloActivas) queryReservas = queryReservas.eq('estado_reserva', true);
  if (fechaDesde) queryReservas = queryReservas.gte('fecha_reserva', fechaDesde);
  if (fechaHasta) queryReservas = queryReservas.lte('fecha_reserva', fechaHasta);

  const { data: reservas, error: errorReservas } = await queryReservas;
  if (errorReservas) throw errorReservas;
  if (!reservas || reservas.length === 0) return [];

  const folios = reservas.map((r) => r.folio);

  const { data: items, error: errorItems } = await supabase
    .from('productos_reservados')
    .select(
      'folio, unidades_reservadas, producto(id_producto, nombre_producto, precio_producto)',
    )
    .in('folio', folios);

  if (errorItems) throw errorItems;

  const reservaPorFolio = new Map(reservas.map((r) => [r.folio, r]));

  return (items || []).map((item) => {
    const reserva = reservaPorFolio.get(item.folio) ?? {};
    const producto = item.producto ?? {};
    return {
      folio: item.folio,
      unidades_reservadas: Number(item.unidades_reservadas) || 0,
      id_producto: producto.id_producto ?? null,
      nombre_producto: producto.nombre_producto ?? 'Sin nombre',
      precio_producto: Number(producto.precio_producto) || 0,
      fecha_reserva: reserva.fecha_reserva ?? null,
      fecha_hora_reserva: reserva.fecha_hora_reserva ?? null,
      estado_reserva: reserva.estado_reserva ?? null,
    };
  });
}
