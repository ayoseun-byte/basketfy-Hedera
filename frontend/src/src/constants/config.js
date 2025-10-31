

export const API_BASE_URL = import.meta.env.VITE_BASE_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const VAULT_CONTRACT_ID = import.meta.env.VITE_VAULT_CONTRACT_ID || "0.0.7161962";
export const VITE_PROJECT_ID = import.meta.env.VITE_PROJECT_ID


import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {hederaTestnet } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'


// Get projectId from https://dashboard.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694" // this is a public projectId only to use on localhost

if (!projectId) {
    throw new Error('Project ID is not defined')
}

export const metadata = {
    name: 'AppKit',
    description: 'AppKit Example',
    url: 'https://reown.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}


export const networks = [hederaTestnet]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks
})

// Set up Solana Adapter
export const solanaWeb3JsAdapter = new SolanaAdapter()

export const config = wagmiAdapter.wagmiConfig