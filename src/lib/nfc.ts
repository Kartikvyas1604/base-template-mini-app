export interface NFCData {
  address: string
  sessionId: string
  timestamp: number
}

export const isNFCAvailable = () => {
  return typeof window !== 'undefined' && 'NDEFReader' in window
}

export const readNFCTag = async (): Promise<NFCData> => {
  if (!isNFCAvailable()) {
    throw new Error('NFC not supported. Please use Chrome on Android.')
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ndef = new (window as any).NDEFReader()
    await ndef.scan()

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('NFC scan timeout - no tag detected'))
      }, 30000)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ndef.addEventListener('reading', ({ message }: any) => {
        clearTimeout(timeout)
        
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const textRecord = message.records.find((record: any) => record.recordType === 'text')
          
          if (!textRecord) {
            reject(new Error('No text data found in NFC tag'))
            return
          }

          const decoder = new TextDecoder()
          const messageText = decoder.decode(textRecord.data)
          
          // Parse the JSON data from NFC tag
          const data = JSON.parse(messageText)
          
          if (!data.address || !data.sessionId) {
            reject(new Error('Invalid NFC data format'))
            return
          }

          resolve({
            address: data.address,
            sessionId: data.sessionId,
            timestamp: data.timestamp || Date.now()
          })
        } catch (error) {
          console.error('NFC parse error:', error)
          reject(new Error('Failed to parse NFC data'))
        }
      })

      ndef.addEventListener('readingerror', () => {
        clearTimeout(timeout)
        reject(new Error('Failed to read NFC tag - permission denied or hardware error'))
      })
    })
  } catch (error) {
    const err = error as Error
    if (err.name === 'NotAllowedError') {
      throw new Error('NFC permission denied. Please allow NFC access in your browser settings.')
    }
    if (err.name === 'NotSupportedError') {
      throw new Error('NFC not supported on this device. Use Android with Chrome.')
    }
    throw new Error(`NFC error: ${err.message}`)
  }
}

export const writeNFCTag = async (address: string, sessionId: string): Promise<boolean> => {
  if (!isNFCAvailable()) {
    throw new Error('NFC not supported on this device')
  }

  try {
    const data = JSON.stringify({
      address,
      sessionId,
      timestamp: Date.now()
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ndef = new (window as any).NDEFReader()
    await ndef.write({
      records: [{ recordType: 'text', data }]
    })
    return true
  } catch (error) {
    console.error('NFC write error:', error)
    throw new Error(`Failed to write NFC tag: ${(error as Error).message}`)
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
