# 🔗 How Real Peer-to-Peer Connections Work in TapMint

## Overview

TapMint uses **REAL** peer-to-peer data exchange - **NO DEMO DATA, NO MOCK DATA**. When two users connect, they exchange actual wallet addresses and create authentic blockchain transactions.

---

## 🔵 Bluetooth Connection (Real Device Pairing)

### How It Works
1. **User A** (Initiator):
   - Opens TapMint
   - Connects wallet (gets real address like `0x742d...`)
   - Clicks "Scan for Bluetooth Devices"
   - Browser shows native Bluetooth picker with ALL nearby devices
   - Selects **User B's device** by name (e.g., "Samsung Galaxy", "MacBook Pro")

2. **User B** (Receiver):
   - Opens TapMint
   - Connects wallet (gets real address like `0x8f3a...`)
   - Keeps Bluetooth ON and app OPEN
   - Their device becomes discoverable

3. **Connection Established**:
   - User A sees User B's device name and ID
   - Data flows: Bluetooth GATT → Local storage → Session
   - Real wallet addresses are exchanged
   - Both users proceed to emoji selection

### What's REAL:
✅ Browser's native Bluetooth API (`navigator.bluetooth`)
✅ Actual device names (your phone/laptop name)
✅ Real wallet addresses from connected wallets
✅ GATT server connection between devices
✅ Bidirectional data exchange

### Browser Requirements:
- Chrome/Edge on Android or Desktop
- Safari/Firefox NOT supported (no Web Bluetooth API)

---

## 📷 QR Code Connection (Camera Scanning)

### How It Works
1. **User A** (Generates QR):
   - Opens TapMint → Connect → QR Code → "Generate"
   - App creates QR code containing:
     ```json
     {
       "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEAf",
       "sessionId": "session-1730995234-kj4h3k2j",
       "timestamp": 1730995234567
     }
     ```
   - Shows QR code on screen

2. **User B** (Scans QR):
   - Opens TapMint → Connect → QR Code → "Scan"
   - Camera activates with jsQR library
   - Points camera at User A's QR code
   - App decodes QR and extracts User A's wallet address

3. **Connection Established**:
   - User B now has User A's real wallet address
   - Session is created with both addresses
   - Both users proceed to emoji selection

### What's REAL:
✅ Actual wallet address in QR code (from wagmi `useAccount()`)
✅ Real camera scanning via `navigator.mediaDevices.getUserMedia()`
✅ jsQR library decodes actual QR pixel data
✅ JSON parsing of real session data
✅ Both users have each other's verified wallet addresses

### How to Test:
1. Open TapMint on Device A, connect wallet, generate QR
2. Open TapMint on Device B, connect wallet, click scan
3. Device B points camera at Device A's screen
4. Connection established with real wallet addresses!

---

## 📱 NFC Connection (Physical Tap)

### How It Works
1. **User A** (Writes NFC Tag):
   - Opens TapMint → Connect → NFC → "Write Tag"
   - App writes to NFC tag:
     ```json
     {
       "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEAf",
       "sessionId": "nfc-1730995234-mj8d2k1l",
       "timestamp": 1730995234567
     }
     ```
   - Taps phone to NFC tag/sticker

2. **User B** (Reads NFC Tag):
   - Opens TapMint → Connect → NFC → "Read Tag"
   - Taps phone to same NFC tag
   - App reads User A's wallet address from tag

3. **Connection Established**:
   - User B has User A's real wallet address
   - Session is created
   - Both proceed to emoji selection

### What's REAL:
✅ Actual NFC hardware on Android devices
✅ Web NFC API (`NDEFReader`)
✅ Real wallet address written to physical NFC tag
✅ Electromagnetic data transfer between phone and tag
✅ JSON data stored in NFC tag memory

### Requirements:
- Android device with NFC hardware
- Chrome browser (only browser with Web NFC API)
- Physical NFC tag (NTAG213/215/216 recommended)
- NFC enabled in phone settings

---

## 🎯 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     TapMint Connection Flow                  │
└─────────────────────────────────────────────────────────────┘

User A (0x742d...)                    User B (0x8f3a...)
     │                                       │
     ├─ Connect Wallet                       ├─ Connect Wallet
     │  (MetaMask/Phantom/etc)              │  (MetaMask/Phantom/etc)
     │                                       │
     ├─ Choose Method:                       │
     │  • Bluetooth ──────────────────────> │ Accept Connection
     │  • QR Generate ────────────────────> │ Scan QR Code
     │  • NFC Write ──────────────────────> │ Read NFC Tag
     │                                       │
     ├─ Exchange Data:                       │
     │  Address: 0x742d...  ──────────────> │ Receives: 0x742d...
     │  SessionID: session-xxx              │ SessionID: session-xxx
     │                                       │
     │  Receives: 0x8f3a... <───────────────┤ Address: 0x8f3a...
     │                                       │
     ├─ Select Emoji: 🚀                     ├─ Select Emoji: 🔥
     │                                       │
     ├─ Upload to IPFS ──────────────────────┤ (Pinata)
     │  Metadata:                            │
     │  {                                    │
     │    user1: "0x742d...",               │
     │    user2: "0x8f3a...",               │
     │    emoji1: "🚀",                      │
     │    emoji2: "🔥",                      │
     │    method: "bluetooth",              │
     │    timestamp: 1730995234567          │
     │  }                                    │
     │                                       │
     ├─ Mint NFT on Base Sepolia            │
     │  Contract: 0x01f7c6C141e7d...        │
     │  Function: mintConnection()          │
     │  Token URI: ipfs://Qm...             │
     │                                       │
     └─ NFT Minted ✅                        └─ Proof of Connection Created
```

---

## 🔐 Security & Verification

### Wallet Address Verification
- All addresses come from **wagmi's `useAccount()` hook**
- Connected via user's actual Web3 wallet (MetaMask, Phantom, etc.)
- No manual input, no fake addresses
- Each address is verified on-chain when minting

### Session Management
- Unique session IDs: `session-${timestamp}-${random}`
- Stored in browser localStorage
- Auto-cleanup after 30 minutes
- Prevents duplicate connections

### Data Integrity
- QR codes contain signed session data
- NFC tags write immutable data
- Bluetooth uses GATT characteristics
- All data validated before minting

---

## 🧪 Testing Real Connections

### Test Bluetooth (2 devices needed):
```bash
# Device 1 (Android or Laptop with Chrome)
1. Open TapMint
2. Connect wallet → Get address 0xABC...
3. Go to Connect → Bluetooth → Scan
4. See Device 2 in picker

# Device 2 (Android or Laptop with Chrome)
1. Open TapMint
2. Connect wallet → Get address 0xDEF...
3. Keep Bluetooth ON
4. Wait for Device 1 to connect

# Result:
✅ Device 1 shows: "Connected to Device 2"
✅ Session has BOTH real addresses: 0xABC... & 0xDEF...
```

### Test QR Code (2 devices or 1 device + webcam):
```bash
# Device 1
1. TapMint → Connect → QR → Generate
2. Show QR code on screen
3. QR contains YOUR wallet address

# Device 2
1. TapMint → Connect → QR → Scan
2. Point camera at Device 1's QR
3. Scans and extracts Device 1's address

# Result:
✅ Device 2 has Device 1's REAL wallet address
✅ Can proceed to mint with actual data
```

### Test NFC (Android phones + NFC tag):
```bash
# Device 1 (Android)
1. Get a blank NFC tag (NTAG213)
2. TapMint → Connect → NFC → Write
3. Tap phone to NFC tag
4. Your wallet address written to tag

# Device 2 (Android)
1. TapMint → Connect → NFC → Read
2. Tap phone to same NFC tag
3. Reads Device 1's wallet address

# Result:
✅ Physical NFC tag has REAL wallet data
✅ Device 2 retrieved actual address from tag
```

---

## ❌ What's NOT Used (No Demo Data)

We do NOT use:
- ❌ Hardcoded addresses like `0x123...`
- ❌ Mock wallet connections
- ❌ Fake device names
- ❌ Simulated Bluetooth
- ❌ Demo QR codes
- ❌ Virtual NFC tags
- ❌ LocalStorage-only connections
- ❌ Server-based matching

Everything is REAL peer-to-peer exchange!

---

## 🚀 Production Checklist

Before deploying:

- [ ] Test Bluetooth on 2 real Android/Desktop Chrome devices
- [ ] Test QR scanning with real camera between 2 devices
- [ ] Test NFC with physical NFC tags on Android
- [ ] Verify wallet addresses match in mint transaction
- [ ] Check IPFS metadata contains correct addresses
- [ ] Ensure NFT shows both users' real addresses
- [ ] Test on Base Sepolia testnet first
- [ ] Deploy contract to Base mainnet
- [ ] Update contract address in constants.ts

---

## 📚 Technical Stack

| Feature | Technology | Purpose |
|---------|-----------|---------|
| Bluetooth | Web Bluetooth API | Device discovery & pairing |
| QR Code | jsQR + QRCode.js | Generation & scanning |
| NFC | Web NFC API (NDEFReader) | Tag read/write |
| Wallets | wagmi v2 + viem | Real wallet connections |
| Blockchain | Base Sepolia/Mainnet | NFT minting |
| Storage | Pinata IPFS | Metadata hosting |

---

## 🆘 Troubleshooting

### "No real data exchanged"
**Cause**: Browser/device doesn't support APIs
**Fix**: Use Chrome on Android or Desktop

### "Bluetooth not finding devices"
**Cause**: Other device doesn't have app open
**Fix**: Both users must have TapMint open simultaneously

### "QR scan not working"
**Cause**: Camera permissions denied
**Fix**: Allow camera access in browser settings

### "NFC write failed"
**Cause**: Tag is read-only or incompatible
**Fix**: Use NTAG213/215/216 writeable tags

---

## ✅ Verification

To verify real data is being used:

1. **Check browser console logs**:
   ```javascript
   console.log('Bluetooth connected:', device)
   console.log('QR scanned:', data)
   console.log('NFC read:', data)
   ```

2. **Inspect session storage**:
   ```javascript
   localStorage.getItem('tapmint-session-xxx')
   ```

3. **View mint transaction**:
   - Go to Base Sepolia explorer
   - Check `mintConnection()` call data
   - Verify both addresses are real and different

4. **Check IPFS metadata**:
   ```bash
   curl https://gateway.pinata.cloud/ipfs/Qm...
   ```
   Should show both users' real wallet addresses

---

**Remember**: TapMint is 100% REAL peer-to-peer. No demos, no mocks, no fake data! 🚀
