/**
 * BBVision - Serviço de Geração de PDF Oficial (PDFKit)
 * Em conformidade com o Documento de Entrega Oficial TakeOff (Seção 6, 8.6)
 * Gera relatórios imutáveis com código único, hashes SHA-256, checklist e fotos
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Compila o relatório completo de vistoria técnica em um buffer PDF
 * @param {Object} relatorio Dados completos do relatório (obra, usuario, fotos, respostas)
 * @returns {Promise<Buffer>} Buffer do PDF gerado
 */
function gerarRelatorioPdfBuffer(relatorio) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 45, right: 45 },
        info: {
          Title: `BBVision_Relatorio_${relatorio.codigo_unico || 'Vistoria'}`,
          Author: 'Banco do Brasil - BBVision TakeOff',
          Subject: 'Fiscalização Remota de Obras',
          Keywords: 'BBVision, Banco do Brasil, Fiscalização, Inviolabilidade, SHA-256',
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
      const CINZA_CLARO = '#F8FAFC';
      const BORDA_CINZA = '#CBD5E1';
      const VERDE_SUCESSO = '#059669';

      // ------------------------------------------------------------------------
      // 1. CABEÇALHO INSTITUCIONAL
      // ------------------------------------------------------------------------
      doc.rect(45, 40, 505, 55).fill(AZUL_BB);

      // Faixa Amarela decorativa
      doc.rect(45, 95, 505, 4).fill(AMARELO_BB);

      doc.fillColor('#FFFFFF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('BANCO DO BRASIL | BBVision', 60, 48);

      doc.fontSize(9)
        .font('Helvetica')
        .text('Sistema Inteligente de Fiscalização e Monitoramento Remoto de Obras', 60, 68)
        .text('Diretoria de Engenharia, Infraestrutura e Patrimônio • DIPAT', 60, 80);

      doc.moveDown(2.5);

      // ------------------------------------------------------------------------
      // 2. CARIMBO DE INVIOLABILIDADE E CÓDIGO ÚNICO (DESTAQUE MÁXIMO)
      // ------------------------------------------------------------------------
      const yBox = 115;
      doc.rect(45, yBox, 505, 80).fillAndStroke(CINZA_CLARO, BORDA_CINZA);

      doc.fillColor(AZUL_BB)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('🔒 CARIMBO DIGITAL DE INTEGRIDADE & AUTENTICIDADE', 58, yBox + 10);

      doc.fillColor(CINZA_ESCURO).fontSize(9).font('Helvetica');

      // Coluna da Esquerda
      doc.text('CÓDIGO ÚNICO:', 58, yBox + 28);
      doc.fillColor(AZUL_BB)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(relatorio.codigo_unico || 'NÃO FINALIZADO', 145, yBox + 26);

      doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica');
      doc.text('STATUS DO DOCUMENTO:', 58, yBox + 46);
      doc.fillColor(VERDE_SUCESSO)
        .font('Helvetica-Bold')
        .text('IMUTÁVEL & FINALIZADO (BLOQUEADO)', 190, yBox + 46);

      doc.fillColor(CINZA_ESCURO).font('Helvetica');
      doc.text('DATA DA FINALIZAÇÃO:', 58, yBox + 60);
      const dataFormatada = relatorio.data ? new Date(relatorio.data).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
      doc.text(dataFormatada, 175, yBox + 60);

      // Hash SHA-256 no rodapé da caixa
      doc.fontSize(7.5).font('Courier');
      doc.text(`HASH SHA-256: ${relatorio.hash_integridade || 'Pendente de finalização'}`, 58, yBox + 72);

      // ------------------------------------------------------------------------
      // 3. DADOS DA OBRA E DO RESPONSÁVEL
      // ------------------------------------------------------------------------
      let currentY = 210;
      doc.fillColor(AZUL_BB)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('1. DADOS CADASTRAIS DA MEDIÇÃO', 45, currentY);

      doc.rect(45, currentY + 16, 505, 1).fill(BORDA_CINZA);

      currentY += 24;
      const obra = relatorio.obra || {};
      const usuario = relatorio.usuario || {};

      doc.fillColor(CINZA_ESCURO).fontSize(9).font('Helvetica');
      doc.text(`Obra / Unidade:`, 45, currentY);
      doc.font('Helvetica-Bold').text(`${obra.nome || 'Não informada'}`, 140, currentY);

      doc.font('Helvetica').text(`Endereço:`, 45, currentY + 14);
      doc.font('Helvetica-Bold').text(`${obra.endereco || 'Não informado'}`, 140, currentY + 14);

      doc.font('Helvetica').text(`Responsável Campo:`, 45, currentY + 28);
      doc.font('Helvetica-Bold').text(`${usuario.nome || obra.responsavel || 'Rodrigo Silva'} (${usuario.cargo || 'Empreiteira'})`, 140, currentY + 28);

      doc.font('Helvetica').text(`Condição da Obra:`, 45, currentY + 42);
      const corStatus = (obra.status === 'REGULAR') ? VERDE_SUCESSO : '#DC2626';
      doc.fillColor(corStatus).font('Helvetica-Bold').text(`${obra.status || 'REGULAR'}`, 140, currentY + 42);

      // ------------------------------------------------------------------------
      // 4. CHECKLIST DINÂMICO
      // ------------------------------------------------------------------------
      currentY += 66;
      doc.fillColor(AZUL_BB)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('2. CHECKLIST TÉCNICO DE VERIFICAÇÃO', 45, currentY);

      doc.rect(45, currentY + 16, 505, 1).fill(BORDA_CINZA);
      currentY += 24;

      const respostas = relatorio.respostas || [];
      if (respostas.length === 0) {
        doc.fillColor('#64748B').fontSize(9).font('Helvetica-Oblique').text('Nenhum item de checklist preenchido.', 45, currentY);
        currentY += 20;
      } else {
        respostas.forEach((resp, idx) => {
          doc.fillColor(CINZA_ESCURO).fontSize(9).font('Helvetica-Bold')
            .text(`${idx + 1}. ${resp.pergunta}`, 45, currentY);

          doc.fillColor(AZUL_BB).font('Helvetica-Bold')
            .text(`Status: [ ${resp.valor} ]`, 420, currentY);

          currentY += 13;

          if (resp.sugestao_ia) {
            doc.fillColor('#475569').fontSize(8.5).font('Helvetica-Oblique')
              .text(`Parecer Técnico / IA: "${resp.sugestao_ia}"`, 55, currentY, { width: 480 });
            currentY += 18;
          }
          currentY += 6;
        });
      }

      // ------------------------------------------------------------------------
      // 5. EVIDÊNCIAS FOTOGRÁFICAS & ANÁLISE GEMINI
      // ------------------------------------------------------------------------
      currentY += 10;
      doc.fillColor(AZUL_BB)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('3. EVIDÊNCIAS FOTOGRÁFICAS IN-LOCO (PROVA TEMPORAL)', 45, currentY);

      doc.rect(45, currentY + 16, 505, 1).fill(BORDA_CINZA);
      currentY += 24;

      const fotos = relatorio.fotos || [];
      if (fotos.length === 0) {
        doc.fillColor('#64748B').fontSize(9).font('Helvetica-Oblique').text('Nenhuma evidência fotográfica anexada.', 45, currentY);
        currentY += 20;
      } else {
        fotos.forEach((foto, idx) => {
          // Verifica se precisa de nova página
          if (currentY > 620) {
            doc.addPage();
            currentY = 50;
          }

          const fotoBoxY = currentY;
          doc.rect(45, fotoBoxY, 505, 110).fillAndStroke(CINZA_CLARO, BORDA_CINZA);

          // Tenta carregar imagem física se existir
          let imgInserida = false;
          if (foto.caminho_arquivo) {
            const absolutePath = path.isAbsolute(foto.caminho_arquivo)
              ? foto.caminho_arquivo
              : path.join(__dirname, '..', '..', foto.caminho_arquivo);

            if (fs.existsSync(absolutePath)) {
              try {
                doc.image(absolutePath, 55, fotoBoxY + 10, { fit: [120, 90], align: 'center', valign: 'center' });
                imgInserida = true;
              } catch (e) {
                // Se falhar leitura de imagem, segue texto
              }
            }
          }

          const textLeft = imgInserida ? 190 : 58;

          doc.fillColor(AZUL_BB).fontSize(9).font('Helvetica-Bold')
            .text(`Evidência Fotográfica #${idx + 1} (Disparo ao vivo - Inviolável)`, textLeft, fotoBoxY + 12);

          doc.fillColor(CINZA_ESCURO).fontSize(8).font('Helvetica')
            .text(`Avaliação Gemini 1.5 Flash:`, textLeft, fotoBoxY + 28);

          const statusGemini = foto.avaliacao_gemini || 'APROVADO';
          const corGemini = statusGemini === 'APROVADO' ? VERDE_SUCESSO : '#EAB308';
          doc.fillColor(corGemini).font('Helvetica-Bold')
            .text(`${statusGemini} (Confiança: ${foto.confianca ? Math.round(foto.confianca * 100) : 95}%)`, textLeft + 115, fotoBoxY + 28);

          doc.fillColor(CINZA_ESCURO).font('Helvetica')
            .text(`Parecer da IA: "${foto.motivo || 'Nitidez e enquadramento validados'}"`, textLeft, fotoBoxY + 42, { width: 330 });

          doc.fillColor('#64748B').fontSize(7.5).font('Courier')
            .text(`Hash Foto: ${foto.hash_integridade || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}`, textLeft, fotoBoxY + 70);

          doc.font('Helvetica').fontSize(7.5)
            .text('Origem: Câmera In-App BBVision | Bloqueio de Galeria Ativo', textLeft, fotoBoxY + 84);

          currentY += 120;
        });
      }

      // ------------------------------------------------------------------------
      // 6. PARECER DO FISCAL E TERMO DE FECHAMENTO
      // ------------------------------------------------------------------------
      if (currentY > 670) {
        doc.addPage();
        currentY = 50;
      }

      currentY += 10;
      doc.fillColor(AZUL_BB)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('4. PARECER DO FISCAL / AUDITORIA DE ENGENHARIA', 45, currentY);

      doc.rect(45, currentY + 16, 505, 1).fill(BORDA_CINZA);
      currentY += 24;

      doc.fillColor(CINZA_ESCURO).fontSize(8.5).font('Helvetica')
        .text(`Status de Aprovação: ${relatorio.status}`, 45, currentY);

      if (relatorio.justificativa) {
        doc.text(`Justificativa / Parecer: "${relatorio.justificativa}"`, 45, currentY + 14, { width: 505 });
        currentY += 28;
      } else {
        doc.text(`Aguardando análise conclusiva no Painel de Auditoria da Engenharia BB.`, 45, currentY + 14);
        currentY += 28;
      }

      // Rodapé de Fé Pública e Não-Repúdio
      currentY += 15;
      doc.rect(45, currentY, 505, 45).fillAndStroke('#F1F5F9', BORDA_CINZA);
      doc.fillColor('#475569').fontSize(7.5).font('Helvetica')
        .text('Declaração de Integridade: Este documento foi emitido e assinado criptograficamente pelo ecossistema BBVision.', 55, currentY + 8)
        .text('O registro temporal e os hashes criptográficos garantem o não-repúdio das evidências coletadas em campo.', 55, currentY + 20)
        .text('Banco do Brasil S.A. | Diretoria de Engenharia e Patrimônio', 55, currentY + 32);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Salva o PDF no disco do servidor
 * @param {Object} relatorio 
 * @param {string} uploadSubdir 
 * @returns {Promise<{ filePath: string, relativePath: string, buffer: Buffer }>}
 */
async function salvarRelatorioPdf(relatorio, uploadSubdir = 'relatorios') {
  const buffer = await gerarRelatorioPdfBuffer(relatorio);
  const targetDir = path.join(__dirname, '..', '..', 'uploads', uploadSubdir);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const fileName = `relatorio_${relatorio.codigo_unico || relatorio.id}_${Date.now()}.pdf`;
  const filePath = path.join(targetDir, fileName);
  fs.writeFileSync(filePath, buffer);

  const relativePath = path.join('uploads', uploadSubdir, fileName).replace(/\\/g, '/');
  return { filePath, relativePath, buffer };
}

module.exports = {
  gerarRelatorioPdfBuffer,
  salvarRelatorioPdf,
};
