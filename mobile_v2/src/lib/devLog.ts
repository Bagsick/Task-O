type LogData = Record<string, unknown> | undefined

export function devLog(scope: string, message: string, data?: LogData) {
  if (!__DEV__) {
    return
  }

  const prefix = `[Task-O][${scope}] ${message}`
  if (data) {
    console.log(prefix, data)
    return
  }

  console.log(prefix)
}

export function devError(scope: string, message: string, error: unknown) {
  if (!__DEV__) {
    return
  }

  console.error(`[Task-O][${scope}] ${message}`, error)
}
