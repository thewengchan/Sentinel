<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import BarChartIcon from '@lucide/svelte/icons/bar-chart';
	import PieChartIcon from '@lucide/svelte/icons/pie-chart';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import DownloadIcon from '@lucide/svelte/icons/download';
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Analytics</h1>
			<p class="text-muted-foreground">Safety metrics, reports, and insights</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm">
				<CalendarIcon class="mr-2 h-4 w-4" />
				Last 30 Days
			</Button>
			<Button variant="outline" size="sm">
				<DownloadIcon class="mr-2 h-4 w-4" />
				Export Report
			</Button>
		</div>
	</div>

	<!-- Key Metrics -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Safety Score</Card.Title>
				<BarChartIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">95.6%</div>
				<div class="flex items-center gap-1 text-xs text-green-600">
					<TrendingUpIcon class="h-3 w-3" />
					<span>+2.3% from last month</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Avg Response Time</Card.Title>
				<BarChartIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">1.2s</div>
				<div class="flex items-center gap-1 text-xs text-green-600">
					<TrendingDownIcon class="h-3 w-3" />
					<span>-0.3s improvement</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Daily Active Users</Card.Title>
				<PieChartIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">4.8</div>
				<div class="flex items-center gap-1 text-xs text-muted-foreground">
					<span>Average per day</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Flagged Rate</Card.Title>
				<BarChartIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">4.4%</div>
				<div class="flex items-center gap-1 text-xs text-green-600">
					<TrendingDownIcon class="h-3 w-3" />
					<span>-1.2% improvement</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<!-- Safety Trends Chart Placeholder -->
		<Card.Root class="col-span-1">
			<Card.Header>
				<Card.Title>Safety Trends</Card.Title>
				<Card.Description>Daily safety metrics over time</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
					<div class="text-center">
						<BarChartIcon class="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
						<p class="text-sm text-muted-foreground">Chart visualization placeholder</p>
						<p class="mt-1 text-xs text-muted-foreground">Integrate with charting library</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Category Breakdown -->
		<Card.Root class="col-span-1">
			<Card.Header>
				<Card.Title>Flag Categories</Card.Title>
				<Card.Description>Breakdown of flagged content types</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<div>
						<div class="mb-2 flex items-center justify-between text-sm">
							<span>Inappropriate Content</span>
							<span class="font-medium">45%</span>
						</div>
						<div class="h-2 w-full rounded-full bg-secondary">
							<div class="h-2 w-[45%] rounded-full bg-amber-600"></div>
						</div>
					</div>
					<div>
						<div class="mb-2 flex items-center justify-between text-sm">
							<span>Privacy Concerns</span>
							<span class="font-medium">30%</span>
						</div>
						<div class="h-2 w-full rounded-full bg-secondary">
							<div class="h-2 w-[30%] rounded-full bg-orange-600"></div>
						</div>
					</div>
					<div>
						<div class="mb-2 flex items-center justify-between text-sm">
							<span>Misinformation</span>
							<span class="font-medium">15%</span>
						</div>
						<div class="h-2 w-full rounded-full bg-secondary">
							<div class="h-2 w-[15%] rounded-full bg-yellow-600"></div>
						</div>
					</div>
					<div>
						<div class="mb-2 flex items-center justify-between text-sm">
							<span>Other</span>
							<span class="font-medium">10%</span>
						</div>
						<div class="h-2 w-full rounded-full bg-secondary">
							<div class="h-2 w-[10%] rounded-full bg-gray-600"></div>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- User Activity Breakdown -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Family Member Activity</Card.Title>
			<Card.Description>Message count and safety metrics per user</Card.Description>
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
							<p class="text-xs text-muted-foreground">Child</p>
						</div>
					</div>
					<div class="flex gap-8 text-sm">
						<div>
							<p class="text-muted-foreground">Messages</p>
							<p class="font-semibold">342</p>
						</div>
						<div>
							<p class="text-muted-foreground">Safety Rate</p>
							<p class="font-semibold text-green-600">97.2%</p>
						</div>
						<div>
							<p class="text-muted-foreground">Flagged</p>
							<p class="font-semibold text-amber-600">10</p>
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
							<p class="text-xs text-muted-foreground">Child</p>
						</div>
					</div>
					<div class="flex gap-8 text-sm">
						<div>
							<p class="text-muted-foreground">Messages</p>
							<p class="font-semibold">289</p>
						</div>
						<div>
							<p class="text-muted-foreground">Safety Rate</p>
							<p class="font-semibold text-green-600">93.8%</p>
						</div>
						<div>
							<p class="text-muted-foreground">Flagged</p>
							<p class="font-semibold text-amber-600">18</p>
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
							<p class="text-xs text-muted-foreground">Child</p>
						</div>
					</div>
					<div class="flex gap-8 text-sm">
						<div>
							<p class="text-muted-foreground">Messages</p>
							<p class="font-semibold">421</p>
						</div>
						<div>
							<p class="text-muted-foreground">Safety Rate</p>
							<p class="font-semibold text-green-600">98.1%</p>
						</div>
						<div>
							<p class="text-muted-foreground">Flagged</p>
							<p class="font-semibold text-amber-600">8</p>
						</div>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
