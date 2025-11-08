'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { isBluetoothAvailable, requestBluetoothDevice, BluetoothDevice } from '~/lib/bluetooth'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

interface BluetoothConnectProps {
  onConnect: (device: BluetoothDevice) => void
}

export default function BluetoothConnect({ onConnect }: BluetoothConnectProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  const handleConnect = async () => {
    if (!isBluetoothAvailable()) {
      setError('Bluetooth not supported on this device')
      setStatus('error')
      triggerHaptic(hapticPatterns.error)
      return
    }

    setStatus('connecting')
    triggerHaptic(hapticPatterns.light)

    try {
      const device = await requestBluetoothDevice()
      setStatus('connected')
      triggerHaptic(hapticPatterns.success)
      onConnect(device)
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
      className="glass p-6 rounded-2xl"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
          📡
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Bluetooth</h3>
          <p className="text-sm text-gray-400">Pair with nearby device</p>
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

      <button
        onClick={handleConnect}
        disabled={status === 'connecting'}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          status === 'connecting'
            ? 'bg-blue-500/30 text-blue-200 cursor-wait'
            : status === 'connected'
            ? 'bg-green-500/30 text-green-200'
            : 'bg-blue-600 hover:bg-blue-700 text-white glow'
        }`}
      >
        {status === 'connecting' && '🔄 Searching...'}
        {status === 'connected' && '✓ Connected'}
        {status === 'idle' && 'Connect via Bluetooth'}
        {status === 'error' && 'Try Again'}
      </button>
    </motion.div>
  )
}
