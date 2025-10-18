<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import CodeIcon from '@lucide/svelte/icons/code';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import ActivityIcon from '@lucide/svelte/icons/activity';

	// Sample smart contract data
	const contracts = [
		{
			name: 'Sentinel Monitor',
			address: '0x1234...5678',
			description: 'Main monitoring and logging smart contract',
			status: 'active',
			logsStored: '1,234',
			lastInteraction: '2 mins ago',
			version: 'v1.2.0'
		},
		{
			name: 'Safety Validator',
			address: '0xabcd...efgh',
			description: 'AI response validation and safety checking',
			status: 'active',
			validations: '10,542',
			lastInteraction: '5 mins ago',
			version: 'v1.1.0'
		},
		{
			name: 'Token Manager',
			address: '0x9876...5432',
			description: 'SEN token management and distribution',
			status: 'active',
			transfers: '342',
			lastInteraction: '1 hour ago',
			version: 'v1.0.0'
		}
	];
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Smart Contracts</h1>
			<p class="text-muted-foreground">View and interact with monitoring smart contracts</p>
		</div>
		<Button variant="outline">
			<ExternalLinkIcon class="mr-2 h-4 w-4" />
			Deploy New Contract
		</Button>
	</div>

	<!-- Contract Stats -->
	<div class="grid gap-4 md:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Active Contracts</Card.Title>
				<FileTextIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">3</div>
				<p class="text-xs text-muted-foreground">All operational</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Interactions</Card.Title>
				<ActivityIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">12,118</div>
				<p class="text-xs text-muted-foreground">All time</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Logs Stored</Card.Title>
				<ShieldCheckIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">1,234</div>
				<p class="text-xs text-muted-foreground">On-chain records</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Gas Efficiency</Card.Title>
				<CheckCircle2Icon class="h-4 w-4 text-green-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">98.5%</div>
				<p class="text-xs text-muted-foreground">Optimized calls</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Deployed Contracts -->
	<div class="space-y-4">
		{#each contracts as contract}
			<Card.Root>
				<Card.Header>
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<Card.Title>{contract.name}</Card.Title>
								<span
									class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
								>
									{contract.status}
								</span>
								<span class="font-mono text-xs text-muted-foreground">{contract.version}</span>
							</div>
							<Card.Description>{contract.description}</Card.Description>
						</div>
						<Button variant="outline" size="sm">
							<ExternalLinkIcon class="h-4 w-4" />
						</Button>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						<div class="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
							<div class="space-y-1">
								<p class="text-xs font-medium text-muted-foreground">Contract Address</p>
								<div class="flex items-center gap-2">
									<code class="font-mono text-sm">{contract.address}</code>
									<Button variant="ghost" size="sm">
										<CopyIcon class="h-3 w-3" />
									</Button>
								</div>
							</div>
							<div class="text-right">
								<p class="text-xs text-muted-foreground">Last Interaction</p>
								<p class="text-sm font-medium">{contract.lastInteraction}</p>
							</div>
						</div>

						<div class="grid grid-cols-3 gap-4">
							{#if 'logsStored' in contract}
								<div class="space-y-1">
									<p class="text-xs text-muted-foreground">Logs Stored</p>
									<p class="text-xl font-bold">{contract.logsStored}</p>
								</div>
							{/if}
							{#if 'validations' in contract}
								<div class="space-y-1">
									<p class="text-xs text-muted-foreground">Validations</p>
									<p class="text-xl font-bold">{contract.validations}</p>
								</div>
							{/if}
							{#if 'transfers' in contract}
								<div class="space-y-1">
									<p class="text-xs text-muted-foreground">Transfers</p>
									<p class="text-xl font-bold">{contract.transfers}</p>
								</div>
							{/if}
						</div>

						<div class="flex gap-2">
							<Button variant="outline" size="sm" class="flex-1">
								<CodeIcon class="mr-2 h-4 w-4" />
								View Code
							</Button>
							<Button variant="outline" size="sm" class="flex-1">
								<ActivityIcon class="mr-2 h-4 w-4" />
								View Activity
							</Button>
							<Button size="sm" class="flex-1">
								<FileTextIcon class="mr-2 h-4 w-4" />
								Interact
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Contract Functions -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Quick Contract Interactions</Card.Title>
			<Card.Description>Common operations with your smart contracts</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center gap-2">
						<ShieldCheckIcon class="h-5 w-5 text-blue-600" />
						<h3 class="font-semibold">Store New Log</h3>
					</div>
					<p class="text-sm text-muted-foreground">
						Store a new AI interaction log on the blockchain
					</p>
					<Button class="w-full">Execute Function</Button>
				</div>

				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center gap-2">
						<FileTextIcon class="h-5 w-5 text-green-600" />
						<h3 class="font-semibold">Validate Safety</h3>
					</div>
					<p class="text-sm text-muted-foreground">Run safety validation on recent interactions</p>
					<Button class="w-full">Execute Function</Button>
				</div>

				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center gap-2">
						<CodeIcon class="h-5 w-5 text-purple-600" />
						<h3 class="font-semibold">Query Logs</h3>
					</div>
					<p class="text-sm text-muted-foreground">Retrieve stored logs from the blockchain</p>
					<Button class="w-full">Execute Function</Button>
				</div>

				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center gap-2">
						<ActivityIcon class="h-5 w-5 text-amber-600" />
						<h3 class="font-semibold">Get Statistics</h3>
					</div>
					<p class="text-sm text-muted-foreground">Fetch monitoring statistics from contracts</p>
					<Button class="w-full">Execute Function</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
