<script lang="ts">
	import type { WordPressSeoMeta } from '$lib/seo/from-wordpress';

	let { seo }: { seo: WordPressSeoMeta } = $props();
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#if seo.description}
		<meta name="description" content={seo.description} />
	{/if}
	{#if seo.canonical}
		<link rel="canonical" href={seo.canonical} />
	{/if}
	{#if seo.robots}
		<meta name="robots" content={seo.robots} />
	{/if}
	{#if seo.jsonLdScript}
		{@html seo.jsonLdScript}
	{/if}
</svelte:head>
