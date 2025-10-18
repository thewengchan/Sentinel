<script lang="ts">
	import { useWallet } from '@txnlab/use-wallet-svelte';
	const {
		wallets, // List of available wallets
		activeWallet, // Currently active wallet (function)
		activeAccount, // Active account in active wallet
		activeAddress, // Address of active account
		isReady, // Whether all wallet providers have finished initialization
		signTransactions, // Function to sign transactions
		transactionSigner, // Typed signer for ATC and Algokit Utils
		algodClient // Algod client for active network
	} = useWallet();
</script>

{#if isReady()}
	{#if activeAddress.current}
		<div>Connected: {activeAddress.current}</div>
	{:else}
		<div>Not connected</div>
	{/if}
{:else}
	<div>Loading...</div>
{/if}
