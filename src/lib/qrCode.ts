import QRCode from 'qrcode'

export interface QRConnectionData {
  address: string
  sessionId: string
  timestamp: number
}

export const generateQRCode = async (data: QRConnectionData): Promise<string> => {
  try {
    const jsonData = JSON.stringify(data)
    const qrDataUrl = await QRCode.toDataURL(jsonData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#6366f1',
        light: '#0a0e1a'
      }
    })
    return qrDataUrl
  } catch (error) {
    console.error('QR generation error:', error)
    throw new Error('Failed to generate QR code')
  }
}

export const parseQRData = (data: string): QRConnectionData | null => {
  try {
    const parsed = JSON.parse(data)
    if (parsed.address && parsed.sessionId && parsed.timestamp) {
      return parsed as QRConnectionData
    }
    return null
  } catch {
    return null
  }
}

export const createSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const isValidSession = (timestamp: number, maxAgeMs: number = 300000): boolean => {
  return Date.now() - timestamp < maxAgeMs
}
