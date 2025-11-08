'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { motion } from 'framer-motion'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    triggerHaptic(hapticPatterns.light)
    const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK')
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector })
    } else {
      connect({ connector: connectors[0] })
    }
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
        className="flex items-center gap-3"
      >
        <div className="glass px-4 py-2 rounded-xl">
          <p className="text-sm text-gray-300">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm transition-colors"
        >
          Disconnect
        </button>
      </motion.div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleConnect}
      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium glow transition-all"
    >
      Connect Wallet
    </motion.button>
  )
}
