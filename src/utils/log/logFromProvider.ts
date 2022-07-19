const {format, createLogger, transports} = require('winston');
const {timestamp, combine, printf} = format;

const timezoned = () => {
  return new Date().toLocaleString('id-Id', {
      timeZone: 'Asia/Jakarta'
  });
}

const myFormat = format.printf(({ level, message, timestamp }) => {
  return `[${timestamp} ${level}]: {${message.type}} => ${JSON.stringify(message.params)}`;
});

const logFromProvider = createLogger({
  level: 'debug',
  // format: format.json(),
  format: combine(
    timestamp({
      // format: 'DD-MM-YYYY HH:mm:ss'
      format: timezoned
    }),
    myFormat
  ),
  defaultMeta: { service: 'attempt from provider' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new transports.File({ filename: 'src/utils/logFiles/error.log', level: 'error' }),
    new transports.File({ filename: 'src/utils/logFiles/debug.log', level: 'debug'}),
    new transports.File({ filename: 'src/utils/logFiles/combined.log', level: 'info' }),
  ],
});

module.exports = logFromProvider;