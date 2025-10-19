<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { authStore } from '$lib/stores/auth.store.svelte.js';
	import { userStore } from '$lib/stores/user.store.svelte.js';
	import { walletStore } from '$lib/stores/wallet.store.svelte.js';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import { goto } from '$app/navigation';

	const sidebar = useSidebar();

	// Get user data from auth store
	const user = $derived(() => ({
		name: authStore.user?.full_name || 'User',
		email: authStore.user?.email || '',
		avatar: authStore.user?.avatar_url || '',
		role: 'user' // Default role for now
	}));

	// Check wallet connection status
	const walletStatus = $derived(() => {
		if (walletStore.isConnected && userStore.currentWalletAddress) {
			return {
				connected: true,
				address: userStore.currentWalletAddress,
				shortAddress: `${userStore.currentWalletAddress.slice(0, 6)}...${userStore.currentWalletAddress.slice(-4)}`
			};
		}
		return { connected: false, address: null, shortAddress: null };
	});
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={user().avatar} alt={user().name} />
							<Avatar.Fallback class="rounded-lg"
								>{user().name.charAt(0).toUpperCase()}</Avatar.Fallback
							>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{user().name}</span>
							<span class="truncate text-xs text-muted-foreground">{user().email}</span>
							{#if walletStatus().connected}
								<span class="truncate text-xs text-green-600 dark:text-green-400">
									Wallet: {walletStatus().shortAddress}
								</span>
							{:else}
								<span class="truncate text-xs text-orange-600 dark:text-orange-400">
									No wallet connected
								</span>
							{/if}
						</div>
						<div class="ml-auto flex items-center gap-2">
							<Badge variant="secondary" class="text-xs">
								{walletStatus().connected ? 'Connected' : 'No Wallet'}
							</Badge>
							<ChevronsUpDownIcon class="size-4" />
						</div>
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={user().avatar} alt={user().name} />
							<Avatar.Fallback class="rounded-lg"
								>{user().name.charAt(0).toUpperCase()}</Avatar.Fallback
							>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{user().name}</span>
							<span class="truncate text-xs text-muted-foreground">{user().email}</span>
							<Badge variant="secondary" class="mt-1 w-fit text-xs">
								{walletStatus().connected ? 'Wallet Connected' : 'No Wallet'}
							</Badge>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<WalletIcon />
						{walletStatus().connected ? 'Wallet Connected' : 'Connect Wallet'}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<BadgeCheckIcon />
						Account
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<BellIcon />
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<a href="/auth/signout">
					<DropdownMenu.Item>
						<LogOutIcon />
						Log out
					</DropdownMenu.Item>
				</a>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
