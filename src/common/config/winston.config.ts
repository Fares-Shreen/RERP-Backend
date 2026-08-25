import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const winstonLogger = WinstonModule.createLogger({
    transports: [
        // 1. Console Output (For your terminal while developing)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                nestWinstonModuleUtilities.format.nestLike('ERP-Backend', {
                    colors: true,
                    appName: true,
                }),
            ),
        }),

        // 2. Error Logs File (Only saves Exceptions and 500 status codes)
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '14d', // Automatically deletes logs older than 14 days
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json() // JSON format is easier to parse later
            ),
        }),

        // 3. General Application Logs File (Saves everything: Info, Warn, Error)
        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
    ],
});