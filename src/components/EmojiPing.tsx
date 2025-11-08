'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

const EMOJIS = ['💌', '🎉', '🔥', '✨', '🚀', '💫', '⚡', '🌟']

interface EmojiPingProps {
  onSend: (emoji: string) => void
  receivedEmoji?: string
}

export default function EmojiPing({ onSend, receivedEmoji }: EmojiPingProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string>('')
  const [sending, setSending] = useState(false)

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji)
    triggerHaptic(hapticPatterns.light)
  }

  const handleSend = () => {
    if (!selectedEmoji) return

    setSending(true)
    triggerHaptic(hapticPatterns.ping)
    
    setTimeout(() => {
      onSend(selectedEmoji)
      setSending(false)
    }, 500)
  }

  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-xl font-semibold text-white mb-4 text-center">
        Send an Emoji Ping
      </h3>

      {receivedEmoji && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-center"
        >
          <div className="text-5xl mb-2">{receivedEmoji}</div>
          <p className="text-sm text-green-200">Received from partner!</p>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-6">
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEmojiSelect(emoji)}
            className={`text-4xl p-4 rounded-xl transition-all ${
              selectedEmoji === emoji
                ? 'bg-indigo-500/30 ring-2 ring-indigo-500'
                : 'bg-gray-800/30 hover:bg-gray-800/50'
            }`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSend}
        disabled={!selectedEmoji || sending}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
          !selectedEmoji || sending
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white glow'
        }`}
      >
        {sending ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              ⚡
            </motion.span>
            Sending...
          </span>
        ) : selectedEmoji ? (
          `Send ${selectedEmoji}`
        ) : (
          'Select an emoji'
        )}
      </motion.button>
    </div>
  )
}
