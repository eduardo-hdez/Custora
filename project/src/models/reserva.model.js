import supabase from '../config/supabase.js';

function getCampanaId(reserva) {
  return reserva?.id_campana ?? reserva?.['id_campaña'] ?? null;
}

export default class Reserva {
  static async generarFolio() {
    const { data } = await supabase
      .from('reserva')
      .select('folio')
      .order('folio', { ascending: false })
      .limit(1)
      .maybeSingle();

    const ultimo = data?.folio ? parseInt(data.folio.replace('F-', '')) : 1000;
    return `F-${ultimo + 1}`;
  }

  static async crear(folio, id_concesionaria, id_sucursal, id_campaña) {
    const ahora = new Date();
    const fecha_reserva = ahora.toISOString().slice(0, 10);
    const fecha_hora_reserva = ahora.toISOString();
    let { data, error } = await supabase
      .from('reserva')
      .insert({ folio, fecha_reserva, fecha_hora_reserva, estado_reserva: true, id_concesionaria, id_sucursal, id_campaña })
      .select()
      .single();

    const missingIdCampana = error?.message?.includes('id_campana') || error?.message?.includes('schema cache');
    if (missingIdCampana) {
      ({ data, error } = await supabase
        .from('reserva')
        .insert({ folio, fecha_reserva, fecha_hora_reserva, estado_reserva: true, id_concesionaria, id_sucursal, 'id_campana': id_campaña })
        .select()
        .single());
    }

    return { data, error };
  }

  static async insertarProductos(folio, productos) {
    const rows = productos.map((ps) => ({
      folio,
      id_producto: ps.producto.id_producto,
      unidades_reservadas: ps.cantidad,
    }));
    const { data, error } = await supabase.from('productos_reservados').insert(rows);
    return { data, error };
  }

  static async crearCompleta(folio, id_concesionaria, id_sucursal, id_campana, productos) {
    const { data: reservaData, error: errorReserva } = await Reserva.crear(
      folio,
      id_concesionaria,
      id_sucursal,
      id_campana,
    );

    if (errorReserva) return { data: null, error: errorReserva };

    const { data, error } = await Reserva.insertarProductos(folio, productos);
    return { data: data ?? reservaData, error };
  }
  // transacción
  static async crearCompleta(folio, id_concesionaria, id_sucursal, id_campana, productos) {
    const { data: reservaData, error: errorReserva } = await Reserva.crear(
      folio,
      id_concesionaria,
      id_sucursal,
      id_campana,
    );

    if (errorReserva) return { data: null, error: errorReserva };

    const { data, error } = await Reserva.insertarProductos(folio, productos);
    return { data: data ?? reservaData, error };
  }

  static async fetchAll() {
    const { data, error } = await supabase
      .rpc('get_reservas_campania');
    return { data, error };
  }

  static async listarPorCliente(id_concesionaria) {
    const { data: reservas, error } = await supabase
      .from('reserva')
      .select('*')
      .eq('id_concesionaria', id_concesionaria)
      .order('fecha_hora_reserva', { ascending: false });

    if (error) return { data: null, error };
    if (!Array.isArray(reservas) || reservas.length === 0) return { data: [], error: null };

    const folios = reservas.map((r) => r.folio);
    const sucursalIds = [...new Set(reservas.map((r) => r.id_sucursal).filter(Boolean))];
    const campanaIds = [...new Set(reservas.map((r) => getCampanaId(r)).filter(Boolean))];

    const [{ data: productosReservados, error: errorProductos }, { data: sucursales, error: errorSucursales }, { data: campanas, error: errorCampanas }] = await Promise.all([
      supabase
        .from('productos_reservados')
        .select('folio, unidades_reservadas, producto(id_producto, nombre_producto, precio_producto, peso_unidad, unidad_venta_producto, foto_producto)')
        .in('folio', folios),
      supabase
        .from('sucursal')
        .select('id_sucursal, nombre_sucursal')
        .in('id_sucursal', sucursalIds.length > 0 ? sucursalIds : [-1]),
      supabase
        .from('campana')
        .select('id_campana, tiempo_cancelacion')
        .in('id_campana', campanaIds.length > 0 ? campanaIds : [-1]),
    ]);

    if (errorProductos || errorSucursales || errorCampanas) {
      return { data: null, error: errorProductos || errorSucursales || errorCampanas };
    }

    const productosPorFolio = new Map();
    for (const item of productosReservados || []) {
      const current = productosPorFolio.get(item.folio) || [];
      current.push(item);
      productosPorFolio.set(item.folio, current);
    }

    const sucursalPorId = new Map((sucursales || []).map((s) => [s.id_sucursal, s.nombre_sucursal]));
    const tiempoCancelacionPorCampana = new Map((campanas || []).map((c) => [c.id_campana, Math.min(Number(c.tiempo_cancelacion) || 20, 20)]));

    const data = reservas.map((reserva) => ({
      ...reserva,
      productos: productosPorFolio.get(reserva.folio) || [],
      nombre_sucursal: sucursalPorId.get(reserva.id_sucursal) || 'N/D',
      tiempo_cancelacion: tiempoCancelacionPorCampana.get(getCampanaId(reserva)) || 20,
    }));

    return { data, error: null };
  }

  static async obtenerPorFolio(folio) {
    const { data, error } = await supabase
      .from('reserva')
      .select('*')
      .eq('folio', folio)
      .maybeSingle();
    return { data, error };
  }

  static async obtenerTiempoCancelacion(idCampana) {
    const { data, error } = await supabase
      .from('campana')
      .select('tiempo_cancelacion')
      .eq('id_campana', idCampana)
      .maybeSingle();
    if (error) return { data: null, error };
    const minutos = Math.min(Number(data?.tiempo_cancelacion) || 20, 20);
    return { data: minutos, error: null };
  }

  static async cancelarPorFolio(folio) {
    const fecha_cancelacion = new Date().toISOString();
    const { data, error } = await supabase
      .from('reserva')
      .update({ estado_reserva: false, fecha_cancelacion })
      .eq('folio', folio)
      .eq('estado_reserva', true)
      .select()
      .maybeSingle();
    return { data, error };
  }
}
