<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ServerIcon from '@lucide/svelte/icons/server';
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import DatabaseIcon from '@lucide/svelte/icons/database';
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import SettingsIcon from '@lucide/svelte/icons/settings';

	// Sample admin data
	const systemStats = {
		totalUsers: 125,
		totalFamilies: 28,
		totalMessages: 45234,
		activeConnections: 67,
		systemHealth: 98.5,
		storageUsed: '234 GB',
		uptime: '99.9%'
	};

	const recentAlerts = [
		{
			id: 1,
			severity: 'high',
			message: 'Unusual activity detected in Family ID: 15',
			timestamp: '2024-01-15 14:30:22',
			status: 'investigating'
		},
		{
			id: 2,
			severity: 'medium',
			message: 'Storage threshold reached 80%',
			timestamp: '2024-01-15 12:15:45',
			status: 'resolved'
		},
		{
			id: 3,
			severity: 'low',
			message: 'Scheduled maintenance in 48 hours',
			timestamp: '2024-01-15 09:00:00',
			status: 'scheduled'
		}
	];

	const topFamilies = [
		{ name: 'Doe Family', members: 5, messages: 1234, safetyRate: 95.6 },
		{ name: 'Smith Family', members: 4, messages: 987, safetyRate: 97.2 },
		{ name: 'Johnson Family', members: 6, messages: 856, safetyRate: 94.3 },
		{ name: 'Williams Family', members: 3, messages: 645, safetyRate: 98.1 }
	];
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center gap-2">
		<ShieldAlertIcon class="h-8 w-8 text-amber-600" />
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Admin Panel</h1>
			<p class="text-muted-foreground">System overview, user management, and global settings</p>
		</div>
	</div>

	<!-- System Health Overview -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Users</Card.Title>
				<UsersIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{systemStats.totalUsers}</div>
				<p class="text-xs text-muted-foreground">Across {systemStats.totalFamilies} families</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Messages</Card.Title>
				<ActivityIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{systemStats.totalMessages.toLocaleString()}</div>
				<p class="text-xs text-muted-foreground">All time monitored</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">System Health</Card.Title>
				<ServerIcon class="h-4 w-4 text-green-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{systemStats.systemHealth}%</div>
				<p class="text-xs text-muted-foreground">All systems operational</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Active Users</Card.Title>
				<ActivityIcon class="h-4 w-4 text-blue-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{systemStats.activeConnections}</div>
				<p class="text-xs text-muted-foreground">Currently online</p>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<!-- System Alerts -->
		<Card.Root>
			<Card.Header>
				<Card.Title>System Alerts</Card.Title>
				<Card.Description>Recent system events and notifications</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each recentAlerts as alert}
						<div class="flex items-start gap-4 rounded-lg border p-3">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full {alert.severity ===
								'high'
									? 'bg-red-100'
									: alert.severity === 'medium'
										? 'bg-amber-100'
										: 'bg-blue-100'}"
							>
								<AlertTriangleIcon
									class="h-4 w-4 {alert.severity === 'high'
										? 'text-red-600'
										: alert.severity === 'medium'
											? 'text-amber-600'
											: 'text-blue-600'}"
								/>
							</div>
							<div class="flex-1 space-y-1">
								<p class="text-sm font-medium">{alert.message}</p>
								<div class="flex items-center gap-2">
									<p class="text-xs text-muted-foreground">{alert.timestamp}</p>
									<span
										class="rounded-full px-2 py-0.5 text-xs font-medium {alert.status === 'resolved'
											? 'bg-green-100 text-green-700'
											: alert.status === 'investigating'
												? 'bg-amber-100 text-amber-700'
												: 'bg-blue-100 text-blue-700'}"
									>
										{alert.status}
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- System Resources -->
		<Card.Root>
			<Card.Header>
				<Card.Title>System Resources</Card.Title>
				<Card.Description>Server and storage metrics</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div>
					<div class="mb-2 flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Storage Usage</span>
						<span class="font-medium">{systemStats.storageUsed} / 1 TB</span>
					</div>
					<div class="h-2 w-full rounded-full bg-secondary">
						<div class="h-2 w-[23.4%] rounded-full bg-blue-600"></div>
					</div>
				</div>

				<div>
					<div class="mb-2 flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Uptime</span>
						<span class="font-medium">{systemStats.uptime}</span>
					</div>
					<div class="h-2 w-full rounded-full bg-secondary">
						<div class="h-2 w-[99.9%] rounded-full bg-green-600"></div>
					</div>
				</div>

				<div>
					<div class="mb-2 flex items-center justify-between text-sm">
						<span class="text-muted-foreground">System Health</span>
						<span class="font-medium">{systemStats.systemHealth}%</span>
					</div>
					<div class="h-2 w-full rounded-full bg-secondary">
						<div class="h-2 w-[98.5%] rounded-full bg-green-600"></div>
					</div>
				</div>

				<div class="flex items-center gap-2 rounded-lg bg-green-50 p-3">
					<CheckCircle2Icon class="h-5 w-5 text-green-600" />
					<p class="text-sm font-medium text-green-700">All systems operational</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Top Families -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Top Active Families</Card.Title>
			<Card.Description>Most active families on the platform</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				{#each topFamilies as family, index}
					<div class="flex items-center justify-between rounded-lg border p-4">
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700"
							>
								#{index + 1}
							</div>
							<div>
								<p class="font-medium">{family.name}</p>
								<p class="text-xs text-muted-foreground">{family.members} members</p>
							</div>
						</div>
						<div class="flex gap-6 text-sm">
							<div>
								<p class="text-muted-foreground">Messages</p>
								<p class="font-semibold">{family.messages}</p>
							</div>
							<div>
								<p class="text-muted-foreground">Safety Rate</p>
								<p class="font-semibold text-green-600">{family.safetyRate}%</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Admin Actions -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Admin Actions</Card.Title>
			<Card.Description>System management and configuration</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4 md:grid-cols-3">
				<Button variant="outline" class="h-20 flex-col gap-2">
					<UsersIcon class="h-6 w-6" />
					<span>Manage All Users</span>
				</Button>
				<Button variant="outline" class="h-20 flex-col gap-2">
					<DatabaseIcon class="h-6 w-6" />
					<span>Database Backup</span>
				</Button>
				<Button variant="outline" class="h-20 flex-col gap-2">
					<SettingsIcon class="h-6 w-6" />
					<span>System Config</span>
				</Button>
				<Button variant="outline" class="h-20 flex-col gap-2">
					<ActivityIcon class="h-6 w-6" />
					<span>View Audit Logs</span>
				</Button>
				<Button variant="outline" class="h-20 flex-col gap-2">
					<TrendingUpIcon class="h-6 w-6" />
					<span>Platform Analytics</span>
				</Button>
				<Button variant="outline" class="h-20 flex-col gap-2">
					<ServerIcon class="h-6 w-6" />
					<span>Server Monitoring</span>
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Access Control Warning -->
	<Card.Root class="border-amber-200 bg-amber-50">
		<Card.Content class="flex items-start gap-3 p-4">
			<AlertTriangleIcon class="h-5 w-5 text-amber-600" />
			<div class="space-y-1">
				<p class="text-sm font-medium text-amber-900">Admin Access Notice</p>
				<p class="text-xs text-amber-800">
					You are viewing sensitive system information. All actions are logged and monitored for
					security purposes.
				</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
