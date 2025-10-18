<script lang="ts">
	import { useNetwork } from '@txnlab/use-wallet-svelte';

	const {
		// Active network management
		activeNetwork, // Currently active network
		setActiveNetwork, // Function to change networks

		// Runtime node configuration
		networkConfig, // Complete configuration for all networks
		activeNetworkConfig, // Configuration for active network only
		updateAlgodConfig, // Update a network's Algod configuration
		resetNetworkConfig // Reset network config to initial values
	} = useNetwork();
</script>

<div>
	<!-- Example: Network selector dropdown -->
	<select value={activeNetwork.current} onchange={(e) => setActiveNetwork(e.currentTarget.value)}>
		{#each Object.keys(networkConfig()) as networkId}
			<option>
				{networkId}
			</option>
		{/each}
	</select>
</div>
