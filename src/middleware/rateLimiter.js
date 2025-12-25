const rateLimit = new Map();

const rateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
    }

    const record = rateLimit.get(ip);

    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
        return next();
    }

    record.count++;

    if (record.count > limit) {
        return res.status(429).json({
            success: false,
            message: 'Demasiadas solicitudes del mismo origen. Por favor, intente más tarde.'
        });
    }

    next();
};

module.exports = rateLimiter;
