/**
 * BBVision - Configuração de Disparo de E-mail
 * Provedor: Resend (via Nodemailer)
 */

const nodemailer = require('nodemailer');

const resendApiKey = process.env.RESEND_API_KEY || '';
const emailFrom = process.env.EMAIL_FROM || 'bbvision-notificacoes@bancodobrasil.com.br';
const fiscalEmailPadrao = process.env.FISCAL_EMAIL_PADRAO || 'mariana.fiscal@bb.com.br';

let transporter = null;

if (resendApiKey && resendApiKey !== 'sua-chave-resend-aqui') {
  transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: {
      user: 'resend',
      pass: resendApiKey,
    },
  });
} else {
  // Transporter de desenvolvimento (simulado / logging)
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('\n[E-mail Simulado BBVision / Resend]');
      console.log(`De: ${mailOptions.from || emailFrom}`);
      console.log(`Para: ${mailOptions.to}`);
      console.log(`Assunto: ${mailOptions.subject}`);
      console.log(`Anexos: ${mailOptions.attachments ? mailOptions.attachments.map(a => a.filename).join(', ') : 'nenhum'}`);
      console.log('Mensagem:', mailOptions.text || '(HTML)');
      console.log('[E-mail Simulado] Entregue com sucesso no log de auditoria.\n');
      return { messageId: `mock-${Date.now()}`, accepted: [mailOptions.to] };
    },
  };
}

module.exports = {
  transporter,
  emailFrom,
  fiscalEmailPadrao,
  isConfigured: !!(resendApiKey && resendApiKey !== 'sua-chave-resend-aqui'),
};
