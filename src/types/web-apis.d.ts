interface Navigator {
  bluetooth: {
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>
  }
}

interface RequestDeviceOptions {
  filters?: BluetoothLEScanFilter[]
  acceptAllDevices?: boolean
  optionalServices?: string[]
}

interface BluetoothLEScanFilter {
  services?: string[]
  name?: string
  namePrefix?: string
}

interface BluetoothDevice {
  id: string
  name: string | null
  gatt?: BluetoothRemoteGATTServer
}

interface BluetoothRemoteGATTServer {
  connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>
}

interface BluetoothRemoteGATTService {
  uuid: string
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  uuid: string
  value?: DataView
  writeValue(value: BufferSource): Promise<void>
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
}

interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NDEFReader: any
}
