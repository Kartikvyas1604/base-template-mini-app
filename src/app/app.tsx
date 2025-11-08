'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import WalletConnect from '~/components/WalletConnect'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

export default function App() {
  const router = useRouter()
  const { isConnected } = useAccount()

  const handleStart = () => {
    if (!isConnected) {
      triggerHaptic(hapticPatterns.error)
      return
    }
    triggerHaptic(hapticPatterns.success)
    router.push('/connect')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-8xl mb-6"
        >
          🤝
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Tap<span className="text-indigo-400">Mint</span>
        </h1>

        <p className="text-xl text-gray-300 mb-8">
          Connect physically, mint digitally.
          <br />
          Turn real-world connections into NFTs on Base.
        </p>

        <div className="glass p-8 rounded-3xl mb-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl mb-2">📡</div>
              <p className="text-sm text-gray-400">Bluetooth</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl mb-2">📱</div>
              <p className="text-sm text-gray-400">NFC Tap</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm text-gray-400">QR Code</p>
            </motion.div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mb-8" />

          <div className="flex flex-col items-center gap-4">
            <WalletConnect />
            
            {isConnected && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold glow-strong"
              >
                Start Connection
              </motion.button>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Powered by Base • IPFS • Web3</p>
        </div>
      </motion.div>
    </div>
  )
}

