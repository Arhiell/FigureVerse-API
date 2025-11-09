"use strict";

/**
 * Servicio de envío de emails.
 *
 * Este módulo centraliza el envío de correos para distintos propósitos
 * (OTP para verificación de dos pasos y enlaces de restablecimiento de contraseña).
 * Utiliza `nodemailer` con credenciales SMTP configuradas por variables de entorno.
 *
 * Variables de entorno requeridas:
 * - SMTP_HOST: Host del servidor SMTP (por ejemplo, smtp.gmail.com)
 * - SMTP_PORT: Puerto del servidor SMTP (por ejemplo, 465 para TLS, 587 para STARTTLS)
 * - SMTP_SECURE: "true" si se usa conexión segura directa (TLS en 465); "false" para STARTTLS
 * - MAIL_USER: Usuario/correo autenticado en SMTP (cuenta emisora, ej. tanototo113@gmail.com)
 * - MAIL_PASS: Password o App Password del usuario SMTP
 * - SMTP_FROM: Dirección del remitente mostrada en los correos (ej. "FigureVerse <no-reply@figureverse.com>")
 *
 * Buenas prácticas:
 * - Usar App Password si se integra con Gmail.
 * - Evitar loguear el contenido sensible de los correos en producción.
 * - Implementar un mecanismo de reintento y/o una cola si el envío falla.
 */

const nodemailer = require("nodemailer");

// Cache del transporter para evitar recrearlo en cada envío.
let cachedTransporter = null;

/**
 * Crea (o reutiliza) un transporter de nodemailer basado en las variables de entorno.
 * Devuelve una instancia lista para enviar correos.
 */
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Configuración SMTP incompleta: se requieren SMTP_HOST, MAIL_USER y MAIL_PASS"
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure, // true para 465 (TLS), false para 587/STARTTLS
    auth: { user, pass },
  });

  return cachedTransporter;
}

/**
 * Envía un correo genérico.
 *
 * Parámetros:
 * - to: correo de destino del usuario
 * - subject: asunto del correo
 * - html: contenido HTML del correo
 * - text: contenido alterno en texto plano (opcional)
 */
async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.MAIL_USER;

  if (!to) throw new Error("El parámetro 'to' es obligatorio");
  if (!subject) throw new Error("El parámetro 'subject' es obligatorio");
  if (!html && !text) throw new Error("Se requiere 'html' o 'text' en el correo");

  const info = await transporter.sendMail({ from, to, subject, html, text });

  // Nota: En producción no conviene loguear info.messageId y similares
  return info;
}

/**
 * Envía un correo con un código OTP de 6 dígitos.
 *
 * Parámetros:
 * - to: correo de destino del usuario
 * - code: código OTP a enviar
 * - ttlSeconds: tiempo de vida del código en segundos
 */
async function sendOtpEmail(to, code, ttlSeconds) {
  const minutes = Math.max(1, Math.floor((ttlSeconds || 0) / 60));
  const subject = "Tu código de verificación (OTP)";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Verificación de seguridad</h2>
      <p>Tu código de verificación es:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px;">
        ${String(code)}
      </div>
      <p>Este código expira en ${minutes} minuto(s). No lo compartas con nadie.</p>
      <hr/>
      <p>Si no solicitaste este código, ignora este mensaje.</p>
    </div>
  `;

  const text = `Tu código de verificación es ${code}. Expira en ${minutes} minuto(s).`;

  return sendEmail({ to, subject, html, text });
}

/**
 * Envía un correo con un enlace o token para restablecer la contraseña.
 *
 * Parámetros:
 * - to: correo de destino del usuario
 * - token: token JWT de restablecimiento
 * - expiresIn: tiempo de vida del token en segundos
 * - baseUrl: URL del frontend para armar el enlace de restablecimiento (opcional)
 */
async function sendPasswordResetEmail(to, token, expiresIn, baseUrl) {
  const minutes = Math.max(1, Math.floor((expiresIn || 0) / 60));
  const subject = "Restablecer tu contraseña";

  // Si se provee baseUrl, armamos un enlace con query param token; de lo contrario, mostramos el token.
  const resetLink = baseUrl ? `${baseUrl}?token=${encodeURIComponent(token)}` : null;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Restablecimiento de contraseña</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      ${resetLink
        ? `<p>Puedes continuar haciendo clic en este enlace:</p>
           <p><a href="${resetLink}" target="_blank">Restablecer contraseña</a></p>`
        : `<p>Usa este token para restablecer tu contraseña:</p>
           <pre style="background: #f6f6f6; padding: 12px;">${token}</pre>`
      }
      <p>Este enlace/token expira en ${minutes} minuto(s).</p>
      <hr/>
      <p>Si tú no solicitaste restablecer la contraseña, ignora este mensaje.</p>
    </div>
  `;

  const text = resetLink
    ? `Para restablecer tu contraseña, visita: ${resetLink}. Expira en ${minutes} minuto(s).`
    : `Token de restablecimiento: ${token}. Expira en ${minutes} minuto(s).`;

  return sendEmail({ to, subject, html, text });
}

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
};