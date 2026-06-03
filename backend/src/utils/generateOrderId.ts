import { randomUUID } from 'crypto'

export const generateOrderId = () => {
  return `ord_${randomUUID().slice(0, 8)}`
}