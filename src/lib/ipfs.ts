export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || ''
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || ''

export const uploadToIPFS = async (metadata: NFTMetadata): Promise<string> => {
  if (!PINATA_JWT && !PINATA_API_KEY) {
    console.warn('No Pinata credentials found, using mock IPFS hash')
    return `ipfs://QmMock${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': PINATA_JWT ? `Bearer ${PINATA_JWT}` : '',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: metadata.name
        }
      })
    })

    if (!response.ok) {
      throw new Error('IPFS upload failed')
    }

    const data = await response.json()
    return `ipfs://${data.IpfsHash}`
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw error
  }
}

export const createNFTMetadata = (
  tokenId: number,
  connectionMethod: string,
  emoji: string,
  partnerAddress: string,
  imageUrl?: string
): NFTMetadata => {
  const date = new Date().toISOString().split('T')[0]
  
  return {
    name: `TapMint Connection #${tokenId}`,
    description: `Physical connection via ${connectionMethod} on ${date}`,
    image: imageUrl || 'ipfs://QmDefaultImageHash',
    attributes: [
      { trait_type: 'Method', value: connectionMethod },
      { trait_type: 'Emoji', value: emoji },
      { trait_type: 'Date', value: date },
      { trait_type: 'Partner', value: partnerAddress }
    ]
  }
}

export const getIPFSUrl = (ipfsUri: string): string => {
  if (ipfsUri.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUri.replace('ipfs://', '')}`
  }
  return ipfsUri
}
