// Importamos la instancia de Firestore desde firebase.js
const { db } = require("./firebase");

/**
 * publishEvent
 * Guarda un evento en la colección "events" de Firestore.
 * Cada evento sigue el contrato JSON v1 (usado por Django).
 */
async function publishEvent({ event, payload }) {
  try {
    // Generamos un timestamp ISO
    const now = new Date().toISOString();

    // Armamos el documento del evento
    const doc = {
      event,             // Nombre del evento (OrderCreated, ProductUpdated, etc.)
      version: "v1",     // Versión del contrato
      timestamp: now,    // Fecha del evento
      origin: "node-core", //  Origen del evento (tu API Node)
      payload: payload || {} //  Datos del evento
    };

    // Lo guardamos en la colección "events"
    await db.collection("events").add(doc);

    console.log(`Evento publicado en Firestore: ${event}`);
    return true;
  } catch (err) {
    console.error("Error al publicar evento en Firestore:", err);
    return false;
  }
}

module.exports = { publishEvent };
