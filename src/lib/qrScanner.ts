import { parseQRData, QRConnectionData } from './qrCode'

export const startQRScanner = async (
  videoElement: HTMLVideoElement,
  onSuccess: (data: QRConnectionData) => void,
  onError: (error: string) => void
): Promise<() => void> => {
  let stream: MediaStream | null = null
  let scanning = true

  try {
    // Check if camera API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported in this browser. Please use Chrome, Edge, or Safari.')
    }

    console.log('📷 Requesting camera access...')
    
    // Try with ideal constraints first
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
    } catch {
      console.log('⚠️ High quality failed, trying basic camera...')
      // Fallback to basic constraints if ideal fails
      stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })
    }

    console.log('✅ Camera access granted')

    videoElement.srcObject = stream
    await videoElement.play()
    console.log('✅ Video stream started')

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
    console.error('Error name:', err.name)
    console.error('Error message:', err.message)
    
    let errorMessage = 'Camera access failed'
    
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMessage = '🚫 Camera permission denied. Please click "Allow" when your browser asks for camera access.'
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      errorMessage = '📷 No camera found. Please check if your device has a camera and it\'s connected properly.'
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      errorMessage = '⚠️ Camera is already in use. Please close other apps using the camera and try again.'
    } else if (err.name === 'OverconstrainedError') {
      errorMessage = '⚙️ Camera settings not supported. Trying with basic settings...'
      // Try again with simpler constraints
      console.log('🔄 Retrying with basic camera settings...')
    } else if (err.name === 'NotSupportedError') {
      errorMessage = '🌐 Camera not supported in this browser. Please use Chrome, Edge, or Safari.'
    } else if (err.name === 'SecurityError') {
      errorMessage = '🔒 Camera access blocked by security settings. Please use HTTPS or allow camera in browser settings.'
    } else if (err.message.includes('getUserMedia')) {
      errorMessage = '🌐 Camera API not available. Please use a modern browser (Chrome, Edge, Safari).'
    } else {
      errorMessage = `❌ Error: ${err.message}. Please refresh and try again.`
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

    // Check if already loaded
    if ((window as { jsQR?: unknown }).jsQR) {
      console.log('✅ jsQR already loaded')
      resolve()
      return
    }

    console.log('📥 Loading jsQR library...')

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="jsqr"]')
    if (existingScript) {
      console.log('⏳ jsQR script already in DOM, waiting...')
      // Wait a bit for it to load
      const checkInterval = setInterval(() => {
        if ((window as { jsQR?: unknown }).jsQR) {
          clearInterval(checkInterval)
          console.log('✅ jsQR loaded from existing script')
          resolve()
        }
      }, 100)
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!(window as { jsQR?: unknown }).jsQR) {
          reject(new Error('Timeout loading QR scanner'))
        }
      }, 5000)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
    script.async = true
    
    script.onload = () => {
      console.log('✅ jsQR library loaded successfully')
      // Double check it's actually available
      if ((window as { jsQR?: unknown }).jsQR) {
        resolve()
      } else {
        reject(new Error('jsQR loaded but not found on window'))
      }
    }
    
    script.onerror = (error) => {
      console.error('❌ Failed to load jsQR:', error)
      reject(new Error('Failed to load QR scanner library from CDN'))
    }
    
    document.head.appendChild(script)
    console.log('📌 jsQR script tag added to page')
  })
}
