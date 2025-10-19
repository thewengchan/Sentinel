<script lang="ts" module>
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import CoinsIcon from '@lucide/svelte/icons/coins';
	import UsersIcon from '@lucide/svelte/icons/users';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';

	// App data structure for AI Monitoring dApp
	const data = {
		user: {
			name: 'Harry Potter',
			email: 'harry@example.com',
			avatar:
				'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlNWU3ZWIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0iIzljYTNhZiIvPjxwYXRoIGQ9Ik0yMCA4MCBRMjAgNjUgMzUgNjUgTDY1IDY1IFE4MCA2NSA4MCA4MCBMODAgMTAwIEwyMCAxMDAgWiIgZmlsbD0iIzljYTNhZiIvPjwvc3ZnPg==',
			role: 'parent' // "parent" (admin for family), "child" (member), or "admin" (system admin)
		},
		family: {
			name: 'Dumbledore Family',
			logo: GalleryVerticalEndIcon,
			plan: 'Premium' // "Free", "Basic", "Premium"
		},
		navMain: [
			{
				title: 'Dashboard',
				url: '/',
				icon: LayoutDashboardIcon,
				isActive: true
			},
			{
				title: 'Chat',
				url: '/chat',
				icon: MessageSquareIcon
			},
			{
				title: 'Monitoring',
				url: '#',
				icon: ShieldCheckIcon,
				items: [
					{
						title: 'Message Logs',
						url: '/logs'
					},
					{
						title: 'Incidents',
						url: '/incidents'
					},
					{
						title: 'Analytics',
						url: '/analytics'
					}
				]
			},
			{
				title: 'Blockchain',
				url: '#',
				icon: CoinsIcon,
				items: [
					{
						title: 'Wallet',
						url: '/wallet'
					},
					{
						title: 'Transactions',
						url: '/transactions'
					},
					{
						title: 'Smart Contracts',
						url: '/contracts'
					}
				]
			},
			{
				title: 'Family',
				url: '#',
				icon: UsersIcon,
				items: [
					{
						title: 'Members',
						url: '/family/members'
					},
					{
						title: 'Roles',
						url: '/family/roles'
					},
					{
						title: 'Activity',
						url: '/family/activity'
					}
				]
			},
			{
				title: 'Settings',
				url: '/settings',
				icon: Settings2Icon
			}
		],
		adminNav: {
			title: 'Admin Panel',
			url: '/admin',
			icon: ShieldAlertIcon
		}
	};
</script>

<script lang="ts">
	import NavMain from './nav-main.svelte';
	import NavUser from './nav-user.svelte';
	import FamilySwitcher from './family-switcher.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header>
		<FamilySwitcher family={data.family} />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		{#if data.user.role === 'admin' || data.user.role === 'parent'}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Administration</Sidebar.GroupLabel>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton tooltipContent={data.adminNav.title}>
							{#snippet child({ props })}
								<a href={data.adminNav.url} {...props}>
									<data.adminNav.icon />
									<span>{data.adminNav.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>
	<Sidebar.Footer>
		{@const user = data.user}
		<!-- eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -->
		<NavUser {user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
