<script lang="ts">
	import {
		WalletManager,
		WalletId,
		NetworkId,
		type SupportedWallets,
		type NetworkConfig,
		type WalletManagerOptions
	} from '@txnlab/use-wallet-svelte';

	import { useWalletContext, useWallet } from '@txnlab/use-wallet-svelte';
	import { onMount } from 'svelte';
	import Network from '../algorand/network.svelte';
	import { walletStore, blockchainStore, userStore, analyticsStore } from '$lib/stores';
	import { useAnalytics } from '$lib/composables/useAnalytics.svelte';

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

	const analytics = useAnalytics();

	// Sync wallet state with store
	onMount(() => {
		const { activeWallet } = useWallet();

		// Set network in stores
		walletStore.setNetwork('testnet');
		blockchainStore.setNetwork('testnet');

		// Watch for wallet changes
		$effect(() => {
			const wallet = activeWallet();

			if (wallet?.isConnected) {
				// Update wallet store
				walletStore.setWallet(wallet);

				// Get address from wallet store after setting
				const address = walletStore.activeAddress;
				if (address) {
					// Load user preferences for this wallet
					userStore.load(address);

					// Fetch blockchain data
					blockchainStore.fetchAll(address);

					// Start auto-refresh
					blockchainStore.startAutoRefresh(address);

					// Track wallet connection
					analytics.trackWalletConnect(wallet.metadata.name, address, 'testnet');
				}
			} else if (!wallet || !wallet?.isConnected) {
				// Wallet disconnected
				const previousAddress = walletStore.activeAddress;

				if (previousAddress) {
					analytics.trackWalletDisconnect(previousAddress);
				}

				// Clear stores
				walletStore.disconnect();
				blockchainStore.clear();
			}
		});

		// Cleanup on unmount
		return () => {
			blockchainStore.stopAutoRefresh();
		};
	});
</script>

<Network />
{@render children?.()}
