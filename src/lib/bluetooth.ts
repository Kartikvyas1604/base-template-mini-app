export interface BluetoothDevice {
  id: string
  name: string
  address?: string
}

// TapMint Custom Service UUID
const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb'
const CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb'

export const isBluetoothAvailable = () => {
  if (typeof navigator === 'undefined' || !('bluetooth' in navigator)) {
    return false
  }
  return true
}

export const requestBluetoothDevice = async (): Promise<BluetoothDevice> => {
  if (!isBluetoothAvailable()) {
    throw new Error('Bluetooth not supported on this device. Please use Chrome/Edge on desktop or Android.')
  }

  try {
    // Request any Bluetooth device
    const device = await navigator.bluetooth.requestDevice({
      // Accept all devices to find other TapMint users
      acceptAllDevices: true,
      optionalServices: [SERVICE_UUID, 'battery_service', 'device_information']
    })

    if (!device.name) {
      throw new Error('Device name not available. Please try again.')
    }

    // Get device info
    const deviceInfo: BluetoothDevice = {
      id: device.id,
      name: device.name,
      address: device.name // Using name as identifier
    }

    return deviceInfo
  } catch (error) {
    const err = error as Error
    if (err.name === 'NotFoundError') {
      throw new Error('No device selected. Please select a device to connect.')
    }
    if (err.name === 'NotSupportedError') {
      throw new Error('Bluetooth not supported. Try Chrome on Android or desktop.')
    }
    if (err.name === 'SecurityError') {
      throw new Error('Bluetooth access denied. Please enable Bluetooth permissions.')
    }
    throw new Error(`Bluetooth error: ${err.message}`)
  }
}

export const connectToDevice = async (deviceName?: string) => {
  if (!isBluetoothAvailable()) {
    throw new Error('Bluetooth not supported')
  }

  try {
    const options: RequestDeviceOptions = {
      acceptAllDevices: true,
      optionalServices: [SERVICE_UUID]
    }

    // If device name provided, filter by name
    if (deviceName) {
      options.acceptAllDevices = false
      options.filters = [{ name: deviceName }]
    }

    const device = await navigator.bluetooth.requestDevice(options)
    const server = await device.gatt?.connect()
    
    if (!server) {
      throw new Error('Failed to connect to device')
    }

    return { device, server }
  } catch (error) {
    throw new Error(`Connection failed: ${(error as Error).message}`)
  }
}

export const sendBluetoothMessage = async (
  server: BluetoothRemoteGATTServer, 
  message: string
): Promise<boolean> => {
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
): Promise<() => void> => {
  try {
    const service = await server.getPrimaryService(SERVICE_UUID)
    const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)
    
    const handler = (event: Event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic
      if (target.value) {
        const decoder = new TextDecoder()
        const message = decoder.decode(target.value)
        callback(message)
      }
    }
    
    characteristic.addEventListener('characteristicvaluechanged', handler)
    await characteristic.startNotifications()
    
    // Return cleanup function
    return () => {
      characteristic.removeEventListener('characteristicvaluechanged', handler)
    }
  } catch (error) {
    console.error('Bluetooth listen error:', error)
    return () => {}
  }
}
