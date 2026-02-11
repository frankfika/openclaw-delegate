import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export function useWallet() {
  const account = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return {
    address: account.address,
    isConnected: account.isConnected,
    chain: account.chain,
    connectWallet,
    disconnect,
    connectors,
    connect,
  };
}
