import { parseQRData, QRConnectionData } from './qrCode'

export const startQRScanner = async (
  videoElement: HTMLVideoElement,
  onSuccess: (data: QRConnectionData) => void,
  onError: (error: string) => void
): Promise<() => void> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })

    videoElement.srcObject = stream
    await videoElement.play()

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Canvas context not available')
    }

    let scanning = true

    const scanFrame = () => {
      if (!scanning) return

      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = detectQRCode(imageData)

        if (code) {
          const parsed = parseQRData(code)
          if (parsed) {
            scanning = false
            stopTracks(stream)
            onSuccess(parsed)
            return
          }
        }
      }

      requestAnimationFrame(scanFrame)
    }

    scanFrame()

    return () => {
      scanning = false
      stopTracks(stream)
    }
  } catch (error) {
    onError((error as Error).message)
    return () => {}
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

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    })

    return code ? code.data : null
  } catch {
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
