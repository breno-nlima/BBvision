const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Tabela CRC32 para geração nativa de PNG (sem dependências externas)
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePngRgb(width, height, rgbBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type 2 = Truecolor RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 3;
  const rawData = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    rawData[rowStart] = 0; // filter None
    rgbBuffer.copy(rawData, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(rawData, { level: 6 });

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function fillRect(buf, width, height, x0, y0, w, h, r, g, b) {
  const xStart = Math.max(0, Math.floor(x0));
  const yStart = Math.max(0, Math.floor(y0));
  const xEnd = Math.min(width, Math.floor(x0 + w));
  const yEnd = Math.min(height, Math.floor(y0 + h));
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const idx = (y * width + x) * 3;
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
    }
  }
}

function drawInspectionScene(sceneType) {
  const width = 480;
  const height = 300;
  const buf = Buffer.alloc(width * height * 3);

  // Fundo base (céu / iluminação de obra)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      if (sceneType === 'fachada') {
        buf[idx] = Math.min(255, 195 + Math.floor(y * 0.15));
        buf[idx + 1] = Math.min(255, 218 + Math.floor(y * 0.12));
        buf[idx + 2] = 245;
      } else if (sceneType === 'alvenaria') {
        buf[idx] = 232;
        buf[idx + 1] = 235;
        buf[idx + 2] = 240;
      } else {
        buf[idx] = 215;
        buf[idx + 1] = 228;
        buf[idx + 2] = 242;
      }
    }
  }

  if (sceneType === 'fachada') {
    // Piso externo / calçada técnica
    fillRect(buf, width, height, 0, 220, width, 80, 148, 156, 168);
    fillRect(buf, width, height, 0, 216, width, 5, 252, 252, 0); // faixa tátil amarela BB

    // Edifício Agência Banco do Brasil
    fillRect(buf, width, height, 55, 42, 370, 178, 240, 243, 248);
    // Testeira institucional Azul + Amarelo BB
    fillRect(buf, width, height, 55, 42, 370, 38, 0, 45, 114);
    fillRect(buf, width, height, 55, 76, 370, 8, 252, 252, 0);
    // Detalhe geométrico do logo na testeira
    fillRect(buf, width, height, 75, 50, 22, 20, 252, 252, 0);

    // Painéis de vidro temperado da fachada
    for (let i = 0; i < 4; i++) {
      const gx = 80 + i * 82;
      fillRect(buf, width, height, gx, 98, 68, 118, 125, 175, 218);
      fillRect(buf, width, height, gx + 4, 102, 28, 110, 155, 200, 235);
      // Esquadrias de alumínio
      fillRect(buf, width, height, gx, 98, 68, 3, 60, 75, 95);
      fillRect(buf, width, height, gx, 155, 68, 3, 60, 75, 95);
    }
  } else if (sceneType === 'alvenaria') {
    // Piso de concreto da obra
    fillRect(buf, width, height, 0, 225, width, 75, 165, 170, 176);
    // Parede em alvenaria estrutural / blocos cerâmicos e pilares de concreto
    fillRect(buf, width, height, 40, 25, 400, 200, 212, 132, 92);
    // Juntas de argamassa horizontais e verticais (prumo e alinhamento perfeitos)
    for (let row = 0; row < 8; row++) {
      const ry = 25 + row * 25;
      fillRect(buf, width, height, 40, ry, 400, 3, 215, 218, 222);
      const offset = (row % 2) * 25;
      for (let col = 0; col < 8; col++) {
        const cx = 40 + offset + col * 50;
        if (cx < 440) {
          fillRect(buf, width, height, cx, ry, 3, 25, 215, 218, 222);
        }
      }
    }
    // Pilares estruturais de concreto nas extremidades
    fillRect(buf, width, height, 40, 20, 36, 205, 145, 152, 162);
    fillRect(buf, width, height, 404, 20, 36, 205, 145, 152, 162);
    // Viga superior
    fillRect(buf, width, height, 35, 18, 410, 22, 135, 142, 152);
  } else {
    // Cena de rampa de acessibilidade NBR 9050 e guarda-corpo
    fillRect(buf, width, height, 0, 215, width, 85, 158, 166, 175);
    // Parede de fundo
    fillRect(buf, width, height, 30, 35, 420, 180, 244, 246, 250);
    fillRect(buf, width, height, 30, 35, 420, 26, 0, 45, 114);
    fillRect(buf, width, height, 30, 61, 420, 5, 252, 252, 0);

    // Rampa inclinada e piso podotátil de alerta
    for (let x = 70; x < 390; x++) {
      const rampTop = 195 - Math.floor((x - 70) * 0.16);
      fillRect(buf, width, height, x, rampTop, 2, 215 - rampTop, 185, 192, 200);
    }
    // Guarda-corpo / corrimão duplo metálico (70cm e 92cm)
    for (let x = 75; x < 385; x++) {
      const yRail1 = 152 - Math.floor((x - 75) * 0.16);
      const yRail2 = 168 - Math.floor((x - 75) * 0.16);
      fillRect(buf, width, height, x, yRail1, 3, 3, 0, 56, 168);
      fillRect(buf, width, height, x, yRail2, 3, 3, 0, 56, 168);
    }
    // Montantes verticais do corrimão
    for (let i = 0; i < 5; i++) {
      const px = 85 + i * 72;
      const py = 152 - Math.floor((px - 75) * 0.16);
      fillRect(buf, width, height, px, py, 5, 58, 70, 82, 98);
    }
    // Piso tátil amarelo de alerta na base e topo
    fillRect(buf, width, height, 45, 205, 40, 12, 252, 252, 0);
    fillRect(buf, width, height, 385, 145, 45, 10, 252, 252, 0);
  }

  // Mira técnica de enquadramento (cantoneiras verdes de validação IA)
  const cColor = [16, 185, 129];
  fillRect(buf, width, height, 20, 16, 26, 4, ...cColor);
  fillRect(buf, width, height, 20, 16, 4, 26, ...cColor);
  fillRect(buf, width, height, width - 46, 16, 26, 4, ...cColor);
  fillRect(buf, width, height, width - 24, 16, 4, 26, ...cColor);

  // Tarja inferior de metadados invioláveis BBVision
  fillRect(buf, width, height, 0, height - 34, width, 34, 10, 22, 46);
  fillRect(buf, width, height, 0, height - 36, width, 2, 252, 252, 0);
  // Indicador verde de GPS/Hash ativo na tarja
  fillRect(buf, width, height, 14, height - 22, 10, 10, 16, 185, 129);

  return encodePngRgb(width, height, buf);
}

function ensureSeedImages() {
  try {
    const evidenciasDir = path.resolve(__dirname, '../../uploads/evidencias');
    if (!fs.existsSync(evidenciasDir)) {
      fs.mkdirSync(evidenciasDir, { recursive: true });
    }

    const targets = [
      { file: 'seed_fachada_bb.png', scene: 'fachada' },
      { file: 'seed_alvenaria_bb.png', scene: 'alvenaria' },
      { file: 'seed_acessibilidade_bb.png', scene: 'acessibilidade' }
    ];

    for (const item of targets) {
      const fullPath = path.join(evidenciasDir, item.file);
      if (!fs.existsSync(fullPath)) {
        const pngBuffer = drawInspectionScene(item.scene);
        fs.writeFileSync(fullPath, pngBuffer);
      }
    }
  } catch (err) {
    console.warn('⚠️ Aviso ao gerar imagens seed de vistoria:', err.message);
  }
}

module.exports = { ensureSeedImages, drawInspectionScene };

