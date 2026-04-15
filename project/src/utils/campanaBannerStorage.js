import supabase from '../config/supabase.js';

const BUCKET = 'imagenes_banners';

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

function sanitizePathSegment(id) {
  const s = String(id ?? '').replace(/[^a-zA-Z0-9_-]/g, '_');
  return s.slice(0, 120) || 'campana';
}

export async function uploadCampanaBanner(buffer, mimeType, idCampana) {
  const ext = MIME_TO_EXT[mimeType];
  if (!ext) {
    throw new Error('Tipo de imagen no permitido para el banner');
  }

  const folder = sanitizePathSegment(idCampana);
  const objectPath = `${folder}/${Date.now()}.${ext}`;

  const {error: uploadError} = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, buffer, {
        contentType: mimeType,
        upsert: false,
        cacheControl: '3600',
      });

  if (uploadError) {
    throw uploadError;
  }

  const {data} = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return {publicUrl: data.publicUrl};
}
