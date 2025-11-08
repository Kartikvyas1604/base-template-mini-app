'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { isBluetoothAvailable, requestBluetoothDevice, BluetoothDevice } from '~/lib/bluetooth'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

interface BluetoothConnectProps {
  onConnect: (device: BluetoothDevice) => void
}

export default function BluetoothConnect({ onConnect }: BluetoothConnectProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connecting' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const [deviceInfo, setDeviceInfo] = useState<BluetoothDevice | null>(null)

  const handleConnect = async () => {
    if (!isBluetoothAvailable()) {
      setError('⚠️ Bluetooth not supported. Use Chrome/Edge on Android or Desktop.')
      setStatus('error')
      triggerHaptic(hapticPatterns.error)
      return
    }

    setStatus('scanning')
    setError('')
    triggerHaptic(hapticPatterns.light)

    try {
      // Request device - this will show the native Bluetooth picker
      const device = await requestBluetoothDevice()
      setDeviceInfo(device)
      setStatus('connecting')
      
      // Simulate connection establishment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStatus('connected')
      triggerHaptic(hapticPatterns.success)
      onConnect(device)
    } catch (err) {
      const message = (err as Error).message
      console.error('Bluetooth error:', err)
      setError(message)
      setStatus('error')
      setDeviceInfo(null)
      triggerHaptic(hapticPatterns.error)
      
      setTimeout(() => {
        setStatus('idle')
        setError('')
      }, 4000)
    }
  }

  const getStatusIndicator = () => {
    switch (status) {
      case 'scanning':
        return { color: 'bg-blue-500', text: '📡 Scanning...' }
      case 'connecting':
        return { color: 'bg-yellow-500', text: '🔗 Connecting...' }
      case 'connected':
        return { color: 'bg-green-500', text: '✅ Connected' }
      case 'error':
        return { color: 'bg-red-500', text: '❌ Failed' }
      default:
        return { color: 'bg-gray-500', text: '⚪ Ready' }
    }
  }

  const indicator = getStatusIndicator()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-6 rounded-2xl"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
          📡
          <motion.div
            animate={
              status === 'scanning' || status === 'connecting'
                ? { scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`absolute inset-0 rounded-full ${indicator.color}`}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">Bluetooth</h3>
          <p className="text-sm text-gray-400">Pair with nearby device</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={
              status === 'scanning' || status === 'connecting'
                ? { scale: [1, 1.2, 1] }
                : {}
            }
            transition={{ duration: 1, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${indicator.color}`}
          />
          <span className="text-xs text-gray-400">{indicator.text}</span>
        </div>
      </div>

      {/* Device Info */}
      {deviceInfo && status !== 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
        >
          <p className="text-xs text-gray-400 mb-1">Device Found</p>
          <p className="font-semibold text-white">{deviceInfo.name}</p>
          {deviceInfo.address && (
            <p className="text-xs text-gray-500 mt-1 font-mono">{deviceInfo.address}</p>
          )}
        </motion.div>
      )}

      {/* Error Message */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30"
        >
          <p className="text-sm text-red-200">{error}</p>
        </motion.div>
      )}

      {/* Connect Button */}
      <button
        onClick={handleConnect}
        disabled={status === 'scanning' || status === 'connecting' || status === 'connected'}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          status === 'scanning' || status === 'connecting'
            ? 'bg-blue-500/30 text-blue-200 cursor-wait'
            : status === 'connected'
            ? 'bg-green-500/30 text-green-200 cursor-default'
            : 'bg-blue-600 hover:bg-blue-700 text-white glow'
        }`}
      >
        {status === 'scanning' && '� Scanning for devices...'}
        {status === 'connecting' && `🔗 Connecting to ${deviceInfo?.name || 'device'}...`}
        {status === 'connected' && `✅ Connected to ${deviceInfo?.name}`}
        {status === 'idle' && '🔵 Scan for Bluetooth Devices'}
        {status === 'error' && '🔄 Try Again'}
      </button>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
      >
        <p className="text-xs text-purple-200 leading-relaxed">
          <strong>💡 How it works:</strong> Tap &ldquo;Scan&rdquo; to see nearby Bluetooth devices. Select the other person&apos;s device from the list to connect and exchange data.
        </p>
      </motion.div>
    </motion.div>
  )
}
