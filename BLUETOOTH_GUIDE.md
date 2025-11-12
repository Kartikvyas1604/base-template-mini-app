# TapMint Bluetooth Connection Guide

## 🔵 How Real Bluetooth Pairing Works

### Overview
The Bluetooth feature in TapMint uses the **Web Bluetooth API** to enable peer-to-peer device discovery and data exchange between two users.

### Requirements

#### ✅ Supported Browsers
- **Chrome** (Android, Desktop)
- **Edge** (Desktop)
- **Opera** (Android, Desktop)

#### ❌ NOT Supported
- Safari (iOS/macOS) - Apple doesn't support Web Bluetooth API
- Firefox - Limited support, not recommended
- Chrome on iOS - Uses Safari's WebKit, no Bluetooth support

### How It Works (Step-by-Step)

#### User A (Initiator)
1. Opens TapMint app
2. Connects their wallet (MetaMask, Phantom, etc.)
3. Clicks "Scan for Bluetooth Devices"
4. Browser shows native Bluetooth device picker
5. Sees a list of ALL nearby Bluetooth devices
6. Selects User B's device from the list
7. Connection is established

#### User B (Receiver)
1. Opens TapMint app (must have Bluetooth enabled)
2. Connects their wallet
3. Their device becomes **discoverable** via Bluetooth
4. Waits for User A to scan and connect
5. Once connected, data exchange begins

### Real Device Discovery

The current implementation uses:
```javascript
await navigator.bluetooth.requestDevice({
  acceptAllDevices: true,
  optionalServices: [SERVICE_UUID]
})
```

This means:
- ✅ You'll see ALL nearby Bluetooth devices (phones, laptops, headphones, etc.)
- ✅ You need to know which device name belongs to the other user
- ✅ The other person must have Bluetooth ON and app OPEN
- ✅ Real device-to-device pairing (no mock data)

### Custom Service UUID

TapMint uses a custom Bluetooth service UUID:
```
SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb'
CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb'
```

This allows TapMint-specific data exchange once devices are connected.

### Data Exchange Flow

Once connected:
1. Devices exchange wallet addresses via GATT characteristics
2. Each user selects an emoji
3. Connection metadata is stored (timestamp, method, device info)
4. Data is uploaded to IPFS via Pinata
5. NFT is minted on Base Sepolia with IPFS metadata URI

### Limitations & Workarounds

#### Current Limitations
- **No automatic filtering**: You'll see ALL Bluetooth devices, not just TapMint users
- **No background advertising**: Both users must have the app open
- **Chrome/Edge only**: Limited browser support
- **Desktop vs Mobile**: Better experience on Android Chrome

#### Workarounds
1. **Coordinate names**: Tell the other person your device name before scanning
2. **Use alternatives**: If Bluetooth fails, try NFC or QR code methods
3. **Check permissions**: Ensure Bluetooth permissions are granted in browser settings

### Testing Real Bluetooth

#### Test with Two Real Devices
1. Get two Android phones OR one phone + one laptop with Chrome/Edge
2. Enable Bluetooth on both devices
3. Open TapMint on both devices
4. On Device A: Click "Scan for Bluetooth Devices"
5. On Device B: Keep app open with Bluetooth on
6. Device A should see Device B in the Bluetooth picker
7. Select Device B to connect
8. Connection established!

#### Expected Behavior
- ✅ Native Bluetooth picker shows up
- ✅ You see your phone, laptop, or nearby device names
- ✅ After selecting, status changes: Idle → Scanning → Connecting → Connected
- ✅ Device info (name, address) is displayed
- ✅ After connection, navigate to mint page automatically

### Troubleshooting

#### "Bluetooth not supported on this device"
- **Solution**: Use Chrome or Edge on Android or Desktop
- Safari and Firefox don't support Web Bluetooth API

#### "No device selected"
- **Solution**: Make sure you actually select a device from the picker
- Don't cancel the dialog

#### "Security Error"
- **Solution**: Check browser permissions
- Go to: chrome://settings/content/bluetooth
- Allow Bluetooth access for your site

#### Can't see the other device
- **Solution 1**: Make sure both devices have Bluetooth ON
- **Solution 2**: The other person must have TapMint open
- **Solution 3**: Try refreshing both apps
- **Solution 4**: Move devices closer together (within 10 meters)

#### Connection keeps failing
- **Solution**: Try the NFC or QR code method instead
- These are more reliable for cross-device connections

### Alternative Methods

If Bluetooth doesn't work:

1. **NFC** (Android Chrome only)
   - Tap devices together
   - Works great for quick physical proximity

2. **QR Code** (All browsers)
   - One user shows QR code
   - Other user scans with camera
   - Most universal method

### Technical Details

#### Web Bluetooth API
```javascript
// Check if available
if ('bluetooth' in navigator) {
  // Bluetooth is supported
}

// Request device
const device = await navigator.bluetooth.requestDevice({
  acceptAllDevices: true,
  optionalServices: [SERVICE_UUID]
})

// Connect to GATT server
const server = await device.gatt.connect()

// Get service and characteristic
const service = await server.getPrimaryService(SERVICE_UUID)
const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)

// Read/Write data
await characteristic.writeValue(data)
const value = await characteristic.readValue()
```

#### Browser Permissions
- Bluetooth requires **HTTPS** or localhost
- User must grant Bluetooth permission
- Permission is per-origin (stored by browser)

### Production Deployment Notes

When deploying to production:
1. ✅ Ensure site uses **HTTPS** (required for Bluetooth)
2. ✅ Test on real devices (Android phones recommended)
3. ✅ Provide clear instructions to users
4. ✅ Offer alternative connection methods (NFC, QR)
5. ✅ Show browser compatibility warnings

### Further Improvements (Future)

Potential enhancements:
- [ ] Add device name filtering (show only TapMint users)
- [ ] Implement background advertising with Service Workers
- [ ] Add Bluetooth LE advertisement for better discovery
- [ ] Create a "lobby" system where users can find each other by ID
- [ ] Add peer discovery via WebRTC as fallback

---

## 📚 Resources

- [Web Bluetooth API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Chrome Web Bluetooth Guide](https://developer.chrome.com/articles/bluetooth/)
- [Can I Use - Web Bluetooth](https://caniuse.com/web-bluetooth)

---

**Note**: This is REAL Bluetooth pairing with actual devices, not mock/demo data. Users will see real Bluetooth device names and establish actual connections.
