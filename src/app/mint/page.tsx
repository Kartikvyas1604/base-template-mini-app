'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import NFTPreview from '~/components/NFTPreview'
import SuccessAnimation from '~/components/SuccessAnimation'
import { createNFTMetadata, uploadToIPFS } from '~/lib/ipfs'
import { triggerHaptic, hapticPatterns } from '~/lib/haptic'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '~/lib/contract'

function MintContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address } = useAccount()
  
  const method = searchParams.get('method') || 'unknown'
  const emoji = searchParams.get('emoji') || '🎉'
  const receivedEmoji = searchParams.get('received') || '💫'

  const [status, setStatus] = useState<'preview' | 'uploading' | 'minting' | 'success' | 'error'>('preview')
  const [error, setError] = useState('')
  const [metadata, setMetadata] = useState(createNFTMetadata(1, method, emoji, address || '0x0'))

  const { data: hash, writeContract } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConfirmed && status === 'minting') {
      setStatus('success')
      triggerHaptic(hapticPatterns.success)
    }
  }, [isConfirmed, status])

  useEffect(() => {
    if (address) {
      setMetadata(createNFTMetadata(
        Math.floor(Date.now() / 1000), 
        method, 
        `${emoji} ${receivedEmoji}`, 
        address
      ))
    }
  }, [address, method, emoji, receivedEmoji])

  const handleMint = async () => {
    if (!address) {
      setError('Please connect your wallet')
      triggerHaptic(hapticPatterns.error)
      return
    }

    try {
      setStatus('uploading')
      triggerHaptic(hapticPatterns.medium)

      const uri = await uploadToIPFS(metadata)

      setStatus('minting')
      triggerHaptic(hapticPatterns.medium)

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mintConnection',
        args: [address, uri, method]
      })

    } catch (err) {
      console.error('Minting error:', err)
      setError((err as Error).message || 'Failed to mint NFT')
      setStatus('error')
      triggerHaptic(hapticPatterns.error)
    }
  }

  const handleComplete = () => {
    router.push('/')
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Mint Your NFT</h1>
            <p className="text-gray-400">Immortalize your connection on Base</p>
          </div>

          <div className="mb-6">
            <NFTPreview metadata={metadata} connectionMethod={method} />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30"
            >
              <p className="text-sm text-red-200">{error}</p>
            </motion.div>
          )}

          {status === 'preview' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMint}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold glow-strong"
            >
              🎨 Mint NFT
            </motion.button>
          )}

          {status === 'uploading' && (
            <div className="glass p-6 rounded-xl text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="text-5xl mb-3"
              >
                📤
              </motion.div>
              <p className="text-white font-medium">Uploading to IPFS...</p>
              <p className="text-sm text-gray-400 mt-2">Preparing metadata</p>
            </div>
          )}

          {(status === 'minting' || isConfirming) && (
            <div className="glass p-6 rounded-xl text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-5xl mb-3"
              >
                ⚡
              </motion.div>
              <p className="text-white font-medium">Minting NFT...</p>
              <p className="text-sm text-gray-400 mt-2">
                {isConfirming ? 'Confirming transaction...' : 'Please confirm in your wallet'}
              </p>
            </div>
          )}

          {status === 'success' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
            >
              ✓ View in Wallet
            </motion.button>
          )}

          {status === 'error' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStatus('preview')
                setError('')
              }}
              className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-lg font-semibold"
            >
              Try Again
            </motion.button>
          )}

          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full py-3 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>

      <SuccessAnimation show={status === 'success'} message="NFT Minted!" />
    </>
  )
}

export default function MintPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading mint page...</div>
      </div>
    }>
      <MintContent />
    </Suspense>
  )
}
