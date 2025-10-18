<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import UserIcon from '@lucide/svelte/icons/user';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import KeyIcon from '@lucide/svelte/icons/key';
	import DatabaseIcon from '@lucide/svelte/icons/database';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Settings</h1>
		<p class="text-muted-foreground">
			Manage your preferences, notifications, and privacy settings
		</p>
	</div>

	<Tabs.Root value="profile" class="w-full">
		<Tabs.List class="grid w-full grid-cols-6">
			<Tabs.Trigger value="profile">Profile</Tabs.Trigger>
			<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
			<Tabs.Trigger value="security">Security</Tabs.Trigger>
			<Tabs.Trigger value="monitoring">Monitoring</Tabs.Trigger>
			<Tabs.Trigger value="privacy">Privacy</Tabs.Trigger>
			<Tabs.Trigger value="appearance">Appearance</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="profile" class="mt-4">
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
							<label for="full-name" class="text-sm font-medium">Full Name</label>
							<input
								id="full-name"
								type="text"
								value="John Doe"
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							/>
						</div>
						<div class="space-y-2">
							<label for="email-address" class="text-sm font-medium">Email Address</label>
							<input
								id="email-address"
								type="email"
								value="john@example.com"
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							/>
						</div>
					</div>
					<div class="space-y-2">
						<label for="avatar-url" class="text-sm font-medium">Avatar URL</label>
						<input
							id="avatar-url"
							type="text"
							value="/avatars/user.jpg"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>
					<Button>Save Changes</Button>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="notifications" class="mt-4">
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
						<Switch checked />
					</div>
					<Separator.Root />
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<p class="text-sm font-medium">Daily Summary</p>
							<p class="text-xs text-muted-foreground">Receive daily activity summaries</p>
						</div>
						<Switch checked />
					</div>
					<Separator.Root />
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<p class="text-sm font-medium">New Family Member</p>
							<p class="text-xs text-muted-foreground">Alert when someone joins your family</p>
						</div>
						<Switch checked />
					</div>
					<Separator.Root />
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<p class="text-sm font-medium">Blockchain Transactions</p>
							<p class="text-xs text-muted-foreground">Notify on blockchain activity</p>
						</div>
						<Switch />
					</div>
					<Separator.Root />
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<p class="text-sm font-medium">Email Notifications</p>
							<p class="text-xs text-muted-foreground">Send notifications to your email</p>
						</div>
						<Switch checked />
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="security" class="mt-4">
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
						<label for="current-password" class="text-sm font-medium">Change Password</label>
						<input
							id="current-password"
							type="password"
							placeholder="Current password"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						/>
						<input
							id="new-password"
							type="password"
							placeholder="New password"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						/>
						<input
							id="confirm-password"
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
		</Tabs.Content>

		<Tabs.Content value="monitoring" class="mt-4">
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
						<label for="sensitivity-level" class="text-sm font-medium">Sensitivity Level</label>
						<Select.Root name="sensitivity-level" type="single">
							<Select.Trigger class="w-full" placeholder="Select sensitivity level" />
							<Select.Content>
								<Select.Item value="low">Low - Basic filtering</Select.Item>
								<Select.Item value="medium">Medium - Balanced protection</Select.Item>
								<Select.Item value="high">High - Strict monitoring</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<Separator.Root />
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<p class="text-sm font-medium">Auto-Block Harmful Content</p>
							<p class="text-xs text-muted-foreground">
								Automatically block detected harmful content
							</p>
						</div>
						<Switch checked />
					</div>
					<Separator.Root />
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<p class="text-sm font-medium">Store Logs on Blockchain</p>
							<p class="text-xs text-muted-foreground">
								Save all logs to blockchain for transparency
							</p>
						</div>
						<Switch checked />
					</div>
					<Separator.Root />
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<p class="text-sm font-medium">AI Model Selection</p>
							<p class="text-xs text-muted-foreground">Choose the AI model for monitoring</p>
						</div>
						<Select.Root name="ai-model" type="single">
							<Select.Trigger class="w-[180px]" placeholder="Select model" />
							<Select.Content>
								<Select.Item value="gpt4">GPT-4</Select.Item>
								<Select.Item value="gpt4-turbo">GPT-4 Turbo</Select.Item>
								<Select.Item value="claude3">Claude 3</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="privacy" class="mt-4">
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
						<Switch checked />
					</div>
					<Separator.Root />
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<p class="text-sm font-medium">Share Data for Research</p>
							<p class="text-xs text-muted-foreground">Anonymized data for AI safety research</p>
						</div>
						<Switch />
					</div>
					<Separator.Root />
					<div class="space-y-2">
						<Button variant="outline" class="w-full">Download My Data</Button>
						<Dialog.Root>
							<Dialog.Trigger class="w-full">
								<Button variant="outline" class="w-full text-red-600 hover:text-red-700">
									Delete My Account
								</Button>
							</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title>Delete Account</Dialog.Title>
									<Dialog.Description>
										This action cannot be undone. All your data will be permanently deleted.
									</Dialog.Description>
								</Dialog.Header>
								<div class="space-y-4 py-4">
									<div
										class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
									>
										<AlertTriangleIcon class="h-5 w-5 text-red-600" />
										<div class="space-y-1">
											<p class="text-sm font-medium text-red-900">Warning: Permanent Action</p>
											<p class="text-sm text-red-700">
												• All family members will be removed<br />
												• All message logs will be deleted<br />
												• All blockchain records will be lost<br />
												• This action cannot be reversed
											</p>
										</div>
									</div>
									<p class="text-sm text-muted-foreground">
										Type <strong>DELETE</strong> to confirm
									</p>
									<input
										type="text"
										placeholder="Type DELETE"
										class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									/>
								</div>
								<Dialog.Footer>
									<Button variant="outline" onclick={() => {}}>Cancel</Button>
									<Button variant="destructive" onclick={() => {}}>Delete Account</Button>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="appearance" class="mt-4">
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
						<label for="theme-select" class="text-sm font-medium">Theme</label>
						<Select.Root name="theme-select" type="single">
							<Select.Trigger class="w-full" placeholder="Select theme" />
							<Select.Content>
								<Select.Item value="light">Light</Select.Item>
								<Select.Item value="dark">Dark</Select.Item>
								<Select.Item value="system">System</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<div class="space-y-2">
						<label for="language-select" class="text-sm font-medium">Language</label>
						<Select.Root name="language-select" type="single">
							<Select.Trigger class="w-full" placeholder="Select language" />
							<Select.Content>
								<Select.Item value="en">English</Select.Item>
								<Select.Item value="es">Spanish</Select.Item>
								<Select.Item value="fr">French</Select.Item>
								<Select.Item value="de">German</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
