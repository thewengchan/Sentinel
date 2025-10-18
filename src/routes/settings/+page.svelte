<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import UserIcon from '@lucide/svelte/icons/user';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import KeyIcon from '@lucide/svelte/icons/key';
	import DatabaseIcon from '@lucide/svelte/icons/database';
	import GlobeIcon from '@lucide/svelte/icons/globe';
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Settings</h1>
		<p class="text-muted-foreground">
			Manage your preferences, notifications, and privacy settings
		</p>
	</div>

	<!-- Profile Settings -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<UserIcon class="h-5 w-5" />
				<Card.Title>Profile Settings</Card.Title>
			</div>
			<Card.Description>Update your personal information</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<label class="text-sm font-medium">Full Name</label>
					<input
						type="text"
						value="John Doe"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">Email Address</label>
					<input
						type="email"
						value="john@example.com"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					/>
				</div>
			</div>
			<div class="space-y-2">
				<label class="text-sm font-medium">Avatar URL</label>
				<input
					type="text"
					value="/avatars/user.jpg"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				/>
			</div>
			<Button>Save Changes</Button>
		</Card.Content>
	</Card.Root>

	<!-- Notification Settings -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<BellIcon class="h-5 w-5" />
				<Card.Title>Notification Settings</Card.Title>
			</div>
			<Card.Description>Configure how you want to be notified</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Flagged Content Alerts</p>
					<p class="text-xs text-muted-foreground">Get notified when content is flagged</p>
				</div>
				<input type="checkbox" checked class="h-4 w-4" />
			</div>
			<Separator.Root />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Daily Summary</p>
					<p class="text-xs text-muted-foreground">Receive daily activity summaries</p>
				</div>
				<input type="checkbox" checked class="h-4 w-4" />
			</div>
			<Separator.Root />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">New Family Member</p>
					<p class="text-xs text-muted-foreground">Alert when someone joins your family</p>
				</div>
				<input type="checkbox" checked class="h-4 w-4" />
			</div>
			<Separator.Root />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Blockchain Transactions</p>
					<p class="text-xs text-muted-foreground">Notify on blockchain activity</p>
				</div>
				<input type="checkbox" class="h-4 w-4" />
			</div>
			<Separator.Root />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Email Notifications</p>
					<p class="text-xs text-muted-foreground">Send notifications to your email</p>
				</div>
				<input type="checkbox" checked class="h-4 w-4" />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Security Settings -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<ShieldIcon class="h-5 w-5" />
				<Card.Title>Security Settings</Card.Title>
			</div>
			<Card.Description>Manage your account security</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium">Change Password</label>
				<input
					type="password"
					placeholder="Current password"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				/>
				<input
					type="password"
					placeholder="New password"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				/>
				<input
					type="password"
					placeholder="Confirm new password"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				/>
			</div>
			<Button>Update Password</Button>
			<Separator.Root class="my-4" />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Two-Factor Authentication</p>
					<p class="text-xs text-muted-foreground">Add an extra layer of security</p>
				</div>
				<Button variant="outline" size="sm">Enable</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Monitoring Settings -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<DatabaseIcon class="h-5 w-5" />
				<Card.Title>Monitoring Settings</Card.Title>
			</div>
			<Card.Description>Configure AI monitoring preferences</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium">Sensitivity Level</label>
				<select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
					<option>Low - Basic filtering</option>
					<option selected>Medium - Balanced protection</option>
					<option>High - Strict monitoring</option>
				</select>
			</div>
			<Separator.Root />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Auto-Block Harmful Content</p>
					<p class="text-xs text-muted-foreground">Automatically block detected harmful content</p>
				</div>
				<input type="checkbox" checked class="h-4 w-4" />
			</div>
			<Separator.Root />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Store Logs on Blockchain</p>
					<p class="text-xs text-muted-foreground">Save all logs to blockchain for transparency</p>
				</div>
				<input type="checkbox" checked class="h-4 w-4" />
			</div>
			<Separator.Root />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">AI Model Selection</p>
					<p class="text-xs text-muted-foreground">Choose the AI model for monitoring</p>
				</div>
				<select class="rounded-md border border-input bg-background px-3 py-1 text-sm">
					<option>GPT-4</option>
					<option selected>GPT-4 Turbo</option>
					<option>Claude 3</option>
				</select>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Privacy Settings -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<KeyIcon class="h-5 w-5" />
				<Card.Title>Privacy Settings</Card.Title>
			</div>
			<Card.Description>Control your data and privacy</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Analytics Collection</p>
					<p class="text-xs text-muted-foreground">Help improve the app with usage data</p>
				</div>
				<input type="checkbox" checked class="h-4 w-4" />
			</div>
			<Separator.Root />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Share Data for Research</p>
					<p class="text-xs text-muted-foreground">Anonymized data for AI safety research</p>
				</div>
				<input type="checkbox" class="h-4 w-4" />
			</div>
			<Separator.Root />
			<div class="space-y-2">
				<Button variant="outline" class="w-full">Download My Data</Button>
				<Button variant="outline" class="w-full text-red-600 hover:text-red-700">
					Delete My Account
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Appearance Settings -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<PaletteIcon class="h-5 w-5" />
				<Card.Title>Appearance</Card.Title>
			</div>
			<Card.Description>Customize the look and feel</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium">Theme</label>
				<select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
					<option>Light</option>
					<option>Dark</option>
					<option selected>System</option>
				</select>
			</div>
			<div class="space-y-2">
				<label class="text-sm font-medium">Language</label>
				<select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
					<option selected>English</option>
					<option>Spanish</option>
					<option>French</option>
					<option>German</option>
				</select>
			</div>
		</Card.Content>
	</Card.Root>
</div>
