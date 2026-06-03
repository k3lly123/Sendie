export const successResponse = (
  message: string,
  data?: unknown
) => {
  return {
    status: 'success',
    message,
    data,
  }
}

export const errorResponse = (
  message: string,
  code?: string
) => {
  return {
    status: 'error',
    message,
    error: {
      code,
    },
  }
}