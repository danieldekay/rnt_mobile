<script lang="ts">
	import type { SeoMetadata } from '$lib/seo/metadata';

	let { seo }: { seo: SeoMetadata } = $props();
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.canonical} />
	<meta name="robots" content={seo.robots} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:site_name" content="Rhein-Neckar-Tango" />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:url" content={seo.canonical} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	{#if seo.image}
		<meta property="og:image" content={seo.image} />
		<meta name="twitter:image" content={seo.image} />
	{/if}
	{#if seo.jsonLd}
		{@html `<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>`}
	{/if}
</svelte:head>
