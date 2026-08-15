<script lang="ts">
	import LegalPage from '$lib/components/LegalPage.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { mapHubPageSeo } from '$lib/seo/pages';

	const seo = mapHubPageSeo('datenschutz');
</script>

<SeoHead {seo} />

<LegalPage pageKey="datenschutz" />
