'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { isNFCAvailable, readNFCTag, writeNFCTag, NFCData } from '~/lib/nfc'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

interface NFCConnectProps {
  onConnect: (data: NFCData) => void
}

export default function NFCConnect({ onConnect }: NFCConnectProps) {
  const { address } = useAccount()
  const [status, setStatus] = useState<'idle' | 'writing' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const [mode, setMode] = useState<'read' | 'write'>('read')

  const handleWrite = async () => {
    if (!address) {
      setError('Please connect your wallet first')
      setStatus('error')
      return
    }

    if (!isNFCAvailable()) {
      setError('NFC not supported. Please use Chrome on Android.')
      setStatus('error')
      triggerHaptic(hapticPatterns.error)
      return
    }

    setStatus('writing')
    setError('')
    triggerHaptic(hapticPatterns.medium)

    try {
      const sessionId = `nfc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      await writeNFCTag(address, sessionId)
      
      setStatus('connected')
      triggerHaptic(hapticPatterns.success)
      
      // After writing, automatically switch to read mode
      setTimeout(() => {
        setMode('read')
        setStatus('idle')
      }, 2000)
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

  const handleScan = async () => {
    if (!isNFCAvailable()) {
      setError('NFC not supported. Please use Chrome on Android.')
      setStatus('error')
      triggerHaptic(hapticPatterns.error)
      return
    }

    setStatus('scanning')
    setError('')
    triggerHaptic(hapticPatterns.medium)

    try {
      const data = await readNFCTag()
      
      if (!data.address || data.address === address) {
        throw new Error('Invalid peer data or same wallet detected')
      }

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
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">NFC Tap</h3>
          <p className="text-sm text-gray-400">Tap devices together</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode('write')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'write'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:text-white'
          }`}
        >
          Write Tag
        </button>
        <button
          onClick={() => setMode('read')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'read'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:text-white'
          }`}
        >
          Read Tag
        </button>
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

      {(status === 'scanning' || status === 'writing') && (
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
          <p className="text-sm text-purple-200">
            {status === 'writing' 
              ? 'Hold device near NFC tag to write...' 
              : 'Hold device near NFC tag to read...'}
          </p>
        </motion.div>
      )}

      {status === 'connected' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center"
        >
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm text-green-200">
            {mode === 'write' ? 'Tag written successfully!' : 'Tag read successfully!'}
          </p>
        </motion.div>
      )}

      {mode === 'write' ? (
        <button
          onClick={handleWrite}
          disabled={status === 'writing' || !address}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            status === 'writing'
              ? 'bg-purple-500/30 text-purple-200 cursor-wait'
              : !address
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white glow'
          }`}
        >
          {status === 'writing' ? '📡 Writing...' : '📝 Write Your Data to NFC'}
        </button>
      ) : (
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
          {status === 'idle' && '📱 Scan NFC Tag'}
          {status === 'error' && 'Try Again'}
        </button>
      )}

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
      >
        <p className="text-xs text-blue-200 leading-relaxed">
          <strong>💡 How it works:</strong> One person writes their wallet data to an NFC tag, then the other person reads it by tapping their phone on the same tag.
        </p>
      </motion.div>
    </motion.div>
  )
}
