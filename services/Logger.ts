/**
 * Simple Logger service to control console output based on environment.
 * Helps keep production logs clean.
 */

const isDev = __DEV__;

export const Logger = {
    log: (message: string, ...args: any[]) => {
        if (isDev) {
            console.log(`[LOG] ${message}`, ...args);
        }
    },
    info: (message: string, ...args: any[]) => {
        if (isDev) {
            console.info(`[INFO] ${message}`, ...args);
        }
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
        if (isDev) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
};
