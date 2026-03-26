async function getSupabase() {
  const { default: supabase } = await import('../project/src/config/supabase.js');
  return supabase;
}

async function listarCampanas() {
  const supabase = await getSupabase();
  let data = null;
  let error = null;

  // Intenta primero con nombre de tabla con tilde; si no existe, usa variante sin tilde.
  ({ data, error } = await supabase
    .from('campaña')
    .select('*')
    .order('fecha_inicio', { ascending: false }));

  if (error) {
    ({ data, error } = await supabase
      .from('campana')
      .select('*')
      .order('fecha_inicio', { ascending: false }));
  }

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id_campaña ?? item.id_campana ?? item.id,
    nombre: item.nombre_campaña ?? item.nombre_campana ?? item.nombre,
    fechaInicio: item.fecha_inicio,
    fechaFin: item.fecha_fin,
  }));
}

function buildInsertRow(payload) {
  const fechaInicio = payload.fechaInicio;
  const fechaFin = payload.fechaFin;
  const banners =
    payload.banners && String(payload.banners).trim() !== ''
      ? String(payload.banners).trim()
      : null;

  let tiempoCancelacion = null;
  if (
    payload.tiempoCancelacion !== undefined &&
    payload.tiempoCancelacion !== '' &&
    payload.tiempoCancelacion !== null
  ) {
    const n = Number(payload.tiempoCancelacion);
    if (!Number.isNaN(n)) tiempoCancelacion = n;
  }

  return {
    rowTilde: {
      id_campaña: payload.id,
      nombre_campaña: payload.nombre,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      banners,
      tiempo_cancelacion: tiempoCancelacion,
    },
    rowPlain: {
      id_campana: payload.id,
      nombre_campana: payload.nombre,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      banners,
      tiempo_cancelacion: tiempoCancelacion,
    },
  };
}

async function crearCampana(payload) {
  const supabase = await getSupabase();
  const { rowTilde, rowPlain } = buildInsertRow(payload);

  let error = null;
  ({ error } = await supabase.from('campaña').insert(rowTilde));

  if (error) {
    ({ error } = await supabase.from('campana').insert(rowPlain));
  }

  if (error) throw error;
  return true;
}

module.exports = { listarCampanas, crearCampana };