import { createLogger, format, transports } from 'winston';
const { combine, timestamp, align, colorize, printf } = format;

// const logger = createLogger({
//   transports: [
//     new transports.File({
//       filename: 'logs/server.log',
//       format: format.combine(
//         format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
//         format.align(),
//         format.colorize({ all: true, colors: { info: 'blue', error: 'red' } }),
//         format.printf(info => `${info.level}: ${info.timestamp}: ${info.message}`)
//       )
//     })
//   ]
// });

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    colorize({
      all: false, colors: {
        error: "red",
        warn: "orange",
        info: "blue",
        debug: "green",
      }
    }),
    printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log', format: format.combine(format.uncolorize()) })
  ],
});


export default logger;
