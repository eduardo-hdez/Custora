async function listarCampanas() {
  const supabase = require('../project/src/config/supabase');
  const { data, error } = await supabase
    .from('campaña')
    .select('id_campaña,nombre_campaña,fecha_inicio,fecha_fin')
    .order('fecha_inicio', { ascending: false });

  if (error) throw error;
  return data;
}

module.exports = { listarCampanas };