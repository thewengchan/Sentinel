<script lang="ts">
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
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
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
				<div class="text-2xl font-bold">1,234</div>
				<p class="text-xs text-muted-foreground">+20% from last month</p>
			</Card.Content>
		</Card.Root>

		<!-- Safe Messages Card -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Safe Messages</Card.Title>
				<ShieldCheckIcon class="h-4 w-4 text-green-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">1,180</div>
				<p class="text-xs text-muted-foreground">95.6% safety rate</p>
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
				<div class="text-2xl font-bold">54</div>
				<p class="text-xs text-muted-foreground">4.4% of all messages</p>
			</Card.Content>
		</Card.Root>

		<!-- Active Users Card -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Active Users</Card.Title>
				<UsersIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">5</div>
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
				<div class="space-y-4">
					<div class="flex items-start gap-4">
						<div class="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
							<ShieldCheckIcon class="h-4 w-4 text-green-600" />
						</div>
						<div class="flex-1 space-y-1">
							<p class="text-sm font-medium">Safe conversation detected</p>
							<p class="text-xs text-muted-foreground">
								Emma asked about homework help - 2 mins ago
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
							<ShieldAlertIcon class="h-4 w-4 text-amber-600" />
						</div>
						<div class="flex-1 space-y-1">
							<p class="text-sm font-medium">Content flagged for review</p>
							<p class="text-xs text-muted-foreground">
								Alex's chat contained sensitive topics - 15 mins ago
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
							<ShieldCheckIcon class="h-4 w-4 text-green-600" />
						</div>
						<div class="flex-1 space-y-1">
							<p class="text-sm font-medium">Safe conversation detected</p>
							<p class="text-xs text-muted-foreground">
								Sarah discussed science project - 1 hour ago
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
							<ActivityIcon class="h-4 w-4 text-blue-600" />
						</div>
						<div class="flex-1 space-y-1">
							<p class="text-sm font-medium">New family member added</p>
							<p class="text-xs text-muted-foreground">Tom joined the family - 3 hours ago</p>
						</div>
					</div>
				</div>
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
							<span class="font-medium">95.6%</span>
						</div>
						<Progress value={95.6} class="mt-2 [&>div]:bg-green-600" />
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
							<TrendingUpIcon class="h-4 w-4 text-green-600" />
							<span class="text-sm font-medium">Improvement this week</span>
						</div>
						<p class="text-xs text-muted-foreground">
							10% reduction in flagged content compared to last week
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
						<span class="text-sm font-medium">1,234</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Last Transaction</span>
						<span class="text-sm font-medium">2 mins ago</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Network Status</span>
						<span class="text-sm font-medium text-green-600">Active</span>
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
