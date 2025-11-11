const jwt = require("jsonwebtoken");

const PasswordResetService = {
  issue(userId, ttlSeconds = 3600) {
    const secret = process.env.RESET_TOKEN_SECRET || "dev_reset_secret";
    const token = jwt.sign({ sub: userId, purpose: "password_reset" }, secret, {
      expiresIn: ttlSeconds,
    });
    return { token, expiresIn: ttlSeconds };
  },

  verify(token) {
    const secret = process.env.RESET_TOKEN_SECRET || "dev_reset_secret";
    try {
      const payload = jwt.verify(token, secret);
      if (payload?.purpose !== "password_reset") throw new Error("Invalid purpose");
      return { ok: true, userId: payload.sub };
    } catch (err) {
      return { ok: false, error: "Token inválido o expirado" };
    }
  },
};

module.exports = PasswordResetService;