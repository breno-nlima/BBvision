/**
 * BBVision - Middleware de Upload Seguro com Multer
 * Garante salvamento em diretório de evidências, validação de tipos de imagem e sanitização de nomes
 * Inviolabilidade: bloqueio de arquivos não fotográficos
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_ROOT = path.resolve(__dirname, '..', '..', 'uploads');
const EVIDENCIAS_DIR = path.join(UPLOAD_ROOT, 'evidencias');
const RELATORIOS_DIR = path.join(UPLOAD_ROOT, 'relatorios');

// Garante existência dos diretórios de armazenamento
for (const dir of [UPLOAD_ROOT, EVIDENCIAS_DIR, RELATORIOS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, EVIDENCIAS_DIR);
  },
  filename: (req, file, cb) => {
    // Gera nome de arquivo criptográfico e seguro sem caracteres perigosos
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const rawExt = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(rawExt) ? rawExt : '.jpg';
    cb(null, `evidencia_${uniqueSuffix}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Formato de arquivo inválido. Apenas imagens JPEG, PNG e WEBP são aceitas para a vistoria técnica.');
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // Limite de 15MB por foto
    files: 1, // 1 arquivo por requisição de foto
  },
});

module.exports = {
  upload,
  EVIDENCIAS_DIR,
  RELATORIOS_DIR,
  UPLOAD_ROOT,
};
