const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5
});

module.exports = limiter;