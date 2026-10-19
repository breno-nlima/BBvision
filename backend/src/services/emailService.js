/**
 * BBVision - Serviço de Envio de E-mails Transacionais
 * Dispara notificação e relatório PDF para o fiscal Mariana e equipe de engenharia
 * Provedor: Resend (integrado via Nodemailer) com fallback resiliente de auditoria em dev
 */

const { transporter, emailFrom, fiscalEmailPadrao } = require('../config/email');
const { isValidEmail } = require('../utils/securityUtils');

/**
 * Envia o PDF do relatório por e-mail após a finalização da vistoria técnica
 * @param {Object} relatorio Dados do relatório finalizado
 * @param {Buffer} pdfBuffer Buffer do arquivo PDF gerado
 * @param {string} destinatario E-mail do destinatário (opcional)
 * @returns {Promise<{ sucesso: boolean, messageId?: string, destinatario: string, erro?: string }>}
 */
async function enviarRelatorioEmail(relatorio, pdfBuffer, destinatario = null) {
  let targetEmail = destinatario || fiscalEmailPadrao;

  // Validação defensiva do e-mail de destino
  if (!isValidEmail(targetEmail)) {
    console.warn(`[Email Service] Destinatário inválido "${targetEmail}". Recorrendo ao e-mail fiscal padrão.`);
    targetEmail = fiscalEmailPadrao;
  }

  const codigo = relatorio.codigo_unico || 'N/A';
  const obraNome = (relatorio.obra && relatorio.obra.nome) || relatorio.obra_nome || 'Obra Monitorada';

  const mailOptions = {
    from: `"BBVision - Banco do Brasil" <${emailFrom}>`,
    to: targetEmail,
    subject: `[BBVision] Relatório de Vistoria Finalizado - ${obraNome} (Cód: ${codigo})`,
    text: 
      `Prezado(a) Fiscal Mariana,\n\n` +
      `A vistoria técnica in-loco da obra "${obraNome}" foi finalizada com sucesso.\n\n` +
      `Código Único: ${codigo}\n` +
      `Hash de Integridade: ${relatorio.hash_integridade || 'N/A'}\n` +
      `Data: ${new Date().toLocaleString('pt-BR')}\n\n` +
      `O relatório oficial em PDF com fotos in-loco e análises de IA segue em anexo para sua auditoria no painel.\n\n` +
      `Atenciosamente,\n` +
      `Equipe BBVision - Banco do Brasil`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #003882; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px;">BANCO DO BRASIL | BBVision</h2>
          <p style="margin: 5px 0 0; font-size: 13px; color: #fcdb00;">Fiscalização e Monitoramento Remoto de Obras</p>
        </div>
        <div style="padding: 24px;">
          <h3 style="color: #003882; margin-top: 0;">Novo Relatório Finalizado para Auditoria</h3>
          <p>A empreiteira concluiu a vistoria técnica da seguinte obra:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #f8fafc; border-radius: 6px;">
            <tr>
              <td style="padding: 10px; font-weight: bold; width: 140px; border-bottom: 1px solid #e2e8f0;">Obra:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${obraNome}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Código Único:</td>
              <td style="padding: 10px; font-family: monospace; font-size: 15px; color: #003882; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${codigo}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Hash SHA-256:</td>
              <td style="padding: 10px; font-family: monospace; font-size: 11px; word-break: break-all; border-bottom: 1px solid #e2e8f0;">${relatorio.hash_integridade || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Status:</td>
              <td style="padding: 10px; color: #059669; font-weight: bold;">FINALIZADO (Inviolável)</td>
            </tr>
          </table>
          <p style="font-size: 14px; color: #475569;">
            O arquivo PDF oficial completo com as fotos in-loco, pareceres do Google Gemini 1.5 Flash e respostas do checklist segue anexado a esta mensagem.
          </p>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b;">
          Banco do Brasil S.A. &bull; Diretoria de Engenharia, Infraestrutura e Patrimônio &bull; BBVision
        </div>
      </div>
    `,
    attachments: pdfBuffer ? [
      {
        filename: `BBVision_Relatorio_${codigo}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ] : [],
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Relatório enviado para ${targetEmail} (MessageId: ${result.messageId})`);
    return { sucesso: true, messageId: result.messageId, destinatario: targetEmail };
  } catch (error) {
    console.error('[Email Service] Falha ao enviar e-mail:', error.message);
    // Não interrompe o fluxo de finalização do relatório
    return { sucesso: false, destinatario: targetEmail, erro: error.message };
  }
}

module.exports = {
  enviarRelatorioEmail,
};
