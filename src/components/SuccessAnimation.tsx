'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface SuccessAnimationProps {
  show: boolean
  message?: string
}

export default function SuccessAnimation({ show, message = 'Success!' }: SuccessAnimationProps) {
  useEffect(() => {
    if (show) {
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [show])

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="glass p-8 rounded-3xl text-center max-w-md"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut'
          }}
          className="text-8xl mb-4"
        >
          🎉
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white mb-2">{message}</h2>
        <p className="text-gray-400">Your connection NFT has been minted!</p>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-6 text-6xl"
        >
          ✨
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
