/**
 * BBVision - Configuração de Disparo de E-mail Transacional
 * Provedor: Resend (via SMTP / Nodemailer)
 */

const nodemailer = require('nodemailer');

const isPlaceholder = (val) =>
  !val ||
  typeof val !== 'string' ||
  val.includes('sua-chave-') ||
  val.trim() === '';

const resendApiKey = !isPlaceholder(process.env.RESEND_API_KEY) ? process.env.RESEND_API_KEY.trim() : '';
const emailFrom = (process.env.EMAIL_FROM || 'nao-responda@bbvision.com.br').trim();
const fiscalEmailPadrao = (process.env.FISCAL_EMAIL_PADRAO || '').trim();

let transporter = null;

if (resendApiKey) {
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
  // Modo de auditoria em log quando RESEND_API_KEY não estiver definida no .env
  transporter = {
    sendMail: async (mailOptions) => {
      console.log(`[Email Audit Log] De: ${mailOptions.from || emailFrom} | Para: ${mailOptions.to} | Assunto: ${mailOptions.subject}`);
      return { messageId: `audit-${Date.now()}`, accepted: [mailOptions.to], simulated: true };
    },
  };
}

module.exports = {
  transporter,
  emailFrom,
  fiscalEmailPadrao,
  isConfigured: Boolean(resendApiKey),
};
