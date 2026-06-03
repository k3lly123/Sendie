import { randomUUID } from 'crypto'

export const generateTrackingId = () => {
  return `trk_${randomUUID().slice(0, 8)}`
}