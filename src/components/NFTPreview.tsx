'use client'

import { motion } from 'framer-motion'
import { NFTMetadata } from '~/lib/ipfs'

interface NFTPreviewProps {
  metadata: NFTMetadata
  connectionMethod: string
}

export default function NFTPreview({ metadata, connectionMethod }: NFTPreviewProps) {
  const getMethodColor = () => {
    switch (connectionMethod.toLowerCase()) {
      case 'bluetooth': return 'from-blue-500 to-blue-700'
      case 'nfc': return 'from-purple-500 to-purple-700'
      case 'qr': return 'from-emerald-500 to-emerald-700'
      default: return 'from-indigo-500 to-purple-700'
    }
  }

  const getMethodIcon = () => {
    switch (connectionMethod.toLowerCase()) {
      case 'bluetooth': return '📡'
      case 'nfc': return '📱'
      case 'qr': return '📷'
      default: return '🤝'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-6 rounded-2xl"
    >
      <h3 className="text-xl font-semibold text-white mb-4 text-center">
        Your Connection NFT
      </h3>

      <div className={`relative bg-gradient-to-br ${getMethodColor()} p-8 rounded-xl mb-4 overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">{getMethodIcon()}</div>
          <h4 className="text-2xl font-bold text-white mb-2">{metadata.name}</h4>
          <p className="text-white/80 text-sm">{metadata.description}</p>
        </div>

        <div className="absolute top-4 right-4 text-4xl opacity-20">🤝</div>
        <div className="absolute bottom-4 left-4 text-4xl opacity-20">✨</div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
          <span className="text-sm text-gray-400">Method</span>
          <span className="text-sm font-medium text-white">
            {metadata.attributes.find(a => a.trait_type === 'Method')?.value}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
          <span className="text-sm text-gray-400">Emoji</span>
          <span className="text-2xl">
            {metadata.attributes.find(a => a.trait_type === 'Emoji')?.value}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
          <span className="text-sm text-gray-400">Date</span>
          <span className="text-sm font-medium text-white">
            {metadata.attributes.find(a => a.trait_type === 'Date')?.value}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
          <span className="text-sm text-gray-400">Partner</span>
          <span className="text-sm font-mono text-white">
            {metadata.attributes.find(a => a.trait_type === 'Partner')?.value.slice(0, 6)}...
            {metadata.attributes.find(a => a.trait_type === 'Partner')?.value.slice(-4)}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
        <p className="text-xs text-indigo-200 text-center">
          This NFT is your proof of physical connection on Base blockchain
        </p>
      </div>
    </motion.div>
  )
}
