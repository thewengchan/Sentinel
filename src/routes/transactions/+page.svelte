<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import ArrowDownLeftIcon from '@lucide/svelte/icons/arrow-down-left';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import XCircleIcon from '@lucide/svelte/icons/x-circle';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import DownloadIcon from '@lucide/svelte/icons/download';

	// Sample transaction data
	const transactions = [
		{
			hash: '0x1a2b3c4d...5e6f7g8h',
			type: 'send',
			description: 'Log Storage Payment',
			amount: '-0.002 ETH',
			status: 'confirmed',
			timestamp: '2024-01-15 14:30:22',
			gasUsed: '21,000',
			blockNumber: '18,234,567'
		},
		{
			hash: '0x9i8h7g6f...5e4d3c2b',
			type: 'receive',
			description: 'Received ETH',
			amount: '+0.5 ETH',
			status: 'confirmed',
			timestamp: '2024-01-15 12:15:45',
			gasUsed: '21,000',
			blockNumber: '18,234,500'
		},
		{
			hash: '0xa1b2c3d4...e5f6g7h8',
			type: 'contract',
			description: 'Smart Contract Interaction',
			amount: '-0.001 ETH',
			status: 'pending',
			timestamp: '2024-01-15 14:35:10',
			gasUsed: '-',
			blockNumber: '-'
		},
		{
			hash: '0x1z2y3x4w...5v6u7t8s',
			type: 'send',
			description: 'Token Purchase',
			amount: '-0.1 ETH',
			status: 'confirmed',
			timestamp: '2024-01-14 09:22:33',
			gasUsed: '45,000',
			blockNumber: '18,230,123'
		},
		{
			hash: '0x9r8q7p6o...5n4m3l2k',
			type: 'send',
			description: 'Failed Transaction',
			amount: '-0.0 ETH',
			status: 'failed',
			timestamp: '2024-01-13 16:45:12',
			gasUsed: '21,000',
			blockNumber: '18,225,890'
		}
	];
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Transactions</h1>
			<p class="text-muted-foreground">View blockchain transaction history for logged messages</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm">
				<FilterIcon class="mr-2 h-4 w-4" />
				Filter
			</Button>
			<Button variant="outline" size="sm">
				<DownloadIcon class="mr-2 h-4 w-4" />
				Export
			</Button>
		</div>
	</div>

	<!-- Transaction Stats -->
	<div class="grid gap-4 md:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Transactions</Card.Title>
				<ArrowUpRightIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">1,234</div>
				<p class="text-xs text-muted-foreground">All time</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Confirmed</Card.Title>
				<CheckCircle2Icon class="h-4 w-4 text-green-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">1,220</div>
				<p class="text-xs text-muted-foreground">98.9% success rate</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Pending</Card.Title>
				<ClockIcon class="h-4 w-4 text-amber-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">12</div>
				<p class="text-xs text-muted-foreground">Awaiting confirmation</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Gas Spent</Card.Title>
				<ExternalLinkIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">0.245 ETH</div>
				<p class="text-xs text-muted-foreground">≈ $508.32 USD</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Transactions List -->
	<Card.Root>
		<Card.Header>
			<Card.Title>All Transactions</Card.Title>
			<Card.Description>Complete transaction history with blockchain details</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				{#each transactions as tx}
					<div class="rounded-lg border p-4 transition-colors hover:bg-accent/50">
						<div class="flex items-start justify-between gap-4">
							<div class="flex flex-1 items-start gap-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full {tx.type ===
									'receive'
										? 'bg-green-100'
										: 'bg-blue-100'}"
								>
									{#if tx.type === 'receive'}
										<ArrowDownLeftIcon
											class="h-5 w-5 {tx.type === 'receive' ? 'text-green-600' : 'text-blue-600'}"
										/>
									{:else}
										<ArrowUpRightIcon
											class="h-5 w-5 {tx.type === 'receive' ? 'text-green-600' : 'text-blue-600'}"
										/>
									{/if}
								</div>
								<div class="flex-1 space-y-2">
									<div class="flex flex-wrap items-center gap-2">
										<span class="font-medium">{tx.description}</span>
										{#if tx.status === 'confirmed'}
											<span
												class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
											>
												<CheckCircle2Icon class="h-3 w-3" />
												Confirmed
											</span>
										{:else if tx.status === 'pending'}
											<span
												class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
											>
												<ClockIcon class="h-3 w-3" />
												Pending
											</span>
										{:else if tx.status === 'failed'}
											<span
												class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
											>
												<XCircleIcon class="h-3 w-3" />
												Failed
											</span>
										{/if}
									</div>
									<div class="space-y-1 text-xs text-muted-foreground">
										<p>Hash: <code class="font-mono">{tx.hash}</code></p>
										<p>Block: {tx.blockNumber} • Gas: {tx.gasUsed} • {tx.timestamp}</p>
									</div>
								</div>
							</div>
							<div class="space-y-2 text-right">
								<p
									class="font-semibold {tx.amount.startsWith('+')
										? 'text-green-600'
										: 'text-blue-600'}"
								>
									{tx.amount}
								</p>
								<Button variant="ghost" size="sm">
									<ExternalLinkIcon class="mr-1 h-3 w-3" />
									View
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Gas Analytics -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Gas Usage Analytics</Card.Title>
			<Card.Description>Historical gas consumption and costs</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
				<div class="text-center">
					<ExternalLinkIcon class="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
					<p class="text-sm text-muted-foreground">Gas analytics chart placeholder</p>
					<p class="mt-1 text-xs text-muted-foreground">Integrate with charting library</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
