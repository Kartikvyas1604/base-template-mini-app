'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { isNFCAvailable, readNFCTag, NFCData } from '~/lib/nfc'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

interface NFCConnectProps {
  onConnect: (data: NFCData) => void
}

export default function NFCConnect({ onConnect }: NFCConnectProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  const handleScan = async () => {
    if (!isNFCAvailable()) {
      setError('NFC not supported on this device')
      setStatus('error')
      triggerHaptic(hapticPatterns.error)
      return
    }

    setStatus('scanning')
    triggerHaptic(hapticPatterns.medium)

    try {
      const data = await readNFCTag()
      setStatus('connected')
      triggerHaptic(hapticPatterns.success)
      onConnect(data)
    } catch (err) {
      const message = (err as Error).message
      setError(message)
      setStatus('error')
      triggerHaptic(hapticPatterns.error)

      setTimeout(() => {
        setStatus('idle')
        setError('')
      }, 3000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="glass p-6 rounded-2xl"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
          📱
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">NFC Tap</h3>
          <p className="text-sm text-gray-400">Tap devices together</p>
        </div>
      </div>

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30"
        >
          <p className="text-sm text-red-200">{error}</p>
        </motion.div>
      )}

      {status === 'scanning' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-4xl mb-2"
          >
            📡
          </motion.div>
          <p className="text-sm text-purple-200">Hold device near NFC tag...</p>
        </motion.div>
      )}

      <button
        onClick={handleScan}
        disabled={status === 'scanning'}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          status === 'scanning'
            ? 'bg-purple-500/30 text-purple-200 cursor-wait'
            : status === 'connected'
            ? 'bg-green-500/30 text-green-200'
            : 'bg-purple-600 hover:bg-purple-700 text-white glow'
        }`}
      >
        {status === 'scanning' && '📡 Scanning...'}
        {status === 'connected' && '✓ Connected'}
        {status === 'idle' && 'Scan NFC Tag'}
        {status === 'error' && 'Try Again'}
      </button>
    </motion.div>
  )
}
