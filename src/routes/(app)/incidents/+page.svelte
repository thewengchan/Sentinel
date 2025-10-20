<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { toast } from 'svelte-sonner';
	import { isBlockchainConfigured, SMART_CONTRACT_CONFIG } from '$lib/algorand/config';
	import { testnetClient, mainnetClient } from '$lib/algorand/client';
	import { formatIncidentForChain, submitIncidentToChain } from '$lib/algorand/incidents';
	import { useWallet } from '@txnlab/use-wallet-svelte';
	import QRCode from 'qrcode';

	let { data }: { data: PageData } = $props();
	const { activeWallet, transactionSigner } = useWallet();

	let submitting = $state<Record<string, boolean>>({});
	let abortControllers = $state<Record<string, AbortController>>({});
	let qrDialogOpen = $state(false);
	let qrCodeDataUrl = $state('');
	let currentTxUrl = $state('');

	// Format date
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}

	// Get severity badge variant
	function getSeverityVariant(severity: number): 'default' | 'secondary' | 'destructive' {
		if (severity >= 3) return 'destructive';
		if (severity >= 2) return 'destructive';
		if (severity >= 1) return 'secondary';
		return 'default';
	}

	// Get status badge variant
	function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
		switch (status) {
			case 'submitted':
			case 'confirmed':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'failed':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	// Cancel blockchain submission
	function cancelSubmission(incidentId: string) {
		if (abortControllers[incidentId]) {
			abortControllers[incidentId].abort();
			delete abortControllers[incidentId];
			submitting[incidentId] = false;
			toast.info('Submission cancelled');
		}
	}

	// Submit incident to blockchain
	async function submitToBlockchain(incidentId: string) {
		const wallet = activeWallet();

		if (!wallet?.isConnected || !data.walletAddress) {
			toast.error('No wallet connected', {
				description: 'Please connect your Algorand wallet first'
			});
			return;
		}

		if (!isBlockchainConfigured()) {
			toast.error('Blockchain not configured', {
				description: 'ALGORAND_APP_ID environment variable not set'
			});
			return;
		}

		submitting[incidentId] = true;
		const abortController = new AbortController();
		abortControllers[incidentId] = abortController;
		console.log(`🔗 Submitting incident ${incidentId.slice(0, 8)}... to blockchain`);

		try {
			// Find the incident
			const incident = data.incidents.find((i) => i.id === incidentId);
			if (!incident) {
				throw new Error('Incident not found');
			}

			// Convert content_hash to hex string
			let contentHashHex: string;
			if (typeof incident.content_hash === 'string') {
				contentHashHex = incident.content_hash.startsWith('\\x')
					? incident.content_hash.slice(2)
					: incident.content_hash;
			} else {
				throw new Error('Invalid content hash format');
			}

			// Format for chain
			const chainIncident = formatIncidentForChain(
				{
					id: incident.id,
					wallet_address: data.walletAddress!,
					ts: incident.ts,
					severity: incident.severity,
					category: incident.category,
					policy_version: incident.policy_version,
					action: incident.action
				},
				contentHashHex
			);

			// Get the appropriate client and set up signer
			const client = SMART_CONTRACT_CONFIG.NETWORK === 'mainnet' ? mainnetClient : testnetClient;

			client.setSigner(wallet, transactionSigner);
			console.log(`   🌐 Using ${SMART_CONTRACT_CONFIG.NETWORK} network`);

			// Check if aborted before submission
			if (abortController.signal.aborted) {
				throw new Error('Submission cancelled');
			}

			// Submit to blockchain
			console.log(`   📤 Submitting transaction...`);
			const result = await submitIncidentToChain(chainIncident, client, data.walletAddress!);

			// Check if aborted after submission
			if (abortController.signal.aborted) {
				throw new Error('Submission cancelled');
			}

			if (result.success) {
				console.log(`   ✅ Transaction successful: ${result.txId}`);

				// Update incident status in database
				await fetch(`/api/incidents/${incidentId}/status`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						chain_status: 'submitted',
						tx_id: result.txId
					}),
					signal: abortController.signal
				});

				toast.success('Successfully submitted to blockchain! 🎉', {
					description: `TX: ${result.txId.slice(0, 16)}...`
				});

				// Refresh the page to update the status
				setTimeout(() => window.location.reload(), 1500);
			} else {
				throw new Error(result.error || 'Transaction failed');
			}
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				console.log('   ⚠️ Submission cancelled by user');
				return;
			}

			console.error('   ❌ Blockchain submission error:', error);
			toast.error('Blockchain submission failed', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});

			// Update status to failed in database
			try {
				await fetch(`/api/incidents/${incidentId}/status`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						chain_status: 'failed'
					})
				});
			} catch (updateError) {
				console.error('Failed to update incident status:', updateError);
			}
		} finally {
			delete abortControllers[incidentId];
			submitting[incidentId] = false;
		}
	}

	// Generate QR code and show dialog
	async function viewTransaction(txId: string, network: 'testnet' | 'mainnet' = 'testnet') {
		const base =
			network === 'mainnet'
				? 'https://explorer.perawallet.app'
				: 'https://testnet.explorer.perawallet.app';
		// Pera expects trailing slash; keep it for faster redirect-free loads.
		const url = `${base}/tx/${encodeURIComponent(txId)}/`;
		currentTxUrl = url;

		try {
			// Generate QR code as data URL
			const dataUrl = await QRCode.toDataURL(url, {
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#ffffff'
				}
			});
			qrCodeDataUrl = dataUrl;
			qrDialogOpen = true;
		} catch (error) {
			console.error('Failed to generate QR code:', error);
			toast.error('Failed to generate QR code');
			// Fallback to opening the URL directly
			window.open(url, '_blank', 'noopener,noreferrer');
		}
	}

	export function viewBlock(round: number, network: 'testnet' | 'mainnet' = 'testnet') {
		const base =
			network === 'mainnet'
				? 'https://explorer.perawallet.app'
				: 'https://testnet.explorer.perawallet.app';
		const url = `${base}/block/${round}/`;
		window.open(url, '_blank', 'noopener,noreferrer');
	}

	// Filter pending high-severity incidents
	const pendingHighSeverity = $derived(
		data.incidents.filter((i) => i.chain_status === 'pending' && i.severity >= 2)
	);

	// Check if blockchain is configured
	const blockchainConfigured = isBlockchainConfigured();
</script>

<svelte:head>
	<title>Incidents | Sentinel</title>
	<meta name="description" content="View and manage moderation incidents" />
</svelte:head>

<div class="container mx-auto max-w-7xl p-4 md:p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Moderation Incidents</h1>
		<p class="mt-2 text-muted-foreground">View and manage your moderation incident history</p>
	</div>

	{#if !blockchainConfigured}
		<Card.Root class="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
			<Card.Header>
				<Card.Title class="text-yellow-900 dark:text-yellow-100">
					⚠️ Blockchain Not Configured
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-yellow-800 dark:text-yellow-200">
					Blockchain integration is not configured. Incidents are saved to the database but cannot
					be submitted to the Algorand blockchain. Set the <code
						class="rounded bg-yellow-200 px-1 py-0.5 dark:bg-yellow-900">ALGORAND_APP_ID</code
					> environment variable to enable blockchain submission.
				</p>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if pendingHighSeverity.length > 0 && blockchainConfigured}
		<Card.Root class="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
			<Card.Header>
				<Card.Title class="text-blue-900 dark:text-blue-100">
					🔗 {pendingHighSeverity.length} High-Severity Incident{pendingHighSeverity.length > 1
						? 's'
						: ''} Ready for Blockchain
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="mb-4 text-blue-800 dark:text-blue-200">
					You have high-severity incidents (severity ≥ 2) that can be permanently recorded on the
					Algorand blockchain. This creates an immutable audit trail.
				</p>
				<Button
					onclick={() => {
						pendingHighSeverity.forEach((incident) => {
							if (!submitting[incident.id]) {
								submitToBlockchain(incident.id);
							}
						});
					}}
					disabled={Object.keys(submitting).length > 0}
					class="gap-2"
				>
					📤 Submit All to Blockchain
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>Incident History</Card.Title>
			<Card.Description>
				{data.incidents.length} total incident{data.incidents.length !== 1 ? 's' : ''}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.incidents.length === 0}
				<div class="py-12 text-center text-muted-foreground">
					<p class="text-lg font-medium">No incidents found</p>
					<p class="mt-2">All your messages are clean! 🎉</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Date</Table.Head>
							<Table.Head>Category</Table.Head>
							<Table.Head>Severity</Table.Head>
							<Table.Head>From</Table.Head>
							<Table.Head>Action</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.incidents as incident}
							<Table.Row>
								<Table.Cell class="font-mono text-xs">{formatDate(incident.ts)}</Table.Cell>
								<Table.Cell>
									<Badge variant="outline">{incident.category}</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge variant={getSeverityVariant(incident.severity)}>
										{incident.severity}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge variant="secondary">{incident.from_side}</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge variant={incident.action === 'block' ? 'destructive' : 'default'}>
										{incident.action}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge variant={getStatusVariant(incident.chain_status)}>
										{incident.chain_status}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										{#if incident.tx_id}
											<Button
												variant="outline"
												size="sm"
												onclick={() => viewTransaction(incident.tx_id!)}
											>
												View TX
											</Button>
										{:else if incident.chain_status === 'pending' && incident.severity >= 2 && blockchainConfigured}
											{#if submitting[incident.id]}
												<Button
													size="sm"
													variant="outline"
													onclick={() => cancelSubmission(incident.id)}
												>
													Cancel
												</Button>
												<Button size="sm" disabled>Submitting...</Button>
											{:else}
												<Button size="sm" onclick={() => submitToBlockchain(incident.id)}>
													Submit to Chain
												</Button>
											{/if}
										{/if}
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- QR Code Dialog -->
<Dialog.Root bind:open={qrDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Transaction QR Code</Dialog.Title>
			<Dialog.Description>
				Scan this QR code to view the transaction on your mobile device
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col items-center gap-4 py-4">
			{#if qrCodeDataUrl}
				<img src={qrCodeDataUrl} alt="Transaction QR Code" class="rounded-lg border" />
			{/if}
			<div class="flex w-full flex-col gap-2">
				<p class="text-center text-sm text-muted-foreground">Or click the link below:</p>
				<a
					href={currentTxUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="text-center text-sm font-medium break-all text-blue-600 hover:underline dark:text-blue-400"
				>
					{currentTxUrl}
				</a>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (qrDialogOpen = false)}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
