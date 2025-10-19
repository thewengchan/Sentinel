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
	import { onMount, untrack } from 'svelte';
	import Network from '../algorand/network.svelte';
	import { walletStore, blockchainStore, userStore, analyticsStore } from '$lib/stores';
	import { useAnalytics } from '$lib/composables/useAnalytics.svelte';
	import { testnetClient, mainnetClient } from '$lib/algorand/client';

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
	const { activeWallet, transactionSigner } = useWallet();

	// Set network in stores on mount
	onMount(() => {
		walletStore.setNetwork('testnet');
		blockchainStore.setNetwork('testnet');

		// Cleanup on unmount
		return () => {
			blockchainStore.stopAutoRefresh();
		};
	});

	// Watch for wallet changes - moved outside onMount
	$effect(() => {
		const wallet = activeWallet();

		if (wallet?.isConnected) {
			// Use untrack to prevent creating reactive dependencies
			untrack(() => {
				// Update wallet store
				walletStore.setWallet(wallet);

				// Get address from wallet store after setting
				const address = walletStore.activeAddress;
				if (address) {
					// Set up transaction signer for the connected wallet
					const client = walletStore.network === 'mainnet' ? mainnetClient : testnetClient;
					try {
						client.setSigner(wallet, transactionSigner);
						console.log('✅ Transaction signer set up for:', wallet.metadata.name);
					} catch (error) {
						console.error('Failed to set up transaction signer:', error);
					}

					// Load user preferences for this wallet
					userStore.load(address);

					// Fetch blockchain data
					blockchainStore.fetchAll(address);

					// Start auto-refresh
					blockchainStore.startAutoRefresh(address);

					// Track wallet connection
					analytics.trackWalletConnect(wallet.metadata.name, address, 'testnet');
				}
			});
		} else if (!wallet || !wallet?.isConnected) {
			// Use untrack to prevent creating reactive dependencies
			untrack(() => {
				// Wallet disconnected
				const previousAddress = walletStore.activeAddress;

				if (previousAddress) {
					analytics.trackWalletDisconnect(previousAddress);
				}

				// Clear stores
				walletStore.disconnect();
				blockchainStore.clear();
			});
		}
	});
</script>

<Network />
{@render children?.()}
