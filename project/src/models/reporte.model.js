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

export async function fetchTopConcesionarias() {
  const { data, error } = await supabase.rpc('get_top_concesionarias');
  if (error) {
    console.error('[fetchTopConcesionarias] Error:', error);
    return [];
  }
  return data || [];
}