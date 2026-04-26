import supabase from '../config/supabase.js';

function normalizarRanking(filas = []) {
  return filas.map((fila) => ({
    nombreProducto: fila.nombre_producto ?? 'Sin nombre',
    totalUnidades: Number(fila.total_unidades) || 0,
  }));
}

export async function fetchDemandaProductosRanking(limite = 3) {
  const [masResult, menosResult] = await Promise.all([
    supabase.rpc('top_productos_mas_solicitados', { p_limite: limite }),
    supabase.rpc('top_productos_menos_solicitados', { p_limite: limite }),
  ]);

  if (masResult.error) throw masResult.error;
  if (menosResult.error) throw menosResult.error;

  return {
    productosMasSolicitados: normalizarRanking(masResult.data),
    productosMenosSolicitados: normalizarRanking(menosResult.data),
  };
}

export async function fetchTopConcesionariasRanking(limite = 10) {
  const { data, error } = await supabase
    .from('reserva')
    .select(`
      id_concesionaria,
      concesionaria(nombre_concesionaria),
      productos_reservados(unidades_reservadas)
    `)
    .eq('estado_reserva', true);

  if (error) throw error;

  const mapa = new Map();
  for (const r of data) {
    const id = r.id_concesionaria;
    if (!id) continue;

    const nombre = r.concesionaria?.nombre_concesionaria ?? 'N/D';
    const unidades = (r.productos_reservados || []).reduce(
      (sum, p) => sum + (Number(p.unidades_reservadas) || 0),
      0
    );

    const entrada = mapa.get(id) ?? {
      nombreConcesionaria: nombre,
      totalUnidades: 0,
      totalReservas: 0
    };
    entrada.totalUnidades += unidades;
    entrada.totalReservas += 1;
    mapa.set(id, entrada);
  }

  return Array.from(mapa.values())
    .sort((a, b) => b.totalUnidades - a.totalUnidades)
    .slice(0, limite);
}

export async function fetchIngresosHoy() {
  const { data, error } = await supabase.rpc('get_ingresos_hoy');

  if (error) throw error;

  return data?.[0]?.ingresos_hoy ?? 0;
}

export async function fetchPromedioIngresosDiarios() {
  const { data, error } = await supabase.rpc('get_promedio_ingresos_diarios');

  if (error) throw error;

  return data?.[0]?.promedio_ingresos_diarios ?? 0;
}