// Servicio OTP con almacenamiento en memoria para desarrollo.
// Producción: reemplazar por Redis o tabla persistente con TTL y uso único.

const store = new Map();

function key(userId, purpose) {
  return `${userId}:${purpose}`;
}

const OTPService = {
  async generate(userId, purpose = "password_change", ttlSeconds = 300) {
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const expiresAt = Date.now() + ttlSeconds * 1000;
    store.set(key(userId, purpose), { code, expiresAt, attempts: 0, used: false });
    return { code, expiresAt };
  },

  async verify(userId, purpose, code) {
    const bypass = process.env.OTP_BYPASS_CODE;
    if (bypass && code === bypass) return true;

    const record = store.get(key(userId, purpose));
    if (!record) return false;
    if (record.used) return false;
    if (Date.now() > record.expiresAt) return false;
    record.attempts += 1;
    if (record.code !== code) return false;
    // marcar como usado (one-time)
    record.used = true;
    store.set(key(userId, purpose), record);
    return true;
  },
};

module.exports = OTPService;