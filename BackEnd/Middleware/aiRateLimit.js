const rateLimit = require("express-rate-limit");
require('dotenv').config()
const aiRateLimit = rateLimit({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.AI_RATE_LIMIT_MAX || 15),
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimit };
