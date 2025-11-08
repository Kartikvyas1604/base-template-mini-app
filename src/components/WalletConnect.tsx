'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

export default function WalletConnect() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showOptions, setShowOptions] = useState(false)

  const walletIcons: Record<string, string> = {
    'coinbaseWalletSDK': '🔷',
    'metaMask': '🦊',
    'walletConnect': '🌈',
    'phantom': '👻',
    'rainbow': '🌈',
    'farcasterFrame': '🎯',
  }

  const walletNames: Record<string, string> = {
    'coinbaseWalletSDK': 'Coinbase',
    'metaMask': 'MetaMask',
    'walletConnect': 'WalletConnect',
    'phantom': 'Phantom',
    'rainbow': 'Rainbow',
    'farcasterFrame': 'Farcaster',
  }

  const handleConnect = (connectorToUse: typeof connectors[0]) => {
    triggerHaptic(hapticPatterns.light)
    connect({ connector: connectorToUse })
    setShowOptions(false)
  }

  const handleDisconnect = () => {
    triggerHaptic(hapticPatterns.light)
    disconnect()
  }

  if (isConnected && address) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
      >
        <div className="glass px-4 py-3 rounded-xl flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xl">{walletIcons[connector?.id || ''] || '💳'}</span>
          <p className="text-sm text-gray-300">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm transition-colors w-full sm:w-auto"
        >
          Disconnect
        </button>
      </motion.div>
    )
  }

  return (
    <div className="relative w-full max-w-sm">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowOptions(!showOptions)}
        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium glow transition-all"
      >
        Connect Wallet
      </motion.button>

      <AnimatePresence>
        {showOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOptions(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Wallet Options Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-full mt-3 left-0 right-0 glass rounded-2xl p-4 shadow-2xl z-50 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Choose Wallet</h3>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {connectors.map((connector) => (
                  <motion.button
                    key={connector.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleConnect(connector)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all bg-white/5 hover:bg-white/10 text-white"
                  >
                    <span className="text-2xl">{walletIcons[connector.id] || '💳'}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium">
                        {walletNames[connector.id] || connector.name}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">
                  Connect on Base Sepolia Testnet
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
