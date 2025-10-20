<script lang="ts">
	import { page } from '$app/state';
	import SignupForm from '$lib/components/signup-form.svelte';
	import { goto } from '$app/navigation';

	const supabase = page.data.supabase;

	// Get redirect URL from query params
	const redirectTo = page.url.searchParams.get('redirectTo') || '/';
</script>

<div class="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
	<div class="w-full max-w-sm md:max-w-3xl">
		<SignupForm {supabase} {redirectTo} />
	</div>
</div>
