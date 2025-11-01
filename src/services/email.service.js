/*
FILE: email.service.js
Description: Servicio para el envío de correos electrónicos utilizando Nodemailer.
*/

// email.service.js
const nodemailer = require('nodemailer');

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
host: process.env.EMAIL_HOST,
port: parseInt(process.env.EMAIL_PORT || '587', 10),
secure: (process.env.EMAIL_SECURE === 'true') || false, // true for 465, false for other ports
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
}
});


async function sendConfirmationEmail({ to, token, nombre_usuario }) {
const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirm-email?token=${token}`;
const mailOptions = {
from: process.env.EMAIL_FROM || 'no-reply@example.com',
to,
subject: 'Confirma tu correo electrónico',
html: `
<p>Hola ${nombre_usuario || ''},</p>
<p>Gracias por registrarte. Haz clic en el siguiente enlace para confirmar tu correo:</p>
<p><a href="${confirmUrl}">Confirmar correo</a></p>
<p>Si no solicitaste esto, ignora este correo.</p>
`
};
const info = await transporter.sendMail(mailOptions);
return info;
}


module.exports = { sendConfirmationEmail, transporter };