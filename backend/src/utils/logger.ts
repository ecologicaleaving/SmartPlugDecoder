const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

const getLogLevel = (level: string): LogLevel => {
  switch (level.toLowerCase()) {
    case 'debug': return LogLevel.DEBUG;
    case 'info': return LogLevel.INFO;
    case 'warn': return LogLevel.WARN;
    case 'error': return LogLevel.ERROR;
    default: return LogLevel.INFO;
  }
};

const currentLogLevel = getLogLevel(LOG_LEVEL);

const formatMessage = (level: string, message: string, ...args: any[]): string => {
  const timestamp = new Date().toISOString();
  const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ') : '';
  
  return `[${timestamp}] ${level.padEnd(5)} ${message}${formattedArgs}`;
};

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(formatMessage('DEBUG', message, ...args));
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(formatMessage('INFO', message, ...args));
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(formatMessage('WARN', message, ...args));
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(formatMessage('ERROR', message, ...args));
    }
  }
};