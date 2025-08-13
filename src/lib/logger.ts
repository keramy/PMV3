export interface LogContext {
  userId?: string
  projectId?: string
  duration?: number
  error?: Error
  metadata?: Record<string, unknown>
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface Logger {
  debug: (message: string, context?: LogContext) => void
  info: (message: string, context?: LogContext) => void
  warn: (message: string, context?: LogContext) => void
  error: (message: string, context?: LogContext) => void
}

export function createLogger(component: string): Logger {
  const log = (level: LogLevel, message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      component,
      message,
      ...context
    }

    // In production, this would go to your logging service
    // For now, structured console output
    if (level === 'error') {
      console.error(JSON.stringify(logEntry))
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logEntry))
    } else {
      console.log(JSON.stringify(logEntry))
    }
  }

  return {
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, context) => log('error', message, context)
  }
}