export const APP_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
export const APP_NAME = process.env.NEXT_PUBLIC_FRAME_NAME || 'TapMint';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_FRAME_DESCRIPTION || 'Connect physically, mint digitally. Turn real-world connections into NFTs on Base.';
export const APP_PRIMARY_CATEGORY = process.env.NEXT_PUBLIC_FRAME_PRIMARY_CATEGORY;
export const APP_TAGS = process.env.NEXT_PUBLIC_FRAME_TAGS?.split(',');
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_OG_IMAGE_URL = `${APP_URL}/api/opengraph-image`;
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#0a0e1a";
export const APP_BUTTON_TEXT = process.env.NEXT_PUBLIC_FRAME_BUTTON_TEXT || 'Start Connection';
export const APP_WEBHOOK_URL = process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID 
    ? `https://api.neynar.com/f/app/${process.env.NEYNAR_CLIENT_ID}/event`
    : `${APP_URL}/api/webhook`;
export const USE_WALLET = process.env.NEXT_PUBLIC_USE_WALLET === 'true';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
export const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
export const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
export const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';

