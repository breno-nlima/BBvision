/**
 * BBVision - Middleware de Upload Seguro com Multer
 * Garante salvamento em diretório de evidências e validação de tipos de imagem
 * Inviolabilidade: bloqueio de arquivos não fotográficos
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');
const EVIDENCIAS_DIR = path.join(UPLOAD_ROOT, 'evidencias');

if (!fs.existsSync(EVIDENCIAS_DIR)) {
  fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, EVIDENCIAS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `evidencia_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Apenas imagens JPEG, PNG e WEBP são aceitas para a vistoria.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // Limite de 15MB por foto
  },
});

module.exports = {
  upload,
  EVIDENCIAS_DIR,
  UPLOAD_ROOT,
};
