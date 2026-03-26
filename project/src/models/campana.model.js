async function getSupabase() {
  const {default: supabase} = await import('../config/supabase.js');
  return supabase;
}

async function listarCampanas() {
  const supabase = await getSupabase();
  let data = null;
  let error = null;


  ({data, error} = await supabase
      .from('campana')
      .select('*')
      .order('fecha_inicio', {ascending: false}));

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id_campana ?? item.id_campana ?? item.id,
    nombre: item.nombre_campana ?? item.nombre_campana ?? item.nombre,
    fechaInicio: item.fecha_inicio,
    fechaFin: item.fecha_fin,
  }));
}

function buildInsertRow(payload) {
  const fechaInicio = payload.fechaInicio;
  const fechaFin = payload.fechaFin;
  const banner =
    payload.banner && String(payload.banner).trim() !== '' ?
      String(payload.banner).trim() :
      null;

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

    id_campana: payload.id,
    nombre_campana: payload.nombre,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    banner,
    tiempo_cancelacion: tiempoCancelacion,

  };
}


async function crearCampana(payload) {
  const supabase = await getSupabase();
  const row = buildInsertRow(payload);
  const {error} = await supabase.from('campana').insert(row);
  if (error) throw error;
  return true;
}


export default {listarCampanas, crearCampana};
