async function listarCampanas() {
  const supabase = require('../project/src/config/supabase');
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

module.exports = { listarCampanas };