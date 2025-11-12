// Importamos Firebase Admin SDK
const admin = require("firebase-admin");
const fs = require("fs");

// Inicialización flexible para Docker/producción:
// 1) Usa JSON embebido vía env `FIREBASE_SERVICE_ACCOUNT` (texto o base64).
// 2) Usa `FIREBASE_SERVICE_ACCOUNT_BASE64` si está presente.
// 3) Si existe, requiere archivo local `../config/firebase/serviceAccountKey.json`.
// 4) Caso contrario, usa `applicationDefault()` (respeta GOOGLE_APPLICATION_CREDENTIALS).
if (!admin.apps.length) {
  let credentials = null;
  let credSource = "applicationDefault"; // valor por defecto

  // Intentar cargar desde env (JSON plano)
  const fromEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (fromEnv) {
    try {
      credentials = JSON.parse(fromEnv);
      credSource = "env_json";
    } catch (_) {
      try {
        // Intentar base64 en el mismo env
        credentials = JSON.parse(Buffer.from(fromEnv, "base64").toString("utf8"));
        credSource = "env_json_base64_in_FSA";
      } catch (_) {}
    }
  }

  // Intentar cargar desde env (base64 dedicado)
  if (!credentials && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
      credentials = JSON.parse(decoded);
      credSource = "env_base64";
    } catch (_) {}
  }

  // Intentar cargar desde ruta especificada en env
  if (!credentials && process.env.FIREBASE_CREDENTIALS_PATH) {
    try {
      const credPath = process.env.FIREBASE_CREDENTIALS_PATH;
      const raw = fs.readFileSync(credPath, "utf8");
      credentials = JSON.parse(raw);
      credSource = "env_path";
    } catch (_) {}
  }

  // Intentar cargar desde archivo local (si existe en el contenedor)
  if (!credentials) {
    try {
      // Este require fallará si el archivo no está disponible (como en Docker)
      credentials = require("../config/firebase/serviceAccountKey.json");
      credSource = "local_file";
    } catch (_) {
      // sin archivo, continuamos con applicationDefault()
    }
  }

  // Intentar archivo alternativo (figureverse.json)
  if (!credentials) {
    try {
      credentials = require("../config/firebase/figureverse.json");
      credSource = "local_file_figureverse";
    } catch (_) {}
  }

  const initOptions = {};
  if (credentials) {
    initOptions.credential = admin.credential.cert(credentials);
  } else {
    // Usa GOOGLE_APPLICATION_CREDENTIALS o credenciales del entorno (gcloud, Workload Identity, etc.)
    initOptions.credential = admin.credential.applicationDefault();
  }

  // Definir projectId de forma robusta
  const detectedProjectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    (credentials && (credentials.project_id || credentials.projectId));
  if (detectedProjectId) {
    initOptions.projectId = detectedProjectId;
  }

  admin.initializeApp(initOptions);
  console.log("Firebase inicializado correctamente (Node). Fuente de credenciales:", credSource);
}

// Obtenemos la referencia a Firestore
const db = admin.firestore();

// Exportamos para usarlo en otras partes del código
module.exports = { admin, db };
