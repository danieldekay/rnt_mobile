<script lang="ts">
	import { resolve } from '$app/paths';
	import EventCard from '$lib/components/EventCard.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { mapVenueDetailSeo } from '$lib/seo/from-entity';
	import type { TribeEvent, TribeVenue } from '$lib/types';
	import type { PageProps } from './$types';

	type VenueDetail = TribeVenue & {
		upcomingCount: number;
	};

	let { data }: PageProps = $props();

	const venue = $derived(data.venue as VenueDetail);
	const events = $derived((data.events as TribeEvent[]) ?? []);
	const listHref = resolve('/tanzraeume');
	const seo = $derived(mapVenueDetailSeo(venue, venue.upcomingCount));
</script>

<SeoHead {seo} />

<div class="space-y-6">
	<a
		href={listHref}
		class="inline-flex min-h-10 items-center text-[0.95rem] font-semibold text-text-link underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default"
	>
		Zurück zu den Tanzräumen
	</a>

	<article class="card space-y-4 p-5">
		<h1 class="font-display text-[2rem] font-semibold text-text-default">{venue.venue}</h1>
		{#if venue.city || venue.address}
			<p class="meta-text">
				{[venue.address, venue.city].filter(Boolean).join(', ')}
			</p>
		{/if}
		{#if venue.website}
			<a
				href={venue.website}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex text-text-link underline underline-offset-4"
			>
				Website
			</a>
		{/if}
	</article>

	<section class="space-y-3">
		<h2 class="font-display text-[1.5rem] font-semibold text-text-default">Kommende Termine</h2>
		{#if events.length === 0}
			<div class="card p-6 text-center">
				<p class="text-[1rem] font-medium text-text-default">Aktuell keine verknüpften Termine</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each events as event (event.id)}
					<EventCard {event} />
				{/each}
			</div>
		{/if}
	</section>
</div>
