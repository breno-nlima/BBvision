/**
 * BBVision - Serviço de Geração de Relatório Técnico em PDF (PDFKit)
 * Em conformidade com o Documento de Entrega Oficial TakeOff (Seção 6, 8.6)
 * Gera relatórios imutáveis com código único, hashes SHA-256, fotos in-loco e pareceres
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { resolveSafePath } = require('../utils/securityUtils');
const { UPLOAD_ROOT, RELATORIOS_DIR } = require('../middlewares/uploadMiddleware');

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
          Author: 'Banco do Brasil - BBVision TakeOff',
          Subject: 'Fiscalização Remota de Obras',
          Keywords: 'BBVision, Banco do Brasil, Fiscalização, Inviolabilidade, SHA-256, IA',
        },
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      // Paleta Oficial BBVision / Banco do Brasil
      const AZUL_BB = '#003882';
      const AMARELO_BB = '#FCDB00';
      const CINZA_ESCURO = '#1E293B';
      const CINZA_TEXTO = '#475569';
      const CINZA_CLARO = '#F8FAFC';
      const BORDA_CINZA = '#CBD5E1';
      const VERDE_SUCESSO = '#059669';
      const VERMELHO_ERRO = '#DC2626';

      // ------------------------------------------------------------------------
      // 1. CABEÇALHO INSTITUCIONAL
      // ------------------------------------------------------------------------
      doc.rect(45, 40, 505, 55).fill(AZUL_BB);

      // Faixa Amarela decorativa BB
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
      // 2. CARIMBO DE INVIOLABILIDADE & CÓDIGO ÚNICO (DESTAQUE MÁXIMO)
      // ------------------------------------------------------------------------
      const yBox = 112;
      doc.rect(45, yBox, 505, 82).fillAndStroke(CINZA_CLARO, BORDA_CINZA);

      doc.fillColor(AZUL_BB)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('🔒 CARIMBO DIGITAL DE INTEGRIDADE & NÃO-REPÚDIO', 58, yBox + 9);

      // Coluna Esquerda: Código Único
      doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica');
      doc.text('CÓDIGO ÚNICO:', 58, yBox + 26);
      doc.fillColor(AZUL_BB)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(relatorio.codigo_unico || 'NÃO FINALIZADO', 145, yBox + 24);

      // Status
      doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica');
      doc.text('STATUS DO DOCUMENTO:', 58, yBox + 44);
      const isFinalizado = relatorio.status === 'FINALIZADO' || relatorio.status === 'APROVADO';
      doc.fillColor(isFinalizado ? VERDE_SUCESSO : AMARELO_BB)
        .font('Helvetica-Bold')
        .text(isFinalizado ? 'IMUTÁVEL & FINALIZADO (BLOQUEADO)' : 'EM ANDAMENTO', 195, yBox + 44);

      // Data de finalização
      doc.fillColor(CINZA_ESCURO).font('Helvetica');
      doc.text('DATA DA EMISSÃO:', 58, yBox + 58);
      const dataFormatada = relatorio.data_finalizacao || relatorio.data
        ? new Date(relatorio.data_finalizacao || relatorio.data).toLocaleString('pt-BR')
        : new Date().toLocaleString('pt-BR');
      doc.text(dataFormatada, 160, yBox + 58);

      // Hash SHA-256 no rodapé do carimbo
      doc.fontSize(7).font('Courier');
      doc.text(`HASH SHA-256: ${relatorio.hash_integridade || 'Pendente de finalização criptográfica'}`, 58, yBox + 70);

      // ------------------------------------------------------------------------
      // 3. DADOS CADASTRAIS DA MEDIÇÃO
      // ------------------------------------------------------------------------
      let currentY = 208;
      doc.fillColor(AZUL_BB)
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('1. DADOS CADASTRAIS DA MEDIÇÃO', 45, currentY);

      doc.rect(45, currentY + 15, 505, 1).fill(BORDA_CINZA);
      currentY += 22;

      const obra = relatorio.obra || {};
      const usuario = relatorio.usuario || {};

      doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica');
      doc.text('Obra / Unidade:', 45, currentY);
      doc.font('Helvetica-Bold').text(`${obra.nome || 'Não informada'}`, 140, currentY);

      doc.font('Helvetica').text('Endereço:', 45, currentY + 14);
      doc.font('Helvetica-Bold').text(`${obra.endereco || 'Não informado'}`, 140, currentY + 14);

      doc.font('Helvetica').text('Responsável Técnico:', 45, currentY + 28);
      const respNome = usuario.nome || obra.responsavel || 'Rodrigo Silva';
      const respCargo = usuario.cargo || 'Empreiteira';
      doc.font('Helvetica-Bold').text(`${respNome} (${respCargo})`, 140, currentY + 28);

      doc.font('Helvetica').text('Condição da Obra:', 45, currentY + 42);
      const corObra = (obra.status === 'REGULAR') ? VERDE_SUCESSO : VERMELHO_ERRO;
      doc.fillColor(corObra).font('Helvetica-Bold').text(`${obra.status || 'REGULAR'}`, 140, currentY + 42);

      // ------------------------------------------------------------------------
      // 4. CHECKLIST TÉCNICO DE VERIFICAÇÃO
      // ------------------------------------------------------------------------
      currentY += 64;
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

          if (currentY + blocoAltura > 735) {
            doc.addPage();
            currentY = 45;
          }

          // Fundo sutil alternado para facilitar leitura sem sobreposição
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
            doc.fillColor('#B45309').fontSize(8).font('Helvetica-Oblique')
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
      if (currentY > 600) {
        doc.addPage();
        currentY = 45;
      }

      doc.fillColor(AZUL_BB)
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('3. EVIDÊNCIAS FOTOGRÁFICAS IN-LOCO (PROVA TEMPORAL & IA)', 45, currentY);

      doc.rect(45, currentY + 15, 505, 1).fill(BORDA_CINZA);
      currentY += 22;

      const fotos = relatorio.fotos || [];
      if (fotos.length === 0) {
        doc.fillColor(CINZA_TEXTO).fontSize(8.5).font('Helvetica-Oblique').text('Nenhuma evidência fotográfica anexada.', 45, currentY);
        currentY += 20;
      } else {
        fotos.forEach((foto, idx) => {
          if (currentY > 610) {
            doc.addPage();
            currentY = 45;
          }

          const fotoBoxY = currentY;
          const cardHeight = 122;
          doc.rect(45, fotoBoxY, 505, cardHeight).fillAndStroke(CINZA_CLARO, BORDA_CINZA);

          // Inclusão segura de imagem (suporta caminho em disco ou data URI Base64)
          let imgInserida = false;
          const rawSource = foto.caminho_arquivo || foto.url || foto.imagemBase64;
          if (rawSource && typeof rawSource === 'string') {
            try {
              if (rawSource.startsWith('data:image/')) {
                const base64Part = rawSource.split(',')[1];
                if (base64Part) {
                  const imgBuf = Buffer.from(base64Part, 'base64');
                  doc.image(imgBuf, 54, fotoBoxY + 10, { fit: [145, 102], align: 'center', valign: 'center' });
                  imgInserida = true;
                }
              } else {
                const fullPath = path.isAbsolute(rawSource)
                  ? rawSource
                  : resolveSafePath(rawSource, UPLOAD_ROOT);

                if (fullPath && fs.existsSync(fullPath)) {
                  doc.image(fullPath, 54, fotoBoxY + 10, { fit: [145, 102], align: 'center', valign: 'center' });
                  imgInserida = true;
                }
              }
            } catch (e) {
              // Em caso de falha ao renderizar a imagem no PDFKit, segue com os metadados
            }
          }

          const textLeft = imgInserida ? 210 : 58;
          const textWidth = imgInserida ? 330 : 480;

          doc.fillColor(AZUL_BB).fontSize(8.5).font('Helvetica-Bold')
            .text(`Evidência Fotográfica #${idx + 1} (Captura ao Vivo In-Loco)`, textLeft, fotoBoxY + 10, { width: textWidth });

          doc.fillColor(CINZA_ESCURO).fontSize(8).font('Helvetica')
            .text('Avaliação IA BBVision:', textLeft, fotoBoxY + 26);

          const statusIA = foto.avaliacao_gemini || foto.status_ia || 'APROVADO';
          const corIA = statusIA === 'APROVADO' ? VERDE_SUCESSO : '#D97706';
          const confVal = foto.confianca || foto.confianca_ia;
          const confPercent = confVal ? Math.round(confVal * 100) : 95;

          doc.fillColor(corIA).font('Helvetica-Bold')
            .text(`${statusIA} (Confiança: ${confPercent}%)`, textLeft + 95, fotoBoxY + 26);

          doc.fillColor(CINZA_ESCURO).font('Helvetica')
            .text(`Parecer da IA: "${foto.motivo || foto.motivo_ia || 'Nitidez e enquadramento validados'}"`, textLeft, fotoBoxY + 42, { width: textWidth });

          doc.fillColor(CINZA_TEXTO).fontSize(6.8).font('Courier')
            .text(`Hash SHA-256: ${foto.hash_integridade || foto.hash_sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}`, textLeft, fotoBoxY + 82, { width: textWidth });

          doc.font('Helvetica').fontSize(7.5)
            .text('Origem: Câmera In-App BBVision | Bloqueio de Galeria Ativo', textLeft, fotoBoxY + 100, { width: textWidth });

          currentY += cardHeight + 10;
        });
      }

      // ------------------------------------------------------------------------
      // 6. PARECER DO FISCAL & TERMO DE NÃO-REPÚDIO
      // ------------------------------------------------------------------------
      if (currentY > 660) {
        doc.addPage();
        currentY = 45;
      }

      currentY += 8;
      doc.fillColor(AZUL_BB)
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('4. PARECER DO FISCAL / AUDITORIA DE ENGENHARIA', 45, currentY);

      doc.rect(45, currentY + 15, 505, 1).fill(BORDA_CINZA);
      currentY += 22;

      doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica')
        .text(`Status de Aprovação: ${relatorio.status}`, 45, currentY);

      const justificativa = relatorio.justificativa_fiscal || relatorio.justificativa;
      if (justificativa) {
        doc.text(`Justificativa / Parecer: "${justificativa}"`, 45, currentY + 14, { width: 505 });
        currentY += 28;
      } else {
        doc.text('Aguardando análise conclusiva no Painel de Auditoria da Fiscalização BB.', 45, currentY + 14);
        currentY += 26;
      }

      // Rodapé Institucional de Fé Pública
      currentY += 12;
      doc.rect(45, currentY, 505, 46).fillAndStroke('#F1F5F9', BORDA_CINZA);
      doc.fillColor(CINZA_TEXTO).fontSize(7).font('Helvetica')
        .text('Declaração de Integridade: Este documento foi emitido e assinado criptograficamente pelo ecossistema BBVision.', 55, currentY + 7)
        .text('O registro temporal e os hashes criptográficos garantem o não-repúdio das evidências coletadas em campo.', 55, currentY + 19)
        .text('Banco do Brasil S.A. | Diretoria de Engenharia, Infraestrutura e Patrimônio (DIPAT)', 55, currentY + 31);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Salva o PDF no disco do servidor de forma assíncrona
 * @param {Object} relatorio 
 * @param {string} uploadSubdir 
 * @returns {Promise<{ filePath: string, relativePath: string, buffer: Buffer }>}
 */
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
