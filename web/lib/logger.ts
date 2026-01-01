/**
 * Professional PickGenius Logging Utility
 * Provides structured logging with levels and distinct formatting.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
    private static formatMessage(level: LogLevel, message: string, context?: any): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';

        switch (level) {
            case 'INFO': return `\x1b[32m[${timestamp}] INFO: ${message}${contextStr}\x1b[0m`;
            case 'WARN': return `\x1b[33m[${timestamp}] WARN: ${message}${contextStr}\x1b[0m`;
            case 'ERROR': return `\x1b[31m[${timestamp}] ERROR: ${message}${contextStr}\x1b[0m`;
            case 'DEBUG': return `\x1b[36m[${timestamp}] DEBUG: ${message}${contextStr}\x1b[0m`;
            default: return `[${timestamp}] ${level}: ${message}${contextStr}`;
        }
    }

    public static info(message: string, context?: any) {
        console.log(this.formatMessage('INFO', message, context));
    }

    public static warn(message: string, context?: any) {
        console.warn(this.formatMessage('WARN', message, context));
    }

    public static error(message: string, context?: any) {
        console.error(this.formatMessage('ERROR', message, context));
    }

    public static debug(message: string, context?: any) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage('DEBUG', message, context));
        }
    }
}

export default Logger;
