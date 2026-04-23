import multer from 'multer';

const SESSION_NUEVA_CAMPANA_ERROR = 'nuevaCampanaError';
const SESSION_EDITAR_CAMPANA_ERROR = 'editarCampanaError';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 5 * 1024 * 1024},
  fileFilter: (request, file, callback) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      callback(new Error('Solo se permiten archivos de imagen para el banner.'));
      return;
    }
    callback(null, true);
  },
});

function messageForUploadError(error) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return 'La imagen del banner no puede superar 5 MB.';
    }
    return 'No se pudo procesar el archivo del banner. Intenta de nuevo.';
  }
  if (error && error.message) {
    return error.message;
  }
  return 'No se pudo procesar el archivo del banner.';
}

export function parseCampanaMultipart(request, response, next) {
  upload.single('bannerImagen')(request, response, (error) => {
    if (error) {
      console.error(error);
      request.session[SESSION_NUEVA_CAMPANA_ERROR] = messageForUploadError(error);
      return response.redirect('/empleado/campanas/nueva');
    }
    next();
  });
}

export function parseCampanaEditMultipart(request, response, next) {
  upload.single('bannerImagen')(request, response, (error) => {
    if (error) {
      console.error(error);
      request.session[SESSION_EDITAR_CAMPANA_ERROR] = messageForUploadError(error);
      return response.redirect(`/empleado/campanas/${encodeURIComponent(request.params.id)}/editar`);
    }
    next();
  });
}
