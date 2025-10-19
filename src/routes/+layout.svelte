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
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SEOMeta />

<Toaster />
<ModeWatcher />

{@render children?.()}
