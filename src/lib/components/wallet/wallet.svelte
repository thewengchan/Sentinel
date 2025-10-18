<script lang="ts">
	import {
		WalletManager,
		WalletId,
		NetworkId,
		type SupportedWallets,
		type NetworkConfig,
		type WalletManagerOptions
	} from '@txnlab/use-wallet-svelte';

	import { useWalletContext } from '@txnlab/use-wallet-svelte';
	import Network from '../algorand/network.svelte';

	interface WalletManagerConfig {
		wallets?: SupportedWallets[]; // Array of wallets to enable
		networks?: Record<string, NetworkConfig>; // Custom network configurations
		defaultNetwork?: string; // Network to use by default
		options?: WalletManagerOptions; // Additional options
	}

	let { children } = $props();

	const manager = new WalletManager({
		wallets: [WalletId.PERA, WalletId.DEFLY],
		defaultNetwork: NetworkId.TESTNET // or just 'mainnet'
	});

	useWalletContext(manager);
</script>

<Network />
{@render children?.()}
