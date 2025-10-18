<script lang="ts">
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	// Function to generate breadcrumb items from the current route
	function generateBreadcrumbs(pathname: string) {
		const segments = pathname.split('/').filter(Boolean);
		const breadcrumbs = [];

		// Always start with Home
		breadcrumbs.push({
			label: 'Home',
			href: '/',
			isLast: segments.length === 0
		});

		// Build breadcrumbs from path segments
		let currentPath = '';
		segments.forEach((segment, index) => {
			currentPath += `/${segment}`;
			const isLast = index === segments.length - 1;

			// Convert segment to readable label
			const label = segment
				.split('-')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');

			breadcrumbs.push({
				label,
				href: currentPath,
				isLast
			});
		});

		return breadcrumbs;
	}

	// Generate breadcrumbs from current page
	const breadcrumbs = $derived(generateBreadcrumbs(page.url.pathname));
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		{#each breadcrumbs as breadcrumb, index}
			<Breadcrumb.Item class={index === 0 ? 'hidden md:block' : ''}>
				{#if breadcrumb.isLast}
					<Breadcrumb.Page>{breadcrumb.label}</Breadcrumb.Page>
				{:else}
					<Breadcrumb.Link href={breadcrumb.href}>{breadcrumb.label}</Breadcrumb.Link>
				{/if}
			</Breadcrumb.Item>
			{#if !breadcrumb.isLast}
				<Breadcrumb.Separator class={index === 0 ? 'hidden md:block' : ''} />
			{/if}
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
