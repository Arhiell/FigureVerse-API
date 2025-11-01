const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function enviarFacturaEmail(email_destinatario, factura) {
  const mailOptions = {
    from: `"FigureVerse" <${process.env.MAIL_USER}>`,
    to: email_destinatario,
    subject: `Factura ${factura.numero_factura} - FigureVerse`,
    text: `Hola! Aquí tienes tu factura N° ${factura.numero_factura} por un total de $${factura.total}.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { enviarFacturaEmail };
