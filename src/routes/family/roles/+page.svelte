<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import CrownIcon from '@lucide/svelte/icons/crown';
	import UserIcon from '@lucide/svelte/icons/user';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';

	// Role definitions
	const roles = [
		{
			name: 'Parent/Admin',
			icon: CrownIcon,
			description: 'Full access to all features and family management',
			color: 'amber',
			permissions: [
				{ name: 'View all family activity', granted: true },
				{ name: 'Manage family members', granted: true },
				{ name: 'Configure monitoring settings', granted: true },
				{ name: 'Access analytics and reports', granted: true },
				{ name: 'Manage blockchain wallet', granted: true },
				{ name: 'View and export logs', granted: true },
				{ name: 'Modify smart contracts', granted: true },
				{ name: 'Invite new members', granted: true }
			]
		},
		{
			name: 'Child/Member',
			icon: UserIcon,
			description: 'Monitored account with limited access',
			color: 'blue',
			permissions: [
				{ name: 'View all family activity', granted: false },
				{ name: 'Manage family members', granted: false },
				{ name: 'Configure monitoring settings', granted: false },
				{ name: 'Access analytics and reports', granted: false },
				{ name: 'Manage blockchain wallet', granted: false },
				{ name: 'View and export logs', granted: false },
				{ name: 'Modify smart contracts', granted: false },
				{ name: 'Invite new members', granted: false }
			]
		}
	];
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
			<p class="text-muted-foreground">Assign roles and manage permissions for family members</p>
		</div>
	</div>

	<!-- Role Overview -->
	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Parent/Admin Roles</Card.Title>
				<CrownIcon class="h-4 w-4 text-amber-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">1</div>
				<p class="text-xs text-muted-foreground">Full access granted</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Child/Member Roles</Card.Title>
				<UserIcon class="h-4 w-4 text-blue-600" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">4</div>
				<p class="text-xs text-muted-foreground">Monitored accounts</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Role Comparison -->
	<div class="space-y-4">
		{#each roles as role}
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-3">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-lg {role.color === 'amber'
								? 'bg-amber-100'
								: 'bg-blue-100'}"
						>
							<svelte:component
								this={role.icon}
								class="h-6 w-6 {role.color === 'amber' ? 'text-amber-600' : 'text-blue-600'}"
							/>
						</div>
						<div>
							<Card.Title>{role.name}</Card.Title>
							<Card.Description>{role.description}</Card.Description>
						</div>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3">
						<h4 class="text-sm font-semibold">Permissions</h4>
						<div class="grid gap-2">
							{#each role.permissions as permission}
								<div class="flex items-center justify-between rounded-lg border p-3">
									<span class="text-sm">{permission.name}</span>
									{#if permission.granted}
										<div class="flex items-center gap-2">
											<span class="text-xs font-medium text-green-600">Granted</span>
											<CheckIcon class="h-4 w-4 text-green-600" />
										</div>
									{:else}
										<div class="flex items-center gap-2">
											<span class="text-xs font-medium text-red-600">Denied</span>
											<XIcon class="h-4 w-4 text-red-600" />
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Assign Roles -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Assign Role to Member</Card.Title>
			<Card.Description>Change the role of a family member</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="space-y-2">
					<label class="text-sm font-medium">Select Member</label>
					<select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
						<option>Emma Doe (Child/Member)</option>
						<option>Alex Doe (Child/Member)</option>
						<option>Sarah Doe (Child/Member)</option>
						<option>Tom Doe (Child/Member)</option>
					</select>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">New Role</label>
					<select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
						<option value="child">Child/Member (Monitored)</option>
						<option value="parent">Parent/Admin (Full Access)</option>
					</select>
				</div>
				<div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
					<p class="text-sm text-amber-800">
						<strong>Warning:</strong> Changing a member to Parent/Admin will grant them full access to
						all family data and settings. This action cannot be undone automatically.
					</p>
				</div>
				<Button class="w-full">
					<ShieldIcon class="mr-2 h-4 w-4" />
					Update Role
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Custom Permissions (Future Feature) -->
	<Card.Root class="opacity-60">
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title>Custom Permissions</Card.Title>
					<Card.Description>Create custom roles with specific permissions</Card.Description>
				</div>
				<span class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
					Coming Soon
				</span>
			</div>
		</Card.Header>
		<Card.Content>
			<p class="text-sm text-muted-foreground">
				Fine-grained permission control will be available in a future update, allowing you to create
				custom roles with specific access levels.
			</p>
		</Card.Content>
	</Card.Root>
</div>
