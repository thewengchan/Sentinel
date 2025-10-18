<script lang="ts">
	import algosdk from 'algosdk';
	import { onMount } from 'svelte';

	// Define the Algorand node connection parameters
	const algodToken = ''; // free service does not require tokens
	const algodServer = 'https://testnet-api.4160.nodely.dev';
	const algodPort = 443;

	// Create an instance of the algod client
	const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

	async function getNodeStatus() {
		try {
			const status = await algodClient.status().do();
			console.log('Node status:', status);
		} catch (err) {
			console.error('Failed to get node status:', err);
		}
	}

	// Call the function only on client-side to avoid SSR issues
	onMount(() => {
		getNodeStatus();
	});
</script>
