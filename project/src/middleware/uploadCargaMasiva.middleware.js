import multer from 'multer';

const storage = multer.memoryStorage();
const uploadCargaMasiva = multer({ storage });

export { uploadCargaMasiva };