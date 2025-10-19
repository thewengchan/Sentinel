<script lang="ts">
	import '../app.css';
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
	import { chatStore, analyticsStore, userStore } from '$lib/stores';
	import { useAnalytics } from '$lib/composables/useAnalytics.svelte';
	import ModeSwitch from '$lib/components/modewatcher.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import Modewatcher from '$lib/components/modewatcher.svelte';
	import SEOMeta from '$lib/components/seo-meta.svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	// Initialize stores
	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		// Initialize analytics - DISABLED
		// analyticsStore.init();

		// Initialize chat store
		chatStore.init();

		// Load user preferences (without wallet address - will load specific prefs on wallet connect)
		userStore.load();

		// const analytics = useAnalytics();

		// Track initial page view - DISABLED
		// analytics.trackPageView(window.location.pathname);

		return () => {
			data.subscription.unsubscribe();
			// unsubscribe();
			// analyticsStore.stopAutoFlush();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SEOMeta />

<Toaster />
<ModeWatcher />

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
