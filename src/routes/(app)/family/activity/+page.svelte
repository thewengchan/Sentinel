<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import CalendarIcon from '@lucide/svelte/icons/calendar';

	// Sample activity data
	const activities = [
		{
			id: 1,
			user: 'Emma',
			action: 'chat_message',
			description: 'Asked about math homework',
			status: 'safe',
			timestamp: '2024-01-15 14:23:45',
			details: 'Topic: Education, Response: Helpful guidance provided'
		},
		{
			id: 2,
			user: 'Alex',
			action: 'flagged_content',
			description: 'Inappropriate content request',
			status: 'flagged',
			timestamp: '2024-01-15 14:15:32',
			details: 'Content was blocked and parents were notified'
		},
		{
			id: 3,
			user: 'Sarah',
			action: 'chat_message',
			description: 'Discussed science project',
			status: 'safe',
			timestamp: '2024-01-15 13:45:12',
			details: 'Topic: Science, Response: Educational support provided'
		},
		{
			id: 4,
			user: 'Tom',
			action: 'member_joined',
			description: 'Joined the family',
			status: 'info',
			timestamp: '2024-01-15 11:20:10',
			details: 'New family member added with member role'
		},
		{
			id: 5,
			user: 'Emma',
			action: 'chat_message',
			description: 'Asked about book recommendations',
			status: 'safe',
			timestamp: '2024-01-15 10:30:22',
			details: 'Topic: Literature, Response: Age-appropriate suggestions'
		}
	];
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Family Activity</h1>
			<p class="text-muted-foreground">See all family members' chat activity and interactions</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm">
				<CalendarIcon class="mr-2 h-4 w-4" />
				Today
			</Button>
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

	<!-- Activity Stats -->
	<div class="grid gap-4 md:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Activities</Card.Title>
				<ActivityIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">248</div>
				<p class="text-xs text-muted-foreground">Last 24 hours</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Messages Sent</Card.Title>
				<MessageSquareIcon class="h-4 w-4 text-blue-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">235</div>
				<p class="text-xs text-muted-foreground">Across all members</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Safe Interactions</Card.Title>
				<ShieldCheckIcon class="h-4 w-4 text-green-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">227</div>
				<p class="text-xs text-muted-foreground">96.6% safety rate</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Flagged Items</Card.Title>
				<ShieldAlertIcon class="h-4 w-4 text-amber-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">8</div>
				<p class="text-xs text-muted-foreground">Requiring attention</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Filter by Member -->
	<Card.Root>
		<Card.Content class="p-4">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">Filter by member:</span>
				<Button variant="outline" size="sm">All Members</Button>
				<Button variant="ghost" size="sm">Emma</Button>
				<Button variant="ghost" size="sm">Alex</Button>
				<Button variant="ghost" size="sm">Sarah</Button>
				<Button variant="ghost" size="sm">Tom</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Activity Timeline -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Activity Timeline</Card.Title>
			<Card.Description>Real-time activity feed for all family members</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				{#each activities as activity}
					<div
						class="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
					>
						<div class="flex flex-1 items-start gap-4">
							<!-- Icon based on activity type -->
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full {activity.status ===
								'safe'
									? 'bg-green-100'
									: activity.status === 'flagged'
										? 'bg-amber-100'
										: 'bg-blue-100'}"
							>
								{#if activity.action === 'chat_message'}
									<MessageSquareIcon
										class="h-5 w-5 {activity.status === 'safe'
											? 'text-green-600'
											: 'text-blue-600'}"
									/>
								{:else if activity.action === 'flagged_content'}
									<ShieldAlertIcon class="h-5 w-5 text-amber-600" />
								{:else}
									<ActivityIcon class="h-5 w-5 text-blue-600" />
								{/if}
							</div>

							<div class="flex-1 space-y-2">
								<div class="flex flex-wrap items-center gap-2">
									<span class="font-semibold">{activity.user}</span>
									<span class="text-sm text-muted-foreground">•</span>
									<span class="text-sm">{activity.description}</span>
									{#if activity.status === 'safe'}
										<Badge variant="default" class="bg-green-100 text-green-700 hover:bg-green-100">
											<ShieldCheckIcon class="mr-1 h-3 w-3" />
											Safe
										</Badge>
									{:else if activity.status === 'flagged'}
										<Badge variant="default" class="bg-amber-100 text-amber-700 hover:bg-amber-100">
											<ShieldAlertIcon class="mr-1 h-3 w-3" />
											Flagged
										</Badge>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground">{activity.details}</p>
								<div class="flex items-center gap-2 text-xs text-muted-foreground">
									<ClockIcon class="h-3 w-3" />
									<span>{activity.timestamp}</span>
								</div>
							</div>
						</div>
						<Button variant="ghost" size="sm">View Details</Button>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Activity Summary by Member -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Today's Activity by Member</Card.Title>
			<Card.Description>Individual activity breakdown</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="flex items-center justify-between rounded-lg border p-4">
					<div class="flex items-center gap-4">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700"
						>
							E
						</div>
						<div>
							<p class="font-medium">Emma</p>
							<p class="text-xs text-muted-foreground">Most active today</p>
						</div>
					</div>
					<div class="flex gap-6 text-sm">
						<div>
							<p class="text-muted-foreground">Messages</p>
							<p class="font-semibold">67</p>
						</div>
						<div>
							<p class="text-muted-foreground">Safe</p>
							<p class="font-semibold text-green-600">65</p>
						</div>
						<div>
							<p class="text-muted-foreground">Flagged</p>
							<p class="font-semibold text-amber-600">2</p>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg border p-4">
					<div class="flex items-center gap-4">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700"
						>
							A
						</div>
						<div>
							<p class="font-medium">Alex</p>
							<p class="text-xs text-muted-foreground">Active</p>
						</div>
					</div>
					<div class="flex gap-6 text-sm">
						<div>
							<p class="text-muted-foreground">Messages</p>
							<p class="font-semibold">54</p>
						</div>
						<div>
							<p class="text-muted-foreground">Safe</p>
							<p class="font-semibold text-green-600">50</p>
						</div>
						<div>
							<p class="text-muted-foreground">Flagged</p>
							<p class="font-semibold text-amber-600">4</p>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg border p-4">
					<div class="flex items-center gap-4">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700"
						>
							S
						</div>
						<div>
							<p class="font-medium">Sarah</p>
							<p class="text-xs text-muted-foreground">Active</p>
						</div>
					</div>
					<div class="flex gap-6 text-sm">
						<div>
							<p class="text-muted-foreground">Messages</p>
							<p class="font-semibold">89</p>
						</div>
						<div>
							<p class="text-muted-foreground">Safe</p>
							<p class="font-semibold text-green-600">88</p>
						</div>
						<div>
							<p class="text-muted-foreground">Flagged</p>
							<p class="font-semibold text-amber-600">1</p>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg border p-4 opacity-60">
					<div class="flex items-center gap-4">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700"
						>
							T
						</div>
						<div>
							<p class="font-medium">Tom</p>
							<p class="text-xs text-muted-foreground">No activity</p>
						</div>
					</div>
					<div class="flex gap-6 text-sm">
						<div>
							<p class="text-muted-foreground">Messages</p>
							<p class="font-semibold">0</p>
						</div>
						<div>
							<p class="text-muted-foreground">Safe</p>
							<p class="font-semibold">0</p>
						</div>
						<div>
							<p class="text-muted-foreground">Flagged</p>
							<p class="font-semibold">0</p>
						</div>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
