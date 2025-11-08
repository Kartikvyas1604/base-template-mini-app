export interface NFCData {
  id: string
  message: string
}

export const isNFCAvailable = () => {
  return typeof window !== 'undefined' && 'NDEFReader' in window
}

export const readNFCTag = async (): Promise<NFCData> => {
  if (!isNFCAvailable()) {
    throw new Error('NFC not supported on this device')
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ndef = new (window as any).NDEFReader()
    await ndef.scan()

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('NFC scan timeout'))
      }, 30000)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        clearTimeout(timeout)
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const textRecord = message.records.find((record: any) => record.recordType === 'text')
        const decoder = new TextDecoder()
        const messageText = textRecord ? decoder.decode(textRecord.data) : 'Connection'

        resolve({
          id: serialNumber,
          message: messageText
        })
      })

      ndef.addEventListener('readingerror', () => {
        clearTimeout(timeout)
        reject(new Error('Failed to read NFC tag'))
      })
    })
  } catch (error) {
    if ((error as Error).name === 'NotAllowedError') {
      throw new Error('NFC permission denied')
    }
    throw error
  }
}

export const writeNFCTag = async (message: string): Promise<boolean> => {
  if (!isNFCAvailable()) {
    throw new Error('NFC not supported on this device')
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ndef = new (window as any).NDEFReader()
    await ndef.write({
      records: [{ recordType: 'text', data: message }]
    })
    return true
  } catch {
    return false
  }
}

export const requestNFCPermission = async (): Promise<boolean> => {
  if (!isNFCAvailable()) return false
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ndef = new (window as any).NDEFReader()
    await ndef.scan()
    return true
  } catch {
    return false
  }
}
