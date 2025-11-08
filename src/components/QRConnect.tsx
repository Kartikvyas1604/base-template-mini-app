'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { generateQRCode, createSessionId, QRConnectionData } from '~/lib/qrCode'
import { startQRScanner, loadQRScanner } from '~/lib/qrScanner'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

interface QRConnectProps {
  mode: 'generate' | 'scan'
  onGenerate?: (data: QRConnectionData) => void
  onScan?: (data: QRConnectionData) => void
}

export default function QRConnect({ mode, onGenerate, onScan }: QRConnectProps) {
  const { address } = useAccount()
  const [qrCode, setQrCode] = useState<string>('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [scannerReady, setScannerReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const stopScannerRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (mode === 'scan') {
      loadQRScanner()
        .then(() => setScannerReady(true))
        .catch(err => setError('Failed to load scanner: ' + (err as Error).message))
    }

    return () => {
      if (stopScannerRef.current) {
        stopScannerRef.current()
      }
    }
  }, [mode])

  // Generate QR code when component mounts or address changes
  useEffect(() => {
    const generateQR = async () => {
      if (!address) return

      try {
        const sessionId = createSessionId()
        const data: QRConnectionData = {
          address,
          sessionId,
          timestamp: Date.now()
        }

        const qrDataUrl = await generateQRCode(data)
        setQrCode(qrDataUrl)
        triggerHaptic(hapticPatterns.light)
        onGenerate?.(data)
      } catch {
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
      setError('Scanner not ready')
      return
    }

    setScanning(true)
    setError('')
    triggerHaptic(hapticPatterns.medium)

    try {
      const cleanup = await startQRScanner(
        videoRef.current,
        (data) => {
          setScanning(false)
          triggerHaptic(hapticPatterns.success)
          onScan?.(data)
        },
        (err) => {
          setError(err)
          setScanning(false)
          triggerHaptic(hapticPatterns.error)
        }
      )
      stopScannerRef.current = cleanup
    } catch (err) {
      setError((err as Error).message)
      setScanning(false)
      triggerHaptic(hapticPatterns.error)
    }
  }

  const handleStopScan = () => {
    if (stopScannerRef.current) {
      stopScannerRef.current()
      stopScannerRef.current = null
    }
    setScanning(false)
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
          <button
            onClick={handleStopScan}
            className="absolute top-4 right-4 px-3 py-1 bg-red-500/80 text-white rounded-lg text-sm"
          >
            Stop
          </button>
        </motion.div>
      )}

      {!scanning && (
        <button
          onClick={handleScan}
          disabled={!scannerReady}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            !scannerReady
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white glow'
          }`}
        >
          {!scannerReady ? 'Loading Scanner...' : '📷 Scan QR Code'}
        </button>
      )}
    </motion.div>
  )
}
