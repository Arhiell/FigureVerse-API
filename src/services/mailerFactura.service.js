const nodemailer = require("nodemailer");
const CompanyService = require("./company.service");

// Transport SMTP básico usando credenciales de entorno.
// Si cambias el correo real de envío, actualiza MAIL_USER y MAIL_PASS en el entorno.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function enviarFacturaEmail(email_destinatario, factura) {
  // Leer configuración de empresa para construir el remitente visible.
  const settings = await CompanyService.getSettings();
  const fromName = settings?.from_name || process.env.MAIL_FROM_NAME || "FigureVerse";
  const fromEmail = settings?.from_email || process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER;

  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to: email_destinatario,
    subject: `Factura ${factura.numero_factura} - ${fromName}`,
    text: `Hola! Aquí tienes tu factura N° ${factura.numero_factura} por un total de $${factura.total}.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { enviarFacturaEmail };
