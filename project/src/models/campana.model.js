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


async function getCampanaActiva() {
  const supabase = await getSupabase();
  const hoy = new Date().toISOString().slice(0, 10);
  const {data, error} = await supabase
      .from('campana')
      .select('id_campana, nombre_campana, banner')
      .lte('fecha_inicio', hoy)
      .gte('fecha_fin', hoy)
      .limit(1)
      .maybeSingle();
  if (error) throw error;
  return data;
}

function urlBannerLimpia(raw) {
  const t = String(raw ?? '').trim();
  return t || null;
}

// Valores de vista del catálogo cuando no hay campaña o falla la carga.
export const CATALOGO_CAMPANA_FALLBACK = Object.freeze({
  idCampanaActiva: null,
  nombreCampañaActiva: 'No hay campaña vigente hoy',
  catalogoBannerUrl: null,
});

// Datos de la campaña activa listos para las vistas de catálogo (banner, nombre, id).
async function getVistaCatalogoCampañaActiva() {
  try {
    const row = await getCampanaActiva();
    if (!row) {
      return {...CATALOGO_CAMPANA_FALLBACK};
    }
    return {
      idCampanaActiva: row.id_campana ?? null,
      nombreCampañaActiva: String(row.nombre_campana ?? 'Campaña'),
      catalogoBannerUrl: urlBannerLimpia(row.banner),
    };
  } catch {
    return {...CATALOGO_CAMPANA_FALLBACK};
  }
}

async function crearCampana(payload) {
  const supabase = await getSupabase();
  const row = buildInsertRow(payload);
  const {error} = await supabase.from('campana').insert(row);
  if (error) throw error;
  return true;
}

async function obtenerCampanaPorId(id) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('campana')
    .select('*')
    .eq('id_campana', id)
    .single();
  if (error) throw error;
  return {
    id: data.id_campana,
    nombre: data.nombre_campana,
    fechaInicio: data.fecha_inicio,
    fechaFin: data.fecha_fin,
    banner: data.banner,
    tiempoCancelacion: data.tiempo_cancelacion,
  };
}

async function actualizarCampana(id, campos) {
  const supabase = await getSupabase();
  const banner =
    campos.banner && String(campos.banner).trim() !== ''
      ? String(campos.banner).trim()
      : null;

  let tiempoCancelacion = null;
  if (campos.tiempoCancelacion !== undefined && campos.tiempoCancelacion !== '' && campos.tiempoCancelacion !== null) {
    const n = Number(campos.tiempoCancelacion);
    if (!Number.isNaN(n)) tiempoCancelacion = n;
  }

  const { error } = await supabase
    .from('campana')
    .update({
      nombre_campana: campos.nombre,
      fecha_inicio: campos.fechaInicio,
      fecha_fin: campos.fechaFin,
      banner,
      tiempo_cancelacion: tiempoCancelacion,
    })
    .eq('id_campana', id);

  if (error) throw error;
  return true;
}

export default {
  listarCampanas,
  crearCampana,
  getCampanaActiva,
  obtenerCampanaPorId,
  actualizarCampana,
  getVistaCatalogoCampañaActiva,
  CATALOGO_CAMPANA_FALLBACK,
};