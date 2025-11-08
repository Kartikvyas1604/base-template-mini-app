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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full relative z-10"
      >
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
            className="text-8xl md:text-9xl mb-6 inline-block"
          >
            🤝
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight"
          >
            Tap<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">Mint</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-3 font-light"
          >
            Connect physically, mint digitally
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-md text-gray-400 max-w-2xl mx-auto"
          >
            Turn real-world connections into unique NFTs on Base blockchain
          </motion.p>
        </div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass p-8 md:p-12 rounded-3xl mb-8 backdrop-blur-xl border border-white/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {[
              { icon: '📡', title: 'Bluetooth', desc: 'Pair devices wirelessly', delay: 0.8 },
              { icon: '📱', title: 'NFC Tap', desc: 'Quick tap-to-connect', delay: 0.9 },
              { icon: '📷', title: 'QR Code', desc: 'Universal scanning', delay: 1.0 }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: feature.delay }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col items-center gap-5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="w-full max-w-sm"
              >
                <WalletConnect />
              </motion.div>
              
              {isConnected && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="px-12 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xl font-bold shadow-2xl glow-strong hover:shadow-indigo-500/50 transition-all"
                >
                  Start Connection ✨
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Base Sepolia
            </span>
            <span>•</span>
            <span>IPFS Storage</span>
            <span>•</span>
            <span>Web3 Native</span>
          </div>
          <p className="text-xs text-gray-600">
            Secure, decentralized, and immutable connection proofs
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

