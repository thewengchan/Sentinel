<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import BarChartIcon from '@lucide/svelte/icons/bar-chart';
	import PieChartIcon from '@lucide/svelte/icons/pie-chart';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import DownloadIcon from '@lucide/svelte/icons/download';

	export let data: PageData;
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	{#if data.error}
		<Alert.Root variant="destructive">
			<Alert.Title>Error Loading Analytics Data</Alert.Title>
			<Alert.Description>{data.error}</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Analytics</h1>
			<p class="text-muted-foreground">Safety metrics, reports, and insights</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm">
				<CalendarIcon class="mr-2 h-4 w-4" />
				Last {data.timeRange} Days
			</Button>
			<Button variant="outline" size="sm">
				<DownloadIcon class="mr-2 h-4 w-4" />
				Export Report
			</Button>
		</div>
	</div>

	<Tabs.Root value="categories">
		<Tabs.Content value="categories" class="mt-4">
			<!-- Key Metrics -->
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Safety Score</Card.Title>
						<BarChartIcon class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{data.safetyScore}%</div>
						<div
							class="flex items-center gap-1 text-xs {data.safetyScore >= 95
								? 'text-green-600'
								: 'text-amber-600'}"
						>
							{#if data.safetyScore >= 95}
								<TrendingUpIcon class="h-3 w-3" />
								<span>Excellent safety rate</span>
							{:else}
								<TrendingDownIcon class="h-3 w-3" />
								<span>Needs attention</span>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Avg Response Time</Card.Title>
						<BarChartIcon class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{data.avgResponseTime}s</div>
						<div class="flex items-center gap-1 text-xs text-muted-foreground">
							<span>AI processing time</span>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Daily Active Users</Card.Title>
						<PieChartIcon class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{data.dailyActiveUsers}</div>
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
						<div class="text-2xl font-bold">{data.flaggedRate}%</div>
						<div
							class="flex items-center gap-1 text-xs {data.flaggedRate <= 5
								? 'text-green-600'
								: 'text-amber-600'}"
						>
							{#if data.flaggedRate <= 5}
								<TrendingDownIcon class="h-3 w-3" />
								<span>Low flagged content</span>
							{:else}
								<TrendingUpIcon class="h-3 w-3" />
								<span>Higher than target</span>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="categories" class="mt-4">
			<div class="grid gap-4 md:grid-cols-2">
				<!-- Safety Trends Chart Placeholder -->
				<Card.Root class="col-span-1">
					<Card.Header>
						<Card.Title>Safety Trends</Card.Title>
						<Card.Description>Daily safety metrics over time</Card.Description>
					</Card.Header>
					<Card.Content>
						<div
							class="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed"
						>
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
						{#if data.categoryBreakdown.length > 0}
							<div class="space-y-4">
								{#each data.categoryBreakdown as category}
									<div>
										<div class="mb-2 flex items-center justify-between text-sm">
											<span class="capitalize">{category.category}</span>
											<span class="font-medium">{category.percentage.toFixed(1)}%</span>
										</div>
										<Progress value={category.percentage} class="[&>div]:bg-amber-600" />
									</div>
								{/each}
							</div>
						{:else}
							<div class="flex flex-col items-center justify-center py-8 text-center">
								<PieChartIcon class="mb-2 h-12 w-12 text-muted-foreground" />
								<p class="text-sm text-muted-foreground">No flagged content</p>
								<p class="mt-1 text-xs text-muted-foreground">All messages are safe</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="users" class="mt-4">
			<!-- User Activity Breakdown -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Family Member Activity</Card.Title>
					<Card.Description>Message count and safety metrics per user</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if data.userActivity.length > 0}
						<div class="space-y-4">
							{#each data.userActivity as user, index}
								<div class="flex items-center justify-between rounded-lg border p-4">
									<div class="flex items-center gap-4">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full {index % 4 ===
											0
												? 'bg-blue-100 text-blue-700'
												: index % 4 === 1
													? 'bg-green-100 text-green-700'
													: index % 4 === 2
														? 'bg-purple-100 text-purple-700'
														: 'bg-orange-100 text-orange-700'} font-semibold"
										>
											{user.user_name.charAt(0).toUpperCase()}
										</div>
										<div>
											<p class="font-medium">{user.user_name}</p>
											<p class="text-xs text-muted-foreground">Member</p>
										</div>
									</div>
									<div class="flex gap-8 text-sm">
										<div>
											<p class="text-muted-foreground">Messages</p>
											<p class="font-semibold">{user.messages.toLocaleString()}</p>
										</div>
										<div>
											<p class="text-muted-foreground">Safety Rate</p>
											<p
												class="font-semibold {user.safetyRate >= 95
													? 'text-green-600'
													: user.safetyRate >= 90
														? 'text-amber-600'
														: 'text-red-600'}"
											>
												{user.safetyRate}%
											</p>
										</div>
										<div>
											<p class="text-muted-foreground">Flagged</p>
											<p class="font-semibold text-amber-600">{user.flaggedCount}</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center py-12 text-center">
							<BarChartIcon class="mb-4 h-16 w-16 text-muted-foreground" />
							<p class="text-lg font-medium">No user activity yet</p>
							<p class="mt-2 text-sm text-muted-foreground">
								User activity will appear here as members use the system
							</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="trends" class="mt-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>Trends & Patterns</Card.Title>
					<Card.Description>Historical data and trend analysis</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
						<div class="text-center">
							<BarChartIcon class="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
							<p class="text-sm text-muted-foreground">Trends chart placeholder</p>
							<p class="mt-1 text-xs text-muted-foreground">
								Integrate with charting library for historical data
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
