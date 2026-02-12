import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, arbitrum, optimism, polygon } from 'wagmi/chains';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, arbitrum, optimism, polygon],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
  ssr: false,
  storage: null,
});

export function useWallet() {
  const account = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = async () => {
    // Check if MetaMask is available
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask extension to connect your wallet.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      // Use wallet_requestPermissions to FORCE MetaMask popup every time
      // This is different from eth_requestAccounts which auto-approves if already authorized
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      // After user approves in MetaMask popup, get the accounts
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (!accounts || accounts.length === 0) {
        alert('No accounts returned from MetaMask. Please try again.');
        return;
      }

      // Connect via wagmi to sync state
      const connector = connectors.find(c => c.id === 'metaMask' || c.type === 'injected') || connectors[0];
      if (connector) {
        connect({ connector });
      }
    } catch (err: any) {
      if (err.code === 4001) {
        // User rejected the request - this is fine, just do nothing
        return;
      }
      console.error('Wallet connection error:', err);
      alert(`Failed to connect wallet: ${err.message}`);
    }
  };

  return {
    address: account.address,
    isConnected: account.isConnected,
    chain: account.chain,
    connectWallet,
    disconnect,
    error,
  };
}
