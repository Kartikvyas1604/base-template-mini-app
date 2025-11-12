'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import BluetoothConnect from '~/components/BluetoothConnect'
import NFCConnect from '~/components/NFCConnect'
import QRConnect from '~/components/QRConnect'
import { BluetoothDevice } from '~/lib/bluetooth'
import { NFCData } from '~/lib/nfc'
import { QRConnectionData } from '~/lib/qrCode'

export default function ConnectPage() {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<'bluetooth' | 'nfc' | 'qr' | null>(null)
  const [qrMode, setQrMode] = useState<'generate' | 'scan'>('generate')

  const handleBluetoothConnect = (device: BluetoothDevice) => {
    console.log('Bluetooth connected:', device)
    setTimeout(() => {
      router.push(`/session?method=bluetooth&peer=${encodeURIComponent(device.name)}`)
    }, 1000)
  }

  const handleNFCConnect = (data: NFCData) => {
    console.log('NFC connected:', data)
    setTimeout(() => {
      router.push(`/session?method=nfc&peer=${encodeURIComponent(data.address)}&sessionId=${data.sessionId}`)
    }, 1000)
  }

  const handleQRGenerate = (data: QRConnectionData) => {
    console.log('📷 QR generated:', data)
    // Don't navigate - let user show QR code to other person
    // They'll navigate when ready via the "Continue" button
  }

  const handleQRScan = (data: QRConnectionData) => {
    console.log('✅ QR scanned successfully:', data)
    
    // Validate data before navigating
    if (!data.address || !data.sessionId) {
      console.error('❌ Invalid QR data:', data)
      return
    }
    
    console.log('🔄 Navigating to session with peer:', data.address)
    // Navigate after successful scan with slight delay
    setTimeout(() => {
      router.push(`/session?method=qr&sessionId=${data.sessionId}&peer=${encodeURIComponent(data.address)}`)
    }, 500)
  }

  if (selectedMethod === 'bluetooth') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <motion.button
            onClick={() => setSelectedMethod(null)}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
          >
            ← Back
          </motion.button>
          <BluetoothConnect onConnect={handleBluetoothConnect} />
        </div>
      </div>
    )
  }

  if (selectedMethod === 'nfc') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <motion.button
            onClick={() => setSelectedMethod(null)}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
          >
            ← Back
          </motion.button>
          <NFCConnect onConnect={handleNFCConnect} />
        </div>
      </div>
    )
  }

  if (selectedMethod === 'qr') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <motion.button
            onClick={() => setSelectedMethod(null)}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
          >
            ← Back
          </motion.button>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setQrMode('generate')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                qrMode === 'generate'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => setQrMode('scan')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                qrMode === 'scan'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              Scan
            </button>
          </div>

          <QRConnect 
            mode={qrMode} 
            onGenerate={handleQRGenerate}
            onScan={handleQRScan}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Choose Connection Method</h1>
          <p className="text-gray-400">Select how you want to connect with your partner</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedMethod('bluetooth')}
            className="glass p-6 rounded-2xl text-center hover:bg-blue-500/10 transition-all"
          >
            <div className="text-5xl mb-4">📡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Bluetooth</h3>
            <p className="text-sm text-gray-400">Pair with nearby device</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedMethod('nfc')}
            className="glass p-6 rounded-2xl text-center hover:bg-purple-500/10 transition-all"
          >
            <div className="text-5xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-white mb-2">NFC Tap</h3>
            <p className="text-sm text-gray-400">Tap devices together</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedMethod('qr')}
            className="glass p-6 rounded-2xl text-center hover:bg-emerald-500/10 transition-all"
          >
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-white mb-2">QR Code</h3>
            <p className="text-sm text-gray-400">Scan or generate</p>
          </motion.button>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push('/')}
          className="mt-8 w-full py-3 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Home
        </motion.button>
      </motion.div>
    </div>
  )
}
