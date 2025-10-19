<script lang="ts">
	import { page } from '$app/state';
	import {
		getPageSEOData,
		generateOpenGraphData,
		generateTwitterCardData,
		type SEOData
	} from '$lib/utils/seo.js';

	interface Props {
		seo?: SEOData;
	}

	let { seo = {} }: Props = $props();

	// Get page-specific SEO data
	const pageSEO = $derived(getPageSEOData(page.url.pathname));

	// Merge provided SEO data with page-specific data
	const finalSEO = $derived({
		...pageSEO,
		...seo,
		title: seo.title || pageSEO.title,
		description: seo.description || pageSEO.description,
		keywords: seo.keywords || pageSEO.keywords
	});

	// Generate Open Graph and Twitter Card data
	const ogData = $derived(generateOpenGraphData(finalSEO));
	const twitterData = $derived(generateTwitterCardData(finalSEO));
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{finalSEO.title}</title>
	<meta name="title" content={finalSEO.title} />
	<meta name="description" content={finalSEO.description} />
	{#if finalSEO.keywords}
		<meta name="keywords" content={finalSEO.keywords} />
	{/if}
	{#if finalSEO.canonical}
		<link rel="canonical" href={finalSEO.canonical} />
	{/if}
	{#if finalSEO.noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<!-- Open Graph / Facebook -->
	{#each Object.entries(ogData) as [key, value]}
		<meta property={key} content={value} />
	{/each}

	<!-- Twitter -->
	{#each Object.entries(twitterData) as [key, value]}
		<meta property={key} content={value} />
	{/each}
</svelte:head>
