import campanaModel from '../models/campana.model.js';
import { uploadCampanaBanner } from '../utils/campanaBannerStorage.js';

const SESSION_NUEVA_CAMPANA_ERROR = 'nuevaCampanaError';
const SESSION_EDITAR_CAMPANA_ERROR = 'editarCampanaError';

function toISODate(value) {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
}

/** Fecha enviada por input type="date": AAAA-MM-DD y día de calendario válido. */
function isValidCampanaFechaInput(value) {
  const s = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    !Number.isNaN(dt.getTime()) &&
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function clasificarCampana(fechaInicio, fechaFin) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  if (fin < hoy) return 'pasada';
  if (inicio > hoy) return 'programada';
  return 'actual';
}

async function renderCampanas(request, response) {
  try {
    const campanasDb = await campanaModel.listarCampanas();

    const campanas = campanasDb.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      fechaInicio: toISODate(item.fechaInicio),
      fechaFin: toISODate(item.fechaFin),
      estadoCalculado: clasificarCampana(item.fechaInicio, item.fechaFin),
      estado: item.estado,
    }));

    return response.render('empleado/campana', {
      title: 'Campañas',
      campanas,
    });
  } catch (error) {
    console.error('Error al listar campañas:', error.message);
    return response.status(500).render('empleado/campana', {
      title: 'Campañas',
      campanas: [],
    });
  }
}

function renderNuevaCampana(request, response) {
  const errorFromSession = request.session[SESSION_NUEVA_CAMPANA_ERROR] ?? null;
  if (errorFromSession != null) {
    delete request.session[SESSION_NUEVA_CAMPANA_ERROR];
  }
  return response.render('empleado/campana-nueva', {
    title: 'Nueva campaña',
    error: errorFromSession,
    form: {},
  });
}

async function crearCampanaPost(request, response) {
  const idCampana = String(request.body.idCampana || '').trim();
  const nombreCampana = String(request.body.nombreCampana || '').trim();
  const fi = String(request.body.fechaInicio ?? '').trim();
  const ff = String(request.body.fechaFin ?? '').trim();
  const banners = request.body.banners;
  const tiempoCancelacion = request.body.tiempoCancelacion;
  const bannerFile = request.file;

  const form = {
    idCampana,
    nombreCampana,
    fechaInicio: fi,
    fechaFin: ff,
    banners: banners != null ? String(banners) : '',
    tiempoCancelacion:
      tiempoCancelacion !== undefined && tiempoCancelacion !== null ?
        String(tiempoCancelacion) :
        '',
  };

  if (!idCampana || !nombreCampana || !fi || !ff) {
    return response.status(400).render('empleado/campana-nueva', {
      title: 'Nueva campaña',
      error: 'Indica el id de la campaña, el nombre y ambas fechas.',
      form,
    });
  }

  if (!isValidCampanaFechaInput(fi) || !isValidCampanaFechaInput(ff)) {
    return response.status(400).render('empleado/campana-nueva', {
      title: 'Nueva campaña',
      error:
        'Las fechas deben ser válidas (formato AAAA-MM-DD, día de calendario correcto).',
      form,
    });
  }

  const inicioMs = Date.parse(`${fi}T00:00:00.000Z`);
  const finMs = Date.parse(`${ff}T00:00:00.000Z`);
  if (finMs < inicioMs) {
    return response.status(400).render('empleado/campana-nueva', {
      title: 'Nueva campaña',
      error: 'La fecha final debe ser la misma o posterior a la fecha de inicio.',
      form,
    });
  }

  try {
    let bannerFinal = banners;
    if (bannerFile) {
      const { publicUrl } = await uploadCampanaBanner(
        bannerFile.buffer,
        bannerFile.mimetype,
        idCampana,
      );
      bannerFinal = publicUrl;
    }

    await campanaModel.crearCampana({
      id: idCampana,
      nombre: nombreCampana,
      fechaInicio: fi,
      fechaFin: ff,
      banner: bannerFinal,
      tiempoCancelacion,
    });
    return response.redirect('/empleado/campanas');
  } catch (error) {
    console.error('Error al crear campaña:', error.message);
    return response.status(500).render('empleado/campana-nueva', {
      title: 'Nueva campaña',
      error:
        error.message ||
        'No se pudo guardar la campaña. Comprueba columnas y permisos en Supabase.',
      form,
    });
  }
}

async function renderBannersCampana(request, response) {
  const id = request.params.id;
  let campana;
  try {
    campana = await campanaModel.obtenerCampanaPorId(id);
  } catch (e) {
    return response.redirect('/empleado/campanas');
  }
  if (!campana) {
    return response.redirect('/empleado/campanas');
  }
  return response.render('empleado/campana-banners', {
    title: 'Banner de la campaña',
    campanaId: campana.id,
    nombreCampana: campana.nombre,
    bannerUrl: String(campana.banner ?? '').trim() || null,
  });
}

async function renderEditarCampana(request, response) {
  try {
    const campana = await campanaModel.obtenerCampanaPorId(request.params.id);
    if (!campana) {
      return response.status(404).redirect('/empleado/campanas');
    }
    const errorSession = request.session[SESSION_EDITAR_CAMPANA_ERROR] ?? null;
    if (errorSession) {
      delete request.session[SESSION_EDITAR_CAMPANA_ERROR];
    }
    return response.render('empleado/campaña-editar', {
      title: 'Editar campaña',
      error: errorSession,
      campana: {
        id: campana.id,
        idCampana: campana.id,
        nombreCampana: campana.nombre,
        fechaInicio: toISODate(campana.fechaInicio),
        fechaFin: toISODate(campana.fechaFin),
        banners: campana.banner || '',
        tiempoCancelacion: campana.tiempoCancelacion || '',
      },
    });
  } catch (error) {
    console.error('Error al cargar campaña:', error.message);
    return response.redirect('/empleado/campanas');
  }
}

async function editarCampanaPost(request, response) {
  const id = request.params.id;
  let existente;
  try {
    existente = await campanaModel.obtenerCampanaPorId(id);
  } catch (e) {
    return response.redirect('/empleado/campanas');
  }
  if (!existente) {
    return response.status(404).redirect('/empleado/campanas');
  }

  const nombreCampana = String(request.body.nombreCampana || '').trim();
  const fi = String(request.body.fechaInicio ?? '').trim();
  const ff = String(request.body.fechaFin ?? '').trim();
  const tiempoCancelacion = request.body.tiempoCancelacion;
  const bannerFile = request.file;

  const campana = {
    id,
    idCampana: id,
    nombreCampana,
    fechaInicio: fi,
    fechaFin: ff,
    banners: existente.banner != null && existente.banner !== undefined ?
      String(existente.banner) :
      '',
    tiempoCancelacion: tiempoCancelacion != null ? String(tiempoCancelacion) : '',
  };

  if (!nombreCampana || !fi || !ff) {
    return response.status(400).render('empleado/campaña-editar', {
      title: 'Editar campaña',
      error: 'El nombre y ambas fechas son obligatorios.',
      campana,
    });
  }

  if (!isValidCampanaFechaInput(fi) || !isValidCampanaFechaInput(ff)) {
    return response.status(400).render('empleado/campaña-editar', {
      title: 'Editar campaña',
      error: 'Las fechas deben ser válidas (formato AAAA-MM-DD).',
      campana,
    });
  }

  if (Date.parse(`${ff}T00:00:00.000Z`) < Date.parse(`${fi}T00:00:00.000Z`)) {
    return response.status(400).render('empleado/campaña-editar', {
      title: 'Editar campaña',
      error: 'La fecha final debe ser igual o posterior a la de inicio.',
      campana,
    });
  }

  let banner = existente.banner != null && existente.banner !== undefined ?
    String(existente.banner) :
    '';
  if (bannerFile) {
    try {
      const { publicUrl } = await uploadCampanaBanner(
        bannerFile.buffer,
        bannerFile.mimetype,
        id,
      );
      banner = publicUrl;
    } catch (err) {
      console.error('Error al subir banner (editar campana):', err);
      return response.status(500).render('empleado/campaña-editar', {
        title: 'Editar campaña',
        error: err?.message || 'No se pudo subir el banner. Intenta de nuevo.',
        campana,
      });
    }
  }

  try {
    await campanaModel.actualizarCampana(id, {
      nombre: nombreCampana,
      fechaInicio: fi,
      fechaFin: ff,
      banner,
      tiempoCancelacion,
    });
    return response.redirect('/empleado/campanas');
  } catch (error) {
    console.error('Error al editar campaña:', error.message);
    return response.status(500).render('empleado/campaña-editar', {
      title: 'Editar campaña',
      error: error.message || 'No se pudo actualizar la campaña.',
      campana,
    });
  }
}

async function toggleEstadoCampana(request, response) {
  const id = request.params.id;
  const nuevoEstado = request.body.estado === 'true';
  try {
    await campanaModel.toggleEstadoCampana(id, nuevoEstado);
    return response.redirect('/empleado/campanas');
  } catch (error) {
    console.error('Error al cambiar estado de campaña:', error.message);
    return response.redirect('/empleado/campanas');
  }
}

export default {
  renderCampanas,
  renderNuevaCampana,
  crearCampanaPost,
  renderBannersCampana,
  renderEditarCampana,
  editarCampanaPost,
  toggleEstadoCampana,
};
