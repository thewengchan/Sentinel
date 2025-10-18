<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import UsersIcon from '@lucide/svelte/icons/users';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import MailIcon from '@lucide/svelte/icons/mail';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import MoreVerticalIcon from '@lucide/svelte/icons/more-vertical';
	import CrownIcon from '@lucide/svelte/icons/crown';

	// Sample family members data
	const members = [
		{
			id: 1,
			name: 'John Doe',
			email: 'john@example.com',
			role: 'parent',
			avatar: null,
			status: 'active',
			joinDate: '2024-01-01',
			messagesCount: 156,
			safetyRate: 100,
			flaggedCount: 0
		},
		{
			id: 2,
			name: 'Emma Doe',
			email: 'emma@example.com',
			role: 'child',
			avatar: null,
			status: 'active',
			joinDate: '2024-01-05',
			messagesCount: 342,
			safetyRate: 97.2,
			flaggedCount: 10
		},
		{
			id: 3,
			name: 'Alex Doe',
			email: 'alex@example.com',
			role: 'child',
			avatar: null,
			status: 'active',
			joinDate: '2024-01-05',
			messagesCount: 289,
			safetyRate: 93.8,
			flaggedCount: 18
		},
		{
			id: 4,
			name: 'Sarah Doe',
			email: 'sarah@example.com',
			role: 'child',
			avatar: null,
			status: 'active',
			joinDate: '2024-01-10',
			messagesCount: 421,
			safetyRate: 98.1,
			flaggedCount: 8
		},
		{
			id: 5,
			name: 'Tom Doe',
			email: 'tom@example.com',
			role: 'child',
			avatar: null,
			status: 'pending',
			joinDate: '2024-01-15',
			messagesCount: 0,
			safetyRate: 0,
			flaggedCount: 0
		}
	];
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Family Members</h1>
			<p class="text-muted-foreground">View and manage your family members</p>
		</div>
		<Button>
			<UserPlusIcon class="mr-2 h-4 w-4" />
			Invite Member
		</Button>
	</div>

	<!-- Family Stats -->
	<div class="grid gap-4 md:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Members</Card.Title>
				<UsersIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">5</div>
				<p class="text-xs text-muted-foreground">4 active, 1 pending</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Parents/Admins</Card.Title>
				<CrownIcon class="h-4 w-4 text-amber-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">1</div>
				<p class="text-xs text-muted-foreground">Full access</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Children</Card.Title>
				<UsersIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">4</div>
				<p class="text-xs text-muted-foreground">Monitored accounts</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Avg Safety Rate</Card.Title>
				<ShieldCheckIcon class="h-4 w-4 text-green-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">96.3%</div>
				<p class="text-xs text-muted-foreground">Across all members</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Members List -->
	<div class="space-y-4">
		{#each members as member}
			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex items-start justify-between gap-4">
						<div class="flex flex-1 items-start gap-4">
							<div
								class="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold {member.role ===
								'parent'
									? 'bg-amber-100 text-amber-700'
									: 'bg-blue-100 text-blue-700'}"
							>
								{member.name.charAt(0)}
							</div>
							<div class="flex-1 space-y-3">
								<div>
									<div class="flex items-center gap-2">
										<h3 class="text-lg font-semibold">{member.name}</h3>
										{#if member.role === 'parent'}
											<span
												class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
											>
												<CrownIcon class="h-3 w-3" />
												Parent
											</span>
										{:else}
											<span
												class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
											>
												Member
											</span>
										{/if}
										{#if member.status === 'pending'}
											<span
												class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
											>
												Pending
											</span>
										{/if}
									</div>
									<div class="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
										<MailIcon class="h-3 w-3" />
										<span>{member.email}</span>
									</div>
								</div>

								{#if member.status === 'active'}
									<div class="grid grid-cols-4 gap-4 pt-2">
										<div class="space-y-1">
											<p class="text-xs text-muted-foreground">Messages</p>
											<p class="text-lg font-semibold">{member.messagesCount}</p>
										</div>
										<div class="space-y-1">
											<p class="text-xs text-muted-foreground">Safety Rate</p>
											<p
												class="text-lg font-semibold {member.safetyRate >= 95
													? 'text-green-600'
													: member.safetyRate >= 90
														? 'text-amber-600'
														: 'text-red-600'}"
											>
												{member.safetyRate}%
											</p>
										</div>
										<div class="space-y-1">
											<p class="text-xs text-muted-foreground">Flagged</p>
											<p class="text-lg font-semibold text-amber-600">{member.flaggedCount}</p>
										</div>
										<div class="space-y-1">
											<p class="text-xs text-muted-foreground">Member Since</p>
											<p class="text-sm font-medium">{member.joinDate}</p>
										</div>
									</div>
								{:else}
									<div
										class="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3"
									>
										<ShieldAlertIcon class="h-4 w-4 text-amber-600" />
										<p class="text-sm text-amber-700">
											Invitation pending - Member hasn't accepted yet
										</p>
									</div>
								{/if}

								<div class="flex gap-2 pt-2">
									<Button variant="outline" size="sm">View Activity</Button>
									{#if member.role !== 'parent'}
										<Button variant="outline" size="sm">Manage Permissions</Button>
									{/if}
									{#if member.status === 'pending'}
										<Button variant="outline" size="sm">Resend Invitation</Button>
									{/if}
								</div>
							</div>
						</div>
						<Button variant="ghost" size="sm">
							<MoreVerticalIcon class="h-4 w-4" />
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Invite New Member Card -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Invite New Family Member</Card.Title>
			<Card.Description>Add someone to your family monitoring group</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<label class="text-sm font-medium">Name</label>
						<input
							type="text"
							placeholder="Full name"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>
					<div class="space-y-2">
						<label class="text-sm font-medium">Email Address</label>
						<input
							type="email"
							placeholder="email@example.com"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">Role</label>
					<select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
						<option value="child">Child/Member (Monitored)</option>
						<option value="parent">Parent/Admin (Full Access)</option>
					</select>
				</div>
				<Button class="w-full">
					<MailIcon class="mr-2 h-4 w-4" />
					Send Invitation
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
