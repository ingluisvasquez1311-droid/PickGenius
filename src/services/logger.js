const fs = require('fs');
const path = require('path');

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'app.log');

const formatMessage = (level, message) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
};

const logger = {
    info: (message) => {
        const msg = formatMessage('info', message);
        process.stdout.write(msg);
        fs.appendFileSync(logFile, msg);
    },
    warn: (message) => {
        const msg = formatMessage('warn', message);
        process.stdout.write(msg);
        fs.appendFileSync(logFile, msg);
    },
    error: (message, stack) => {
        const msg = formatMessage('error', `${message}${stack ? `\nStack: ${stack}` : ''}`);
        process.stderr.write(msg);
        fs.appendFileSync(logFile, msg);
    }
};

module.exports = logger;
