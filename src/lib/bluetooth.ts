export interface BluetoothDevice {
  id: string
  name: string
}

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc'
const CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321'

export const isBluetoothAvailable = () => {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

export const requestBluetoothDevice = async (): Promise<BluetoothDevice> => {
  if (!isBluetoothAvailable()) {
    throw new Error('Bluetooth not supported on this device')
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [SERVICE_UUID]
    })

    if (!device.name) {
      throw new Error('Device name not available')
    }

    return {
      id: device.id,
      name: device.name
    }
  } catch (error) {
    if ((error as Error).name === 'NotFoundError') {
      throw new Error('No device selected')
    }
    throw error
  }
}

export const connectToDevice = async () => {
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [SERVICE_UUID]
  })

  const server = await device.gatt?.connect()
  if (!server) throw new Error('Failed to connect to GATT server')

  return server
}

export const sendBluetoothMessage = async (server: BluetoothRemoteGATTServer, message: string) => {
  try {
    const service = await server.getPrimaryService(SERVICE_UUID)
    const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)
    
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    
    await characteristic.writeValue(data)
    return true
  } catch (error) {
    console.error('Bluetooth send error:', error)
    return false
  }
}

export const listenForBluetoothMessages = async (
  server: BluetoothRemoteGATTServer,
  callback: (message: string) => void
) => {
  try {
    const service = await server.getPrimaryService(SERVICE_UUID)
    const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)
    
    characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic
      const decoder = new TextDecoder()
      const message = decoder.decode(target.value)
      callback(message)
    })
    
    await characteristic.startNotifications()
  } catch (error) {
    console.error('Bluetooth listen error:', error)
  }
}
