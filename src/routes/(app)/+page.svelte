<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import InfoIcon from '@lucide/svelte/icons/info';
	import * as Alert from '$lib/components/ui/alert/index.js';

	export let data: PageData;

	// Helper to format relative time
	function formatRelativeTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
	}

	// Helper to get status icon component
	function getStatusIcon(type: string) {
		switch (type) {
			case 'safe':
				return ShieldCheckIcon;
			case 'flagged':
				return ShieldAlertIcon;
			case 'blocked':
				return ShieldAlertIcon;
			default:
				return ActivityIcon;
		}
	}

	// Helper to get status color
	function getStatusColor(type: string) {
		switch (type) {
			case 'safe':
				return 'bg-green-100';
			case 'flagged':
				return 'bg-amber-100';
			case 'blocked':
				return 'bg-red-100';
			default:
				return 'bg-blue-100';
		}
	}

	// Helper to get icon color
	function getIconColor(type: string) {
		switch (type) {
			case 'safe':
				return 'text-green-600';
			case 'flagged':
				return 'text-amber-600';
			case 'blocked':
				return 'text-red-600';
			default:
				return 'text-blue-600';
		}
	}
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	{#if data.error}
		<Alert.Root variant="destructive">
			<Alert.Title>Error Loading Dashboard Data</Alert.Title>
			<Alert.Description>{data.error}</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<!-- Total Messages Card -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<div class="flex items-center gap-2">
					<Card.Title class="text-sm font-medium">Total Messages</Card.Title>
					<Popover.Root>
						<Popover.Trigger>
							<InfoIcon class="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
						</Popover.Trigger>
						<Popover.Content class="w-80">
							<div class="space-y-2">
								<h4 class="leading-none font-medium">Total Messages</h4>
								<p class="text-sm text-muted-foreground">
									The total number of AI chat interactions across all family members. This includes
									all conversations, questions, and responses logged in the system.
								</p>
								<div class="pt-2 text-xs text-muted-foreground">
									<p>• Includes both safe and flagged content</p>
									<p>• Updated in real-time</p>
									<p>• Stored on blockchain for transparency</p>
								</div>
							</div>
						</Popover.Content>
					</Popover.Root>
				</div>
				<MessageSquareIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.totalMessages.toLocaleString()}</div>
				<p class="text-xs text-muted-foreground">All conversations tracked</p>
			</Card.Content>
		</Card.Root>

		<!-- Safe Messages Card -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Safe Messages</Card.Title>
				<ShieldCheckIcon class="h-4 w-4 text-green-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.safeMessages.toLocaleString()}</div>
				<p class="text-xs text-muted-foreground">{data.stats.safetyRate}% safety rate</p>
			</Card.Content>
		</Card.Root>

		<!-- Flagged Messages Card -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<div class="flex items-center gap-2">
					<Card.Title class="text-sm font-medium">Flagged Messages</Card.Title>
					<Popover.Root>
						<Popover.Trigger>
							<InfoIcon class="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
						</Popover.Trigger>
						<Popover.Content class="w-80">
							<div class="space-y-2">
								<h4 class="leading-none font-medium">Flagged Content</h4>
								<p class="text-sm text-muted-foreground">
									Messages that triggered safety alerts based on AI analysis. These are reviewed to
									ensure child safety.
								</p>
								<div class="pt-2 text-xs text-muted-foreground">
									<p><strong>Flag Categories:</strong></p>
									<p>• Inappropriate content</p>
									<p>• Privacy concerns</p>
									<p>• Harmful information</p>
									<p>• Misinformation</p>
								</div>
							</div>
						</Popover.Content>
					</Popover.Root>
				</div>
				<ShieldAlertIcon class="h-4 w-4 text-amber-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{data.stats.flaggedMessages + data.stats.blockedMessages}
				</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.totalMessages > 0
						? (
								((data.stats.flaggedMessages + data.stats.blockedMessages) /
									data.stats.totalMessages) *
								100
							).toFixed(1)
						: 0}% of all messages
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Active Users Card -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Active Users</Card.Title>
				<UsersIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.activeUsers}</div>
				<p class="text-xs text-muted-foreground">Family members</p>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
		<!-- Recent Activity -->
		<Card.Root class="col-span-4">
			<Card.Header>
				<Card.Title>Recent Activity</Card.Title>
				<Card.Description>Latest AI interactions and safety checks</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if data.recentActivity.length > 0}
					<div class="space-y-4">
						{#each data.recentActivity as activity}
							<div class="flex items-start gap-4">
								<div
									class="flex h-9 w-9 items-center justify-center rounded-full {getStatusColor(
										activity.type
									)}"
								>
									<svelte:component
										this={getStatusIcon(activity.type)}
										class="h-4 w-4 {getIconColor(activity.type)}"
									/>
								</div>
								<div class="flex-1 space-y-1">
									<p class="text-sm font-medium">{activity.description}</p>
									<p class="text-xs text-muted-foreground">
										{activity.user_name} - {formatRelativeTime(activity.timestamp)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-8 text-center">
						<ActivityIcon class="mb-2 h-12 w-12 text-muted-foreground" />
						<p class="text-sm text-muted-foreground">No recent activity</p>
						<p class="mt-1 text-xs text-muted-foreground">
							Activity will appear here as users interact with the system
						</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Quick Stats -->
		<Card.Root class="col-span-3">
			<Card.Header>
				<Card.Title>Safety Overview</Card.Title>
				<Card.Description>This week's monitoring summary</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Safety Rate</span>
							<span class="font-medium">{data.stats.safetyRate}%</span>
						</div>
						<Progress value={data.stats.safetyRate} class="mt-2 [&>div]:bg-green-600" />
					</div>
					<div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Monitoring Coverage</span>
							<span class="font-medium">100%</span>
						</div>
						<Progress value={100} class="mt-2 [&>div]:bg-blue-600" />
					</div>
					<div class="space-y-2 pt-4">
						<div class="flex items-center gap-2">
							<ShieldCheckIcon class="h-4 w-4 text-green-600" />
							<span class="text-sm font-medium">System Status</span>
						</div>
						<p class="text-xs text-muted-foreground">
							All messages are being monitored and analyzed in real-time
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<!-- Blockchain Status -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Blockchain Status</Card.Title>
				<Card.Description>On-chain monitoring logs</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Total Logs Stored</span>
						<span class="text-sm font-medium"
							>{data.stats.blockchainStats.totalLogs.toLocaleString()}</span
						>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Last Transaction</span>
						<span class="text-sm font-medium">
							{data.stats.blockchainStats.lastTransaction
								? formatRelativeTime(data.stats.blockchainStats.lastTransaction)
								: 'No transactions yet'}
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Pending</span>
						<span class="text-sm font-medium text-amber-600"
							>{data.stats.blockchainStats.pendingTransactions}</span
						>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Confirmed</span>
						<span class="text-sm font-medium text-green-600"
							>{data.stats.blockchainStats.confirmedTransactions}</span
						>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Quick Actions -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Quick Actions</Card.Title>
				<Card.Description>Common tasks</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-2">
					<a href="/chat" class="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
						<MessageSquareIcon class="h-4 w-4" />
						<span class="text-sm">Start New Chat</span>
					</a>
					<a href="/logs" class="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
						<ActivityIcon class="h-4 w-4" />
						<span class="text-sm">View All Logs</span>
					</a>
					<a href="/family/members" class="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
						<UsersIcon class="h-4 w-4" />
						<span class="text-sm">Manage Family</span>
					</a>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
