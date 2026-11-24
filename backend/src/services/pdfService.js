/**
 * BBVision - Serviço de Geração de Relatório Técnico em PDF (PDFKit)
 * Gera relatórios imutáveis com código único, hashes SHA-256, fotos in-loco,
 * geolocalização, assinatura digital do responsável técnico e parecer fiscal.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { resolveSafePath, validateImageMagicBytes } = require('../utils/securityUtils');
const { UPLOAD_ROOT } = require('../middlewares/uploadMiddleware');

function decodeBase64Image(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const b64Data = raw.includes(',') ? raw.split(',')[1] : raw;
    const buf = Buffer.from(b64Data, 'base64');
    const check = validateImageMagicBytes(buf);
    return check.valid ? buf : null;
  } catch (_) {
    return null;
  }
}

/**
 * Compila o relatório completo de vistoria técnica em um buffer PDF
 * @param {Object} relatorio Dados completos do relatório (obra, usuario, fotos, respostas)
 * @returns {Promise<Buffer>} Buffer binário do PDF gerado
 */
function gerarRelatorioPdfBuffer(relatorio) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 45, left: 45, right: 45 },
        info: {
          Title: `BBVision_Relatorio_${relatorio.codigo_unico || 'Vistoria'}`,
          Author: 'Banco do Brasil - BBVision',
          Subject: 'Fiscalização Remota de Obras',
          Keywords: 'BBVision, Banco do Brasil, Fiscalização, Inviolabilidade, SHA-256, IA',
        },
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      const AZUL_BB = '#003882';
      const AMARELO_BB = '#FCDB00';
      const CINZA_ESCURO = '#1E293B';
      const CINZA_TEXTO = '#475569';
      const CINZA_CLARO = '#F8FAFC';
      const BORDA_CINZA = '#CBD5E1';
      const VERDE_SUCESSO = '#059669';
      const VERMELHO_ERRO = '#DC2626';
      const AMBAR_ALERTA = '#B45309';

      const ensureSpace = (neededHeight) => {
        if (currentY + neededHeight > 745) {
          doc.addPage();
          currentY = 45;
        }
      };

      // ------------------------------------------------------------------------
      // 1. CABEÇALHO INSTITUCIONAL
      // ------------------------------------------------------------------------
      doc.rect(45, 40, 505, 55).fill(AZUL_BB);
      doc.rect(45, 95, 505, 4).fill(AMARELO_BB);

      doc.fillColor('#FFFFFF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('BANCO DO BRASIL | BBVision', 60, 48);

      doc.fontSize(8.5)
        .font('Helvetica')
        .text('Sistema Inteligente de Fiscalização e Monitoramento Remoto de Obras', 60, 68)
        .text('Diretoria de Engenharia, Infraestrutura e Patrimônio • DIPAT', 60, 80);

      // ------------------------------------------------------------------------
      // 2. CARIMBO DE INVIOLABILIDADE & CÓDIGO ÚNICO
      // ------------------------------------------------------------------------
      const yBox = 112;
      const temValidacaoManual = Boolean(
        relatorio.validacao_manual ||
        (Array.isArray(relatorio.fotos) && relatorio.fotos.some(f => (f.avaliacao_gemini || f.status_ia) === 'VALIDACAO_MANUAL'))
      );
      const boxHeight = temValidacaoManual ? 96 : 82;

      doc.rect(45, yBox, 505, boxHeight).fillAndStroke(CINZA_CLARO, BORDA_CINZA);

      doc.fillColor(AZUL_BB)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('CARIMBO DIGITAL DE INTEGRIDADE & NÃO-REPÚDIO', 58, yBox + 9);

      doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica');
      doc.text('CÓDIGO ÚNICO:', 58, yBox + 26);
      doc.fillColor(AZUL_BB)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(relatorio.codigo_unico || 'NÃO FINALIZADO', 145, yBox + 24);

      doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica');
      doc.text('STATUS DO DOCUMENTO:', 58, yBox + 44);
      const statusDoc = String(relatorio.status || 'EM_ANDAMENTO').toUpperCase();
      let statusLabel = 'EM ANDAMENTO';
      let statusCor = '#D97706';
      if (statusDoc === 'APROVADO') {
        statusLabel = 'HOMOLOGADO & IMUTÁVEL (APROVADO)';
        statusCor = VERDE_SUCESSO;
      } else if (statusDoc === 'FINALIZADO') {
        statusLabel = 'IMUTÁVEL & FINALIZADO (BLOQUEADO)';
        statusCor = VERDE_SUCESSO;
      } else if (statusDoc === 'PENDENTE_AJUSTE' || statusDoc === 'REPROVADO') {
        statusLabel = 'PENDENTE DE AJUSTE (REPROVADO PELO FISCAL)';
        statusCor = VERMELHO_ERRO;
      }
      doc.fillColor(statusCor)
        .font('Helvetica-Bold')
        .text(statusLabel, 195, yBox + 44);

      doc.fillColor(CINZA_ESCURO).font('Helvetica');
      doc.text('DATA DA EMISSÃO:', 58, yBox + 58);
      const dataFormatada = relatorio.data_finalizacao || relatorio.finalizado_em || relatorio.data
        ? new Date(relatorio.data_finalizacao || relatorio.finalizado_em || relatorio.data).toLocaleString('pt-BR')
        : new Date().toLocaleString('pt-BR');
      doc.text(dataFormatada, 160, yBox + 58);

      doc.fontSize(7).font('Courier');
      doc.text(`HASH SHA-256: ${relatorio.hash_integridade || 'Pendente de finalização criptográfica'}`, 58, yBox + 70, { width: 480 });

      if (temValidacaoManual) {
        doc.fillColor(AMBAR_ALERTA)
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text(
            `AVISO DE GOVERNANÇA: Validação Manual Assistida aplicada${relatorio.motivo_validacao_manual ? ` (${relatorio.motivo_validacao_manual})` : ''}. Requer atenção na auditoria fiscal.`,
            58,
            yBox + 82,
            { width: 480 }
          );
      }

      // ------------------------------------------------------------------------
      // 3. DADOS CADASTRAIS DA MEDIÇÃO (LAYOUT DINÂMICO SEM SOBREPOSIÇÃO)
      // ------------------------------------------------------------------------
      let currentY = yBox + boxHeight + 16;
      doc.fillColor(AZUL_BB)
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('1. DADOS CADASTRAIS DA MEDIÇÃO', 45, currentY);

      doc.rect(45, currentY + 15, 505, 1).fill(BORDA_CINZA);
      currentY += 22;

      const obra = relatorio.obra || {};
      const usuario = relatorio.usuario || {};
      const respNome = usuario.nome || obra.responsavel || 'Responsável Técnico';
      const respCargo = usuario.cargo || 'empreiteira';
      const respReg = usuario.registro_profissional ? ` • ${usuario.registro_profissional}` : '';

      const coordsTexto =
        relatorio.latitude !== null && relatorio.latitude !== undefined && relatorio.longitude !== null && relatorio.longitude !== undefined
          ? `${Number(relatorio.latitude).toFixed(5)}, ${Number(relatorio.longitude).toFixed(5)}${relatorio.precisao_gps ? ` (±${Math.round(Number(relatorio.precisao_gps))}m)` : ''}`
          : '';
      const localizacaoLinha = relatorio.localizacao_texto
        ? relatorio.localizacao_texto
        : (coordsTexto ? `GPS: ${coordsTexto}` : 'Não capturada no dispositivo');

      const camposCadastrais = [
        { label: 'Obra / Unidade:', value: obra.nome || 'Não informada', color: CINZA_ESCURO },
        { label: 'Endereço:', value: obra.endereco || 'Não informado', color: CINZA_ESCURO },
        { label: 'Tipo de Local:', value: relatorio.tipo_local || obra.tipo || 'Não especificado', color: CINZA_ESCURO },
        { label: 'Localização In-Loco:', value: localizacaoLinha, color: CINZA_ESCURO },
        { label: 'Responsável Técnico:', value: `${respNome} (${respCargo}${respReg})`, color: CINZA_ESCURO },
        {
          label: 'Condição da Obra:',
          value: obra.status || 'REGULAR',
          color: obra.status === 'REGULAR' ? VERDE_SUCESSO : (obra.status === 'PENDENTE_AJUSTE' ? VERMELHO_ERRO : AMBAR_ALERTA),
        },
      ];

      for (const campo of camposCadastrais) {
        doc.font('Helvetica-Bold').fontSize(8.5);
        const valHeight = doc.heightOfString(String(campo.value), { width: 405 });
        const rowH = Math.max(14, valHeight + 3);
        ensureSpace(rowH);

        doc.fillColor(CINZA_ESCURO).font('Helvetica').fontSize(8.5).text(campo.label, 45, currentY);
        doc.fillColor(campo.color).font('Helvetica-Bold').fontSize(8.5).text(String(campo.value), 145, currentY, { width: 405 });
        currentY += rowH;
      }

      // ------------------------------------------------------------------------
      // 4. CHECKLIST TÉCNICO DE VERIFICAÇÃO
      // ------------------------------------------------------------------------
      currentY += 12;
      ensureSpace(45);
      doc.fillColor(AZUL_BB)
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('2. CHECKLIST TÉCNICO DE VERIFICAÇÃO', 45, currentY);

      doc.rect(45, currentY + 15, 505, 1).fill(BORDA_CINZA);
      currentY += 22;

      const respostas = relatorio.respostas || [];
      if (respostas.length === 0) {
        doc.fillColor(CINZA_TEXTO).fontSize(8.5).font('Helvetica-Oblique').text('Nenhum item preenchido neste checklist.', 45, currentY);
        currentY += 18;
      } else {
        respostas.forEach((resp, idx) => {
          const rawPergunta = String(resp.pergunta || 'Item avaliado').replace(/^\d+\.\s*/, '');
          const perguntaTxt = `${idx + 1}. ${rawPergunta}`;
          const valorTxt = `Resposta: [ ${resp.valor || 'Não informado'} ]`;
          const justTxt = resp.justificativa ? `Justificativa Técnica: "${resp.justificativa}"` : '';
          const mostrarSugestaoIa = resp.sugestao_ia && String(resp.sugestao_ia).trim() !== String(resp.valor || '').trim();
          const iaTxt = mostrarSugestaoIa ? `Parecer Técnico / IA: "${resp.sugestao_ia}"` : '';

          doc.font('Helvetica-Bold').fontSize(8.5);
          const hPergunta = doc.heightOfString(perguntaTxt, { width: 495 });
          const hValor = doc.heightOfString(valorTxt, { width: 485 });

          doc.font('Helvetica-Oblique').fontSize(8);
          const hJust = justTxt ? doc.heightOfString(justTxt, { width: 480 }) + 3 : 0;
          const hIa = iaTxt ? doc.heightOfString(iaTxt, { width: 480 }) + 3 : 0;

          const blocoAltura = hPergunta + hValor + hJust + hIa + 14;
          ensureSpace(blocoAltura);

          if (idx % 2 === 0) {
            doc.rect(45, currentY - 3, 505, blocoAltura - 4).fill('#F8FAFC');
          }

          doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica-Bold')
            .text(perguntaTxt, 50, currentY, { width: 495 });
          currentY += hPergunta + 2;

          doc.fillColor(AZUL_BB).fontSize(8.5).font('Helvetica-Bold')
            .text(valorTxt, 58, currentY, { width: 485 });
          currentY += hValor + 3;

          if (justTxt) {
            doc.fillColor(AMBAR_ALERTA).fontSize(8).font('Helvetica-Oblique')
              .text(justTxt, 58, currentY, { width: 480 });
            currentY += hJust;
          }

          if (iaTxt) {
            doc.fillColor(CINZA_TEXTO).fontSize(8).font('Helvetica-Oblique')
              .text(iaTxt, 58, currentY, { width: 480 });
            currentY += hIa;
          }

          currentY += 6;
        });
      }

      // ------------------------------------------------------------------------
      // 5. EVIDÊNCIAS FOTOGRÁFICAS IN-LOCO
      // ------------------------------------------------------------------------
      currentY += 8;
      ensureSpace(160);

      doc.fillColor(AZUL_BB)
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('3. EVIDÊNCIAS FOTOGRÁFICAS IN-LOCO (PROVA TEMPORAL & IA)', 45, currentY);

      doc.rect(45, currentY + 15, 505, 1).fill(BORDA_CINZA);
      currentY += 22;

      const fotos = Array.isArray(relatorio.fotos) ? relatorio.fotos : [];
      if (fotos.length === 0) {
        doc.fillColor(CINZA_TEXTO).fontSize(8.5).font('Helvetica-Oblique').text('Nenhuma evidência fotográfica anexada.', 45, currentY);
        currentY += 20;
      } else {
        fotos.forEach((foto, idx) => {
          ensureSpace(140);

          const fotoBoxY = currentY;
          const cardHeight = 126;
          doc.rect(45, fotoBoxY, 505, cardHeight).fillAndStroke(CINZA_CLARO, BORDA_CINZA);

          let imgInserida = false;
          let imgBuffer = null;

          const candidateBase64 = foto.imagemBase64 || foto.previewDataUrl || (typeof foto.url === 'string' && foto.url.startsWith('data:image/') ? foto.url : null);
          if (candidateBase64) {
            imgBuffer = decodeBase64Image(candidateBase64);
          }

          if (!imgBuffer) {
            const rawSource = foto.caminho_arquivo || foto.url;
            if (rawSource && typeof rawSource === 'string' && !rawSource.startsWith('data:')) {
              try {
                const fullPath = resolveSafePath(rawSource, UPLOAD_ROOT);
                if (fullPath && fs.existsSync(fullPath)) {
                  imgBuffer = fs.readFileSync(fullPath);
                } else {
                  const directEvidencePath = resolveSafePath(path.join('evidencias', path.basename(rawSource)), UPLOAD_ROOT);
                  if (directEvidencePath && fs.existsSync(directEvidencePath)) {
                    imgBuffer = fs.readFileSync(directEvidencePath);
                  }
                }
              } catch (_) {
                imgBuffer = null;
              }
            }
          }

          if (imgBuffer && Buffer.isBuffer(imgBuffer) && imgBuffer.length > 32) {
            try {
              doc.rect(53, fotoBoxY + 8, 149, 110).fillAndStroke('#FFFFFF', BORDA_CINZA);
              doc.image(imgBuffer, 55, fotoBoxY + 10, { fit: [145, 106], align: 'center', valign: 'center' });
              imgInserida = true;
            } catch (errImg) {
              console.warn(`[PDFService] Erro ao renderizar imagem da evidência #${idx + 1}:`, errImg.message);
            }
          }

          const textLeft = imgInserida ? 212 : 58;
          const textWidth = imgInserida ? 328 : 480;

          doc.fillColor(AZUL_BB).fontSize(8.5).font('Helvetica-Bold')
            .text(`Evidência Fotográfica #${idx + 1} (Captura In-Loco • Câmera BBVision)`, textLeft, fotoBoxY + 10, { width: textWidth });

          doc.fillColor(CINZA_ESCURO).fontSize(8).font('Helvetica')
            .text('Validação IA:', textLeft, fotoBoxY + 24);

          const statusIA = foto.avaliacao_gemini || foto.status_ia || 'APROVADO';
          const corIA = statusIA === 'APROVADO' ? VERDE_SUCESSO : (statusIA === 'REJEITADO' ? VERMELHO_ERRO : AMBAR_ALERTA);
          const confVal = foto.confianca !== undefined && foto.confianca !== null ? foto.confianca : foto.confianca_ia;
          const confTexto = confVal !== undefined && confVal !== null ? ` (Confiança: ${Math.round(Number(confVal) * 100)}%)` : '';

          doc.fillColor(corIA).font('Helvetica-Bold')
            .text(`${statusIA}${confTexto}`, textLeft + 56, fotoBoxY + 24, { width: Math.max(120, textWidth - 56) });

          const motivoIA = foto.motivo || foto.motivo_ia || 'Evidência fotográfica registrada em campo.';
          doc.fillColor(CINZA_ESCURO).font('Helvetica')
            .text(`Parecer Técnico / IA: "${motivoIA}"`, textLeft, fotoBoxY + 38, { width: textWidth, height: 28, ellipsis: true });

          const dataHoraStr = foto.data_captura || foto.created_at
            ? new Date(foto.data_captura || foto.created_at).toLocaleString('pt-BR')
            : dataFormatada;
          doc.fillColor(CINZA_TEXTO).fontSize(7.5).font('Helvetica')
            .text(`Carimbo Temporal In-Loco: ${dataHoraStr}`, textLeft, fotoBoxY + 70, { width: textWidth });

          const hashFoto = foto.hash_integridade || foto.hash_sha256 || 'Não disponível';
          doc.fillColor(CINZA_TEXTO).fontSize(6.8).font('Courier')
            .text(`Hash SHA-256: ${hashFoto}`, textLeft, fotoBoxY + 86, { width: textWidth });

          doc.font('Helvetica').fontSize(7.2)
            .text('Origem: Câmera In-Loco BBVision | Bloqueio de Galeria Ativo', textLeft, fotoBoxY + 104, { width: textWidth });

          currentY += cardHeight + 10;
        });
      }

      // ------------------------------------------------------------------------
      // 6. ASSINATURA DIGITAL DO RESPONSÁVEL TÉCNICO
      // ------------------------------------------------------------------------
      const sigBuffer = decodeBase64Image(relatorio.assinatura_base64);
      ensureSpace(sigBuffer ? 115 : 65);

      currentY += 6;
      doc.fillColor(AZUL_BB)
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('4. ASSINATURA DIGITAL E DECLARAÇÃO DE VERACIDADE', 45, currentY);
      doc.rect(45, currentY + 15, 505, 1).fill(BORDA_CINZA);
      currentY += 22;

      if (sigBuffer) {
        doc.rect(45, currentY, 210, 68).fillAndStroke('#FFFFFF', BORDA_CINZA);
        try {
          doc.image(sigBuffer, 52, currentY + 4, { fit: [196, 60], align: 'center', valign: 'center' });
        } catch (_) {}
        doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica-Bold')
          .text(respNome, 270, currentY + 10, { width: 280 });
        doc.fillColor(CINZA_TEXTO).fontSize(8).font('Helvetica')
          .text(`Perfil: ${respCargo}${respReg}`, 270, currentY + 24, { width: 280 })
          .text(`Assinado digitalmente em: ${dataFormatada}`, 270, currentY + 38, { width: 280 })
          .text('Declaração de veracidade confirmada mediante autenticação de credencial.', 270, currentY + 52, { width: 280 });
        currentY += 78;
      } else {
        doc.fillColor(CINZA_TEXTO).fontSize(8.2).font('Helvetica')
          .text(`Responsável Técnico: ${respNome}${respReg} — Autenticado por sessão JWT em ${dataFormatada}.`, 45, currentY, { width: 505 });
        currentY += 20;
      }

      // ------------------------------------------------------------------------
      // 7. PARECER DO FISCAL & TERMO DE NÃO-REPÚDIO
      // ------------------------------------------------------------------------
      const justificativa = relatorio.justificativa_fiscal || relatorio.justificativa || '';
      doc.font('Helvetica').fontSize(8.5);
      const justHeight = justificativa ? doc.heightOfString(`Justificativa / Parecer: "${justificativa}"`, { width: 505 }) : 14;
      ensureSpace(justHeight + 115);

      currentY += 8;
      doc.fillColor(AZUL_BB)
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('5. PARECER DO FISCAL / AUDITORIA DE ENGENHARIA', 45, currentY);

      doc.rect(45, currentY + 15, 505, 1).fill(BORDA_CINZA);
      currentY += 22;

      doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica-Bold')
        .text(`Status de Aprovação: ${relatorio.status}`, 45, currentY);
      currentY += 14;

      if (relatorio.fiscal_julgador && relatorio.fiscal_julgador.nome) {
        const dataJulgStr = relatorio.data_julgamento || relatorio.julgado_em
          ? new Date(relatorio.data_julgamento || relatorio.julgado_em).toLocaleString('pt-BR')
          : '';
        const regFiscal = relatorio.fiscal_julgador.registro_profissional ? ` (${relatorio.fiscal_julgador.registro_profissional})` : '';
        doc.fillColor(CINZA_TEXTO).fontSize(8).font('Helvetica')
          .text(`Auditor(a): ${relatorio.fiscal_julgador.nome}${regFiscal}${dataJulgStr ? ` • Julgado em: ${dataJulgStr}` : ''}`, 45, currentY, { width: 505 });
        currentY += 14;
      }

      if (justificativa) {
        doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica')
          .text(`Justificativa / Parecer: "${justificativa}"`, 45, currentY, { width: 505 });
        currentY += justHeight + 8;
      } else {
        doc.fillColor(CINZA_TEXTO).fontSize(8.5).font('Helvetica-Oblique')
          .text('Aguardando análise conclusiva no Painel de Auditoria da Fiscalização.', 45, currentY);
        currentY += 18;
      }

      // Rodapé Institucional de Fé Pública
      ensureSpace(60);
      currentY += 8;
      doc.rect(45, currentY, 505, 46).fillAndStroke('#F1F5F9', BORDA_CINZA);
      doc.fillColor(CINZA_TEXTO).fontSize(7).font('Helvetica')
        .text('Declaração de Integridade: Este documento foi emitido e selado criptograficamente pelo ecossistema BBVision.', 55, currentY + 7)
        .text('O registro temporal, assinatura digital e hashes SHA-256 garantem o não-repúdio das evidências coletadas em campo.', 55, currentY + 19)
        .text('Banco do Brasil S.A. | Diretoria de Engenharia, Infraestrutura e Patrimônio (DIPAT)', 55, currentY + 31);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function salvarRelatorioPdf(relatorio, uploadSubdir = 'relatorios') {
  const buffer = await gerarRelatorioPdfBuffer(relatorio);
  const targetDir = path.join(UPLOAD_ROOT, uploadSubdir);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const safeCode = (relatorio.codigo_unico || relatorio.id || 'doc').replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `relatorio_${safeCode}_${Date.now()}.pdf`;
  const filePath = path.join(targetDir, fileName);

  await fs.promises.writeFile(filePath, buffer);

  const relativePath = path.join('uploads', uploadSubdir, fileName).replace(/\\/g, '/');
  return { filePath, relativePath, buffer };
}

module.exports = {
  gerarRelatorioPdfBuffer,
  salvarRelatorioPdf,
};
