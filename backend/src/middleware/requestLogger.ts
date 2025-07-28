import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Log request start
  logger.http(`${method} ${url} - ${ip}`, {
    method,
    url,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Determine log level based on status code
    const logLevel = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'http';
    
    logger[logLevel as keyof typeof logger](`${method} ${url} ${statusCode} - ${duration}ms`, {
      method,
      url,
      statusCode,
      duration,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    // Call the original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};