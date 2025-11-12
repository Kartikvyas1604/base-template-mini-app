'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { generateQRCode, createSessionId, QRConnectionData } from '~/lib/qrCode'
import { startQRScanner, loadQRScanner } from '~/lib/qrScanner'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

interface QRConnectProps {
  mode: 'generate' | 'scan'
  onGenerate?: (data: QRConnectionData) => void
  onScan?: (data: QRConnectionData) => void
}

export default function QRConnect({ mode, onGenerate, onScan }: QRConnectProps) {
  const router = useRouter()
  const { address } = useAccount()
  const [qrCode, setQrCode] = useState<string>('')
  const [qrData, setQrData] = useState<QRConnectionData | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanStarted, setScanStarted] = useState(false)
  const [error, setError] = useState<string>('')
  const [scannerReady, setScannerReady] = useState(false)
  const [scanStatus, setScanStatus] = useState<string>('Ready to scan')
  const videoRef = useRef<HTMLVideoElement>(null)
  const stopScannerRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Reset state when mode changes
    console.log('🔄 Mode changed to:', mode)
    setError('')
    setScanStarted(false)
    setScanning(false)
    setScanStatus('Ready to scan')
    
    if (mode === 'scan') {
      setScanStatus('Loading scanner library...')
      
      // Try to load with retry
      const attemptLoad = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            console.log(`📥 Loading scanner attempt ${i + 1}/${retries}`)
            await loadQRScanner()
            setScannerReady(true)
            setScanStatus('Scanner ready!')
            console.log('✅ QR Scanner library loaded and ready')
            return
          } catch (err) {
            console.error(`❌ Load attempt ${i + 1} failed:`, err)
            if (i === retries - 1) {
              // Last attempt failed
              setError('Failed to load scanner: ' + (err as Error).message + '. Try refreshing the page.')
              setScanStatus('Scanner failed to load')
            } else {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
      }
      
      attemptLoad()
    } else {
      setScannerReady(false)
    }

    return () => {
      if (stopScannerRef.current) {
        console.log('🧹 Cleanup: Stopping scanner')
        stopScannerRef.current()
        stopScannerRef.current = null
      }
    }
  }, [mode])

  // Generate QR code when component mounts or address changes
  useEffect(() => {
    const generateQR = async () => {
      if (!address) {
        console.log('⚠️ No wallet address - cannot generate QR')
        return
      }

      try {
        console.log('📷 Generating QR code for address:', address)
        const sessionId = createSessionId()
        const data: QRConnectionData = {
          address,
          sessionId,
          timestamp: Date.now()
        }

        const qrDataUrl = await generateQRCode(data)
        setQrCode(qrDataUrl)
        setQrData(data)
        triggerHaptic(hapticPatterns.light)
        console.log('✅ QR code generated, calling onGenerate callback')
        onGenerate?.(data)
      } catch (error) {
        console.error('❌ Failed to generate QR code:', error)
        setError('Failed to generate QR code')
        triggerHaptic(hapticPatterns.error)
      }
    }

    if (mode === 'generate' && address) {
      generateQR()
    }
  }, [mode, address, onGenerate])

  const handleScan = async () => {
    if (!videoRef.current || !scannerReady) {
      setError('Scanner not ready. Please wait...')
      return
    }

    console.log('🎬 Starting QR scan...')
    setScanning(true)
    setScanStarted(true)
    setError('')
    setScanStatus('Starting camera...')
    triggerHaptic(hapticPatterns.medium)

    try {
      setScanStatus('Scanning for QR code...')
      const cleanup = await startQRScanner(
        videoRef.current,
        (data) => {
          console.log('✅ QR Scan success:', data)
          setScanStatus('QR Code detected!')
          setScanning(false)
          if (stopScannerRef.current) {
            stopScannerRef.current()
            stopScannerRef.current = null
          }
          triggerHaptic(hapticPatterns.success)
          
          // Only call onScan if we actually started scanning
          if (scanStarted) {
            console.log('📤 Calling onScan callback with data')
            onScan?.(data)
          } else {
            console.warn('⚠️ Scan completed but scanStarted is false')
          }
        },
        (err) => {
          console.error('❌ QR Scan error:', err)
          setError(err)
          setScanStatus('Scan failed')
          setScanning(false)
          setScanStarted(false)
          if (stopScannerRef.current) {
            stopScannerRef.current()
            stopScannerRef.current = null
          }
          triggerHaptic(hapticPatterns.error)
        }
      )
      stopScannerRef.current = cleanup
      setScanStatus('Point camera at QR code...')
    } catch (err) {
      console.error('❌ Scanner start error:', err)
      setError((err as Error).message)
      setScanStatus('Failed to start camera')
      setScanning(false)
      setScanStarted(false)
      triggerHaptic(hapticPatterns.error)
    }
  }

  const handleStopScan = () => {
    console.log('🛑 User stopped scan')
    if (stopScannerRef.current) {
      stopScannerRef.current()
      stopScannerRef.current = null
    }
    setScanning(false)
    setScanStarted(false)
    setScanStatus('Scan stopped')
  }

  if (mode === 'generate') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-6 rounded-2xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
            📷
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">QR Code</h3>
            <p className="text-sm text-gray-400">Show to connect</p>
          </div>
        </div>

        {qrCode ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-4 rounded-xl mb-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="QR Code" className="w-full h-auto" />
          </motion.div>
        ) : (
          <div className="bg-gray-800/50 p-8 rounded-xl mb-4 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Generating QR...</div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30"
          >
            <p className="text-sm text-red-200">{error}</p>
          </motion.div>
        )}

        {qrCode && qrData && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              router.push(`/session?method=qr&sessionId=${qrData.sessionId}&peer=waiting`)
            }}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
          >
            ✓ Continue to Session
          </motion.button>
        )}

        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-200 leading-relaxed">
            <strong>💡 Instructions:</strong> Show this QR code to the other person. They should scan it with their camera. Once scanned, click &quot;Continue&quot; above.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="glass p-6 rounded-2xl"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
          📷
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Scan QR</h3>
          <p className="text-sm text-gray-400">Scan partner&apos;s code</p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30"
        >
          <p className="text-sm text-red-200">{error}</p>
        </motion.div>
      )}

      {scanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 relative rounded-xl overflow-hidden bg-black"
        >
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            autoPlay
          />
          <div className="absolute inset-0 border-2 border-emerald-500/50">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-emerald-400">
              <motion.div
                animate={{ y: [0, 192, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-full h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400"
              />
            </div>
          </div>
          
          {/* Status Display */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="px-3 py-1 bg-emerald-500/80 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
              {scanStatus}
            </div>
            <button
              onClick={handleStopScan}
              className="px-3 py-1 bg-red-500/80 text-white rounded-lg text-sm hover:bg-red-600/90 backdrop-blur-sm"
            >
              ✕ Stop
            </button>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="px-4 py-2 bg-black/60 text-white rounded-lg text-xs text-center backdrop-blur-sm">
              📱 Point your camera at the QR code
              <br />
              Scanner will continue until code is detected
            </div>
          </div>
        </motion.div>
      )}

      {!scanning && (
        <>
          {/* Instruction before scanning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
          >
            <p className="text-sm text-blue-200 mb-2">
              <strong>📱 Ready to scan</strong>
            </p>
            <p className="text-xs text-blue-300 leading-relaxed">
              Click the button below to open your camera and scan the other person&apos;s QR code. The scanner will run until it detects a valid QR code.
            </p>
          </motion.div>

          <button
            onClick={handleScan}
            disabled={!scannerReady}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              !scannerReady
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white glow'
            }`}
          >
            {!scannerReady ? '⏳ Loading Scanner...' : '📷 Start Scanning QR Code'}
          </button>

          {/* Retry button if scanner failed to load */}
          {error && error.includes('Failed to load scanner') && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                setError('')
                setScanStatus('Retrying...')
                loadQRScanner()
                  .then(() => {
                    setScannerReady(true)
                    setScanStatus('Scanner ready!')
                    console.log('✅ Manual retry successful')
                  })
                  .catch(err => {
                    setError('Retry failed: ' + (err as Error).message)
                    setScanStatus('Still failed')
                  })
              }}
              className="mt-3 w-full py-3 rounded-xl font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-all"
            >
              🔄 Retry Loading Scanner
            </motion.button>
          )}
        </>
      )}
    </motion.div>
  )
}
