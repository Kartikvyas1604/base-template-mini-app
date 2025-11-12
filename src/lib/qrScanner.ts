import { parseQRData, QRConnectionData } from './qrCode'

export const startQRScanner = async (
  videoElement: HTMLVideoElement,
  onSuccess: (data: QRConnectionData) => void,
  onError: (error: string) => void
): Promise<() => void> => {
  let stream: MediaStream | null = null
  let scanning = true

  try {
    // Request camera with better constraints
    stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })

    videoElement.srcObject = stream
    await videoElement.play()

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Canvas context not available')
    }

    console.log('📷 QR Scanner started - scanning continuously...')

    const scanFrame = () => {
      if (!scanning) {
        console.log('📷 Scanner stopped')
        return
      }

      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = detectQRCode(imageData)

        if (code) {
          console.log('📷 QR Code detected:', code.substring(0, 50) + '...')
          const parsed = parseQRData(code)
          if (parsed) {
            console.log('✅ Valid TapMint QR data:', parsed)
            scanning = false
            if (stream) stopTracks(stream)
            onSuccess(parsed)
            return
          } else {
            console.log('⚠️ Invalid QR data format, continuing scan...')
          }
        }
      }

      // Keep scanning
      requestAnimationFrame(scanFrame)
    }

    // Start scanning
    scanFrame()

    // Return cleanup function
    return () => {
      console.log('🛑 Cleaning up scanner...')
      scanning = false
      if (stream) stopTracks(stream)
    }
  } catch (error) {
    const err = error as Error
    console.error('❌ Scanner error:', err)
    
    let errorMessage = 'Camera access failed'
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMessage = 'Camera permission denied. Please allow camera access.'
    } else if (err.name === 'NotFoundError') {
      errorMessage = 'No camera found on this device.'
    } else if (err.name === 'NotReadableError') {
      errorMessage = 'Camera is already in use by another app.'
    } else {
      errorMessage = err.message
    }
    
    onError(errorMessage)
    
    return () => {
      if (stream) stopTracks(stream)
    }
  }
}

const stopTracks = (stream: MediaStream) => {
  stream.getTracks().forEach(track => track.stop())
}

const detectQRCode = (imageData: ImageData): string | null => {
  try {
    if (typeof window === 'undefined') return null
    
    const jsQR = (window as { jsQR?: (data: Uint8ClampedArray, width: number, height: number, options?: unknown) => { data: string } | null }).jsQR
    if (!jsQR) return null

    // Try with better detection options
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth' // Try both normal and inverted
    })

    return code ? code.data : null
  } catch (error) {
    console.error('QR detection error:', error)
    return null
  }
}

export const loadQRScanner = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'))
      return
    }

    if ((window as { jsQR?: unknown }).jsQR) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load QR scanner'))
    document.head.appendChild(script)
  })
}
