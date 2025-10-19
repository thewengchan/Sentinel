<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import ShieldXIcon from '@lucide/svelte/icons/shield-x';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import SearchIcon from '@lucide/svelte/icons/search';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';

	export let data: PageData;

	// Helper to format timestamp
	function formatTimestamp(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Helper to truncate long text
	function truncate(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	{#if data.error}
		<Alert.Root variant="destructive">
			<Alert.Title>Error Loading Message Logs</Alert.Title>
			<Alert.Description>{data.error}</Alert.Description>
		</Alert.Root>
	{/if}

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
				<div class="text-2xl font-bold">{data.safeCount.toLocaleString()}</div>
				<p class="text-xs text-muted-foreground">
					{data.totalCount > 0 ? ((data.safeCount / data.totalCount) * 100).toFixed(1) : 0}% of all
					messages
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Flagged Messages</Card.Title>
				<ShieldAlertIcon class="h-4 w-4 text-amber-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.flaggedCount.toLocaleString()}</div>
				<p class="text-xs text-muted-foreground">
					{data.totalCount > 0 ? ((data.flaggedCount / data.totalCount) * 100).toFixed(1) : 0}%
					requiring review
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Blocked Messages</Card.Title>
				<ShieldXIcon class="h-4 w-4 text-red-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.blockedCount.toLocaleString()}</div>
				<p class="text-xs text-muted-foreground">
					{data.totalCount > 0 ? ((data.blockedCount / data.totalCount) * 100).toFixed(1) : 0}%
					prevented
				</p>
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
			<Card.Description>
				Complete history of AI interactions and safety checks
				{#if data.totalCount > 0}
					(Showing {data.logs.length} of {data.totalCount.toLocaleString()} messages)
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.logs.length > 0}
				<div class="space-y-4">
					{#each data.logs as log}
						<div class="rounded-lg border p-4 transition-colors hover:bg-accent/50">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 space-y-2">
									<div class="flex items-center gap-2">
										<span class="font-semibold">{log.user_name}</span>
										<span class="text-xs text-muted-foreground"
											>{formatTimestamp(log.timestamp)}</span
										>
										{#if log.status === 'safe'}
											<Badge
												variant="default"
												class="bg-green-100 text-green-700 hover:bg-green-100"
											>
												<ShieldCheckIcon class="mr-1 h-3 w-3" />
												Safe
											</Badge>
										{:else if log.status === 'flagged'}
											<Badge
												variant="default"
												class="bg-amber-100 text-amber-700 hover:bg-amber-100"
											>
												<ShieldAlertIcon class="mr-1 h-3 w-3" />
												Flagged
											</Badge>
										{:else if log.status === 'blocked'}
											<Badge variant="destructive">
												<ShieldXIcon class="mr-1 h-3 w-3" />
												Blocked
											</Badge>
										{/if}
									</div>
									<div>
										<p class="text-sm font-medium">User: {truncate(log.message, 200)}</p>
										<p class="mt-1 text-sm text-muted-foreground">
											AI: {truncate(log.response, 200)}
										</p>
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

				<!-- Pagination -->
				{#if data.totalPages > 1}
					<div class="mt-6 flex items-center justify-between">
						<p class="text-sm text-muted-foreground">
							Page {data.currentPage} of {data.totalPages}
						</p>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={data.currentPage === 1}
								href="?page={data.currentPage - 1}"
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={data.currentPage === data.totalPages}
								href="?page={data.currentPage + 1}"
							>
								Next
							</Button>
						</div>
					</div>
				{/if}
			{:else}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<MessageSquareIcon class="mb-4 h-16 w-16 text-muted-foreground" />
					<p class="text-lg font-medium">No messages yet</p>
					<p class="mt-2 text-sm text-muted-foreground">
						Message logs will appear here as users interact with the AI
					</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
