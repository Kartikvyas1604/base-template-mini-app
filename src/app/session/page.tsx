'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import EmojiPing from '~/components/EmojiPing'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'
import { peerManager, Message } from '~/lib/peer'

function SessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address } = useAccount()
  const method = searchParams.get('method')
  const peer = searchParams.get('peer')
  const sessionId = searchParams.get('sessionId')
  
  const [sentEmoji, setSentEmoji] = useState<string>('')
  const [receivedEmoji, setReceivedEmoji] = useState<string>('')
  const [canMint, setCanMint] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string>('')

  useEffect(() => {
    if (sentEmoji && receivedEmoji) {
      setCanMint(true)
      triggerHaptic(hapticPatterns.success)
    }
  }, [sentEmoji, receivedEmoji])

  useEffect(() => {
    let sid = sessionId
    if (!sid && method) {
      const connection = peerManager.createSession(method as 'bluetooth' | 'nfc' | 'qr', address)
      sid = connection.id
      setActiveSessionId(connection.id)
    } else if (sid) {
      setActiveSessionId(sid)
    }

    if (sid) {
      const cleanup = peerManager.onMessage(sid, (message: Message) => {
        if (message.type === 'emoji' && message.from !== address) {
          const data = message.data as { emoji?: string }
          if (data.emoji) {
            setReceivedEmoji(data.emoji)
            triggerHaptic(hapticPatterns.success)
          }
        }
      })

      return cleanup
    }
  }, [sessionId, method, address])

  const handleSendEmoji = (emoji: string) => {
    setSentEmoji(emoji)
    
    if (activeSessionId && address) {
      peerManager.sendMessage(activeSessionId, {
        type: 'emoji',
        from: address,
        data: { emoji },
        timestamp: Date.now()
      })
    }
  }

  const handleMint = () => {
    triggerHaptic(hapticPatterns.success)
    router.push(`/mint?method=${method}&emoji=${sentEmoji}&received=${receivedEmoji}`)
  }

  const getMethodIcon = () => {
    switch (method) {
      case 'bluetooth': return '📡'
      case 'nfc': return '📱'
      case 'qr': return '📷'
      default: return '🤝'
    }
  }

  const getMethodName = () => {
    switch (method) {
      case 'bluetooth': return 'Bluetooth'
      case 'nfc': return 'NFC'
      case 'qr': return 'QR Code'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4"
          >
            {getMethodIcon()}
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Connected!</h1>
          <p className="text-gray-400">
            via {getMethodName()}
            {peer && ` • ${peer}`}
          </p>
        </div>

        <div className="mb-6">
          <div className="glass p-4 rounded-xl mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Connection Status</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Active</span>
              </span>
            </div>
          </div>

          <EmojiPing onSend={handleSendEmoji} receivedEmoji={receivedEmoji} />
        </div>

        {canMint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMint}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold glow-strong mb-4"
            >
              🎨 Mint NFT
            </motion.button>
          </motion.div>
        )}

        {sentEmoji && !receivedEmoji && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-400"
          >
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Waiting for partner to respond...
            </motion.span>
          </motion.div>
        )}

        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full py-3 text-gray-400 hover:text-white transition-colors"
        >
          ← Cancel Connection
        </button>
      </motion.div>
    </div>
  )
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading session...</div>
      </div>
    }>
      <SessionContent />
    </Suspense>
  )
}
