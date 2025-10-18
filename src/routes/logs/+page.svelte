<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import ShieldXIcon from '@lucide/svelte/icons/shield-x';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import SearchIcon from '@lucide/svelte/icons/search';

	// Sample log data
	const logs = [
		{
			id: 1,
			user: 'Emma',
			message: 'Can you help me with my math homework?',
			response: "Of course! I'd be happy to help with your math...",
			status: 'safe',
			timestamp: '2024-01-15 14:23:45',
			flagReason: null
		},
		{
			id: 2,
			user: 'Alex',
			message: 'Tell me about inappropriate topics',
			response: 'I cannot provide information on that topic...',
			status: 'flagged',
			timestamp: '2024-01-15 14:15:32',
			flagReason: 'Inappropriate content request'
		},
		{
			id: 3,
			user: 'Sarah',
			message: 'What are the phases of the moon?',
			response: 'The moon has eight distinct phases...',
			status: 'safe',
			timestamp: '2024-01-15 13:45:12',
			flagReason: null
		},
		{
			id: 4,
			user: 'Tom',
			message: 'How do I make a volcano for science fair?',
			response: "Here's a safe and fun way to create a volcano...",
			status: 'safe',
			timestamp: '2024-01-15 12:30:20',
			flagReason: null
		},
		{
			id: 5,
			user: 'Emma',
			message: 'Can you share personal information?',
			response: 'I cannot share personal information...',
			status: 'blocked',
			timestamp: '2024-01-15 11:20:10',
			flagReason: 'Attempted to access private data'
		}
	];
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Message Logs</h1>
			<p class="text-muted-foreground">
				View and analyze all AI chat interactions with safety status
			</p>
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

	<!-- Stats Overview -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Safe Messages</Card.Title>
				<ShieldCheckIcon class="h-4 w-4 text-green-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">1,180</div>
				<p class="text-xs text-muted-foreground">95.6% of all messages</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Flagged Messages</Card.Title>
				<ShieldAlertIcon class="h-4 w-4 text-amber-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">42</div>
				<p class="text-xs text-muted-foreground">3.4% requiring review</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Blocked Messages</Card.Title>
				<ShieldXIcon class="h-4 w-4 text-red-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">12</div>
				<p class="text-xs text-muted-foreground">1.0% prevented</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Search Bar -->
	<Card.Root>
		<Card.Content class="p-4">
			<div class="relative">
				<SearchIcon
					class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<input
					type="text"
					placeholder="Search messages, users, or timestamps..."
					class="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Logs Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title>All Messages</Card.Title>
			<Card.Description>Complete history of AI interactions and safety checks</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				{#each logs as log}
					<div class="rounded-lg border p-4 transition-colors hover:bg-accent/50">
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 space-y-2">
								<div class="flex items-center gap-2">
									<span class="font-semibold">{log.user}</span>
									<span class="text-xs text-muted-foreground">{log.timestamp}</span>
									{#if log.status === 'safe'}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
										>
											<ShieldCheckIcon class="h-3 w-3" />
											Safe
										</span>
									{:else if log.status === 'flagged'}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
										>
											<ShieldAlertIcon class="h-3 w-3" />
											Flagged
										</span>
									{:else if log.status === 'blocked'}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
										>
											<ShieldXIcon class="h-3 w-3" />
											Blocked
										</span>
									{/if}
								</div>
								<div>
									<p class="text-sm font-medium">User: {log.message}</p>
									<p class="mt-1 text-sm text-muted-foreground">AI: {log.response}</p>
								</div>
								{#if log.flagReason}
									<p class="text-xs font-medium text-amber-600">
										⚠️ Reason: {log.flagReason}
									</p>
								{/if}
							</div>
							<Button variant="outline" size="sm">View Details</Button>
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>
