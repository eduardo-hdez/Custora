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

  // Transacción: Crea la reserva y sus productos con rpc.
  static async crearConProductos(folio, id_concesionaria, id_sucursal, id_campana, productos) {
    const ahora = new Date();
    const ids = productos.map((ps) => ps.producto.id_producto);
    const unidades = productos.map((ps) => ps.cantidad);

    const { data, error } = await supabase.rpc('crear_reserva_completa', {
      p_folio: folio,
      p_id_concesionaria: id_concesionaria,
      p_id_sucursal: id_sucursal,
      p_id_campana: id_campana,
      p_fecha_reserva: ahora.toISOString().slice(0, 10),
      p_fecha_hora_reserva: ahora.toISOString(),
      p_ids_producto: ids,
      p_unidades: unidades,
    });

    return { data, error };
  }

  static async fetchAll() {
    const { data, error } = await supabase
      .rpc('get_reservas_campania');
    return { data, error };
  }

  static async listarPorCliente(id_concesionaria, options = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const pageSize = Math.max(1, Number(options.pageSize) || 10);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: reservas, error, count } = await supabase
      .from('reserva')
      .select('*', { count: 'exact' })
      .eq('id_concesionaria', id_concesionaria)
      .order('fecha_hora_reserva', { ascending: false })
      .range(from, to);

    if (error) return { data: null, total: 0, error };
    if (!Array.isArray(reservas) || reservas.length === 0) return { data: [], total: Number(count) || 0, error: null };

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
        .select('id_sucursal, nombre_sucursal, ubicacion')
        .in('id_sucursal', sucursalIds.length > 0 ? sucursalIds : [-1]),
      supabase
        .from('campana')
        .select('id_campana, tiempo_cancelacion')
        .in('id_campana', campanaIds.length > 0 ? campanaIds : [-1]),
    ]);

    if (errorProductos || errorSucursales || errorCampanas) {
      return { data: null, total: Number(count) || 0, error: errorProductos || errorSucursales || errorCampanas };
    }

    const productosPorFolio = new Map();
    for (const item of productosReservados || []) {
      const current = productosPorFolio.get(item.folio) || [];
      current.push(item);
      productosPorFolio.set(item.folio, current);
    }

    const sucursalPorId = new Map((sucursales || []).map((s) => [
      s.id_sucursal,
      { nombre: s.nombre_sucursal, ubicacion: s.ubicacion },
    ]));
    const tiempoCancelacionPorCampana = new Map((campanas || []).map((c) => [c.id_campana, Math.min(Number(c.tiempo_cancelacion) || 20, 20)]));

    const data = reservas.map((reserva) => ({
      ...reserva,
      productos: productosPorFolio.get(reserva.folio) || [],
      nombre_sucursal: sucursalPorId.get(reserva.id_sucursal)?.nombre || 'N/D',
      ubicacion_sucursal: sucursalPorId.get(reserva.id_sucursal)?.ubicacion || 'N/D',
      tiempo_cancelacion: tiempoCancelacionPorCampana.get(getCampanaId(reserva)) || 20,
    }));

    return { data, total: Number(count) || 0, error: null };
  }

  static async obtenerPorFolio(folio) {
    const { data, error } = await supabase
      .from('reserva')
      .select('*')
      .eq('folio', folio)
      .maybeSingle();
    return { data, error };
  }

  static async obtenerDetallePorFolio(folio, idConcesionaria) {
    const query = supabase
      .from('reserva')
      .select('*')
      .eq('folio', folio)
      .limit(1);

    if (idConcesionaria) {
      query.eq('id_concesionaria', idConcesionaria);
    }

    const { data: reserva, error } = await query.maybeSingle();
    if (error) return { data: null, error };
    if (!reserva) return { data: null, error: null };

    const idCampana = getCampanaId(reserva);
    const [{ data: productosReservados, error: errorProductos }, { data: sucursal, error: errorSucursal }, { data: campana, error: errorCampana }] = await Promise.all([
      supabase
        .from('productos_reservados')
        .select('folio, unidades_reservadas, producto(id_producto, nombre_producto, precio_producto, peso_unidad, unidad_venta_producto, foto_producto)')
        .eq('folio', folio),
      supabase
        .from('sucursal')
        .select('id_sucursal, nombre_sucursal, ubicacion')
        .eq('id_sucursal', reserva.id_sucursal)
        .maybeSingle(),
      supabase
        .from('campana')
        .select('id_campana, tiempo_cancelacion')
        .eq('id_campana', idCampana || -1)
        .maybeSingle(),
    ]);

    if (errorProductos || errorSucursal || errorCampana) {
      return { data: null, error: errorProductos || errorSucursal || errorCampana };
    }

    return {
      data: {
        ...reserva,
        productos: productosReservados || [],
        nombre_sucursal: sucursal?.nombre_sucursal || 'N/D',
        ubicacion_sucursal: sucursal?.ubicacion || 'N/D',
        tiempo_cancelacion: Math.min(Number(campana?.tiempo_cancelacion) || 20, 20),
      },
      error: null,
    };
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
