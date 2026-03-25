class ApiError extends Error {
  statusCode: number
  data?: any

  constructor(statusCode: number, message: string | undefined, data?: any, stack = '') {
    super(message)
    this.statusCode = statusCode
    this.data = data
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default ApiError
