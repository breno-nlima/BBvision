/**
 * BBVision - Gerador de Evidências Fotográficas PNG Válidas para Demonstração
 * Gera arquivos PNG 100% válidos (Magic Bytes + zlib + CRC32) com cenas arquitetônicas
 * de fachada/acessibilidade e assinatura digital PNG, garantindo compatibilidade total
 * com navegadores, PDFKit e validação SHA-256 real sem dependências externas.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const EVIDENCIAS_DIR = path.resolve(__dirname, '..', '..', 'uploads', 'evidencias');

// Tabela CRC32 padrão PNG (ISO 3309)
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePngRgb(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowStride = width * 3 + 1;
  const raw = Buffer.alloc(rowStride * height);
  for (let y = 0; y < height; y++) {
    const rowOff = y * rowStride;
    raw[rowOff] = 0; // filter None
    pixels.copy(raw, rowOff + 1, y * width * 3, (y + 1) * width * 3);
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function createCanvas(width, height) {
  const buf = Buffer.alloc(width * height * 3);
  function setPixel(x, y, r, g, b) {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || xi >= width || yi < 0 || yi >= height) return;
    const idx = (yi * width + xi) * 3;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
  }
  function fillRect(x, y, w, h, r, g, b) {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(width, Math.ceil(x + w));
    const y1 = Math.min(height, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const idx = (yy * width + xx) * 3;
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
      }
    }
  }
  function fillGradientV(x, y, w, h, rgbTop, rgbBot) {
    const y0 = Math.max(0, Math.floor(y));
    const y1 = Math.min(height, Math.ceil(y + h));
    const x0 = Math.max(0, Math.floor(x));
    const x1 = Math.min(width, Math.ceil(x + w));
    const span = Math.max(1, y1 - y0);
    for (let yy = y0; yy < y1; yy++) {
      const t = (yy - y0) / span;
      const r = Math.round(rgbTop[0] + (rgbBot[0] - rgbTop[0]) * t);
      const g = Math.round(rgbTop[1] + (rgbBot[1] - rgbTop[1]) * t);
      const b = Math.round(rgbTop[2] + (rgbBot[2] - rgbTop[2]) * t);
      for (let xx = x0; xx < x1; xx++) {
        const idx = (yy * width + xx) * 3;
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
      }
    }
  }
  function drawLine(x0, y0, x1, y1, thickness, r, g, b) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1) * 2;
    const rad = Math.max(1, Math.floor(thickness / 2));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x0 + (x1 - x0) * t;
      const cy = y0 + (y1 - y0) * t;
      fillRect(cx - rad, cy - rad, thickness, thickness, r, g, b);
    }
  }
  return { buf, setPixel, fillRect, fillGradientV, drawLine };
}

function buildAgencySceneBuffer(variant) {
  const W = 480;
  const H = 300;
  const c = createCanvas(W, H);

  // Céu
  if (variant === 'boaviagem') {
    c.fillGradientV(0, 0, W, 150, [96, 165, 250], [219, 234, 254]);
  } else if (variant === 'olinda') {
    c.fillGradientV(0, 0, W, 150, [56, 189, 248], [224, 242, 254]);
  } else {
    c.fillGradientV(0, 0, W, 150, [37, 99, 235], [191, 219, 254]);
  }

  // Calçada / solo
  c.fillRect(0, 224, W, 76, 203, 213, 225);
  c.fillRect(0, 224, W, 4, 148, 163, 184);

  // Estrutura principal do edifício da agência
  c.fillRect(46, 54, 388, 174, 241, 245, 249);
  c.fillRect(42, 50, 396, 8, 100, 116, 139); // platibanda
  // Laterais em sombra suave
  c.fillRect(46, 58, 10, 170, 226, 232, 240);
  c.fillRect(424, 58, 10, 170, 226, 232, 240);

  // Faixa institucional azul marinho + amarelo ouro BB
  c.fillRect(46, 62, 388, 34, 0, 45, 98);
  c.fillRect(46, 96, 388, 10, 254, 211, 4);
  // Emblema geométrico amarelo na fachada
  c.fillRect(66, 70, 18, 18, 254, 211, 4);
  c.fillRect(71, 75, 8, 8, 0, 45, 98);
  // Letras estilizadas da marca na fachada
  c.fillRect(94, 74, 130, 6, 255, 255, 255);
  c.fillRect(94, 84, 88, 4, 203, 213, 225);

  // Pilares estruturais
  for (const px of [58, 152, 318, 412]) {
    c.fillRect(px, 106, 12, 122, 203, 213, 225);
  }

  // Janelas envidraçadas simétricas
  for (const wx of [78, 172, 248, 338]) {
    c.fillRect(wx, 120, 64, 56, 30, 64, 124);
    c.fillGradientV(wx + 3, 123, 58, 50, [125, 211, 252], [56, 189, 248]);
    // Divisória esquadria alumínio
    c.fillRect(wx + 31, 120, 2, 56, 226, 232, 240);
    c.fillRect(wx, 148, 64, 2, 226, 232, 240);
  }

  // Entrada principal envidraçada
  c.fillRect(198, 182, 84, 46, 15, 23, 42);
  c.fillGradientV(202, 185, 36, 43, [96, 165, 250], [30, 58, 138]);
  c.fillGradientV(242, 185, 36, 43, [96, 165, 250], [30, 58, 138]);

  // Elementos específicos de cada cenário
  if (variant === 'boaviagem') {
    // Tapume lateral em desmontagem (cenário Parcial com justificativa)
    c.fillRect(46, 168, 72, 60, 234, 179, 8);
    for (let sx = 46; sx < 118; sx += 16) {
      c.fillRect(sx, 168, 8, 60, 30, 41, 59);
    }
    // Cones de sinalização
    c.fillRect(126, 212, 10, 16, 249, 115, 22);
    c.fillRect(128, 217, 6, 4, 255, 255, 255);
  } else if (variant === 'olinda') {
    // Rampa de acessibilidade + piso tátil amarelo em ajuste
    c.fillRect(156, 228, 170, 22, 148, 163, 184);
    c.fillRect(160, 232, 162, 6, 254, 211, 4); // guia tátil
    // Corrimão metálico
    c.drawLine(158, 214, 210, 226, 3, 71, 85, 105);
    c.drawLine(270, 226, 322, 214, 3, 71, 85, 105);
  } else {
    // Totem institucional externo à direita + piso tátil completo
    c.fillRect(444, 112, 20, 116, 0, 45, 98);
    c.fillRect(444, 112, 20, 24, 254, 211, 4);
    c.fillRect(184, 234, 112, 8, 254, 211, 4);
  }

  // Faixa inferior de carimbo criptográfico in-loco
  c.fillRect(0, H - 34, W, 34, 0, 27, 61);
  c.fillRect(0, H - 34, W, 3, 254, 211, 4);
  c.fillRect(14, H - 22, 168, 5, 255, 255, 255);
  c.fillRect(14, H - 12, 260, 4, 203, 213, 225);

  return encodePngRgb(W, H, c.buf);
}

function generateSignatureDataUrl() {
  const W = 220;
  const H = 70;
  const c = createCanvas(W, H);
  c.fillRect(0, 0, W, H, 255, 255, 255);

  // Linha de base sutil
  c.fillRect(16, 56, W - 32, 1, 203, 213, 225);

  // Traço contínuo estilizado de assinatura em azul corporativo (#002D62)
  const pts = [
    [24, 48], [32, 24], [42, 18], [46, 34], [38, 46], [52, 42],
    [62, 32], [70, 44], [82, 30], [92, 43], [104, 26], [112, 42],
    [126, 36], [138, 44], [154, 34], [172, 40], [194, 36],
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    c.drawLine(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 3, 0, 45, 98);
  }

  const pngBuf = encodePngRgb(W, H, c.buf);
  return `data:image/png;base64,${pngBuf.toString('base64')}`;
}

function ensureDemoEvidenceFiles() {
  if (!fs.existsSync(EVIDENCIAS_DIR)) {
    fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true });
  }

  const specs = [
    { key: 'centro', filename: 'vistoria_agencia_centro.png', variant: 'centro' },
    { key: 'boaviagem', filename: 'vistoria_agencia_boaviagem.png', variant: 'boaviagem' },
    { key: 'olinda', filename: 'vistoria_agencia_olinda.png', variant: 'olinda' },
  ];

  const result = {};
  for (const spec of specs) {
    const absPath = path.join(EVIDENCIAS_DIR, spec.filename);
    let buf;
    if (fs.existsSync(absPath)) {
      buf = fs.readFileSync(absPath);
    } else {
      buf = buildAgencySceneBuffer(spec.variant);
      fs.writeFileSync(absPath, buf);
    }
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    result[spec.key] = {
      caminho_arquivo: `uploads/evidencias/${spec.filename}`,
      hash_integridade: hash,
      absPath,
    };
  }
  return result;
}

module.exports = {
  ensureDemoEvidenceFiles,
  generateSignatureDataUrl,
  buildAgencySceneBuffer,
};
