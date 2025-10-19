<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { invalidate } from '$app/navigation';

	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import DynamicBreadcrumb from '$lib/components/dynamic-breadcrumb.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import Wallet from '$lib/components/wallet/wallet.svelte';
	import { chatStore, userStore } from '$lib/stores';
	import Modewatcher from '$lib/components/modewatcher.svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	// Initialize stores
	onMount(() => {
		// Initialize analytics - DISABLED
		// analyticsStore.init();

		// Get user data from session and initialize stores
		(async () => {
			if (session?.user) {
				const userId = session.user.id;
				const userData = await supabase
					.from('users')
					.select('wallet_address, email, full_name, avatar_url')
					.eq('id', userId)
					.single();

				if (userData.data) {
					// Initialize chat store with user context
					await chatStore.init(userId, userData.data.wallet_address || '');

					// Load user preferences
					await userStore.load(
						userId,
						userData.data.email || session.user.email,
						userData.data.full_name || session.user.user_metadata?.full_name,
						userData.data.avatar_url || session.user.user_metadata?.avatar_url,
						userData.data.wallet_address
					);
				}
			}
		})();

		// const analytics = useAnalytics();

		// Track initial page view - DISABLED
		// analytics.trackPageView(window.location.pathname);

		// Cleanup function removed - subscription not available in this context
		// If you need to add auth state change listener, do it here
	});
</script>

<Wallet>
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset>
			<header
				class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
			>
				<div class="flex w-full items-center justify-between gap-2 px-4">
					<div class="flex items-center gap-2 px-4">
						<Sidebar.Trigger class="-ml-1" />
						<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
						<DynamicBreadcrumb />
					</div>

					<Modewatcher />
				</div>
			</header>
			{@render children?.()}
		</Sidebar.Inset>
	</Sidebar.Provider>
</Wallet>
