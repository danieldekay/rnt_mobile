<script lang="ts">
	import { resolve } from '$app/paths';
	import EventCard from '$lib/components/EventCard.svelte';
	import EntityFavoriteControl from '$lib/components/EntityFavoriteControl.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { hasAnyFavorites, matchesFavoriteEvent } from '$lib/utils/favorites';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const favoriteEvents = $derived.by(() => {
		const snapshot = favoritesStore.snapshot;
		const now = new Date();

		return data.events
			.filter((event) => {
				const start = new Date(event.start_date);
				return start >= now && matchesFavoriteEvent(event, snapshot);
			})
			.sort((left, right) => left.start_date.localeCompare(right.start_date));
	});

	const favoriteOrganizers = $derived.by(() => {
		const ids = new Set(favoritesStore.snapshot.organizerIds);
		return data.organizers.filter((organizer) => ids.has(organizer.id));
	});

	const favoriteVenues = $derived.by(() => {
		const ids = new Set(favoritesStore.snapshot.venueIds);
		return data.venues.filter((venue) => ids.has(venue.id));
	});

	const favoriteDjs = $derived.by(() => {
		const slugs = new Set(favoritesStore.snapshot.djSlugs);
		return data.djs.filter((dj) => slugs.has(dj.slug));
	});

	const hasFavorites = $derived(hasAnyFavorites(favoritesStore.snapshot));
</script>

<svelte:head>
	<title>Favoriten - RNT Kalender</title>
</svelte:head>

<div class="page-stack">
	<section class="space-y-2">
		<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">
			Deine Auswahl
		</p>
		<h1 class="font-display text-[2rem] font-semibold text-text-default">Favoriten</h1>
		<p class="meta-text max-w-[40ch]">
			Alle kommenden Termine, die zu deinen gespeicherten Veranstaltungen, Veranstaltern,
			Tanzräumen oder DJs passen.
		</p>
	</section>

	{#if data.loadError}
		<div class="status-error-panel" role="alert">
			<p class="status-error-title">Favoriten konnten nicht geladen werden</p>
			<p class="meta-text mt-2">Bitte versuche es später erneut.</p>
		</div>
	{:else if !hasFavorites}
		<div class="card p-6 text-center">
			<p class="text-[1rem] font-medium text-text-default">Noch keine Favoriten gespeichert</p>
			<p class="meta-text mt-2">
				Speichere Veranstaltungen, Veranstalter, Tanzräume oder DJs mit dem Stern-Symbol.
			</p>
			<a href={resolve('/')} class="btn-primary mt-4 inline-flex">Zu den Veranstaltungen</a>
		</div>
	{:else}
		<section class="space-y-3" aria-labelledby="favorite-events-heading">
			<h2 id="favorite-events-heading" class="font-display text-[1.5rem] font-semibold text-text-default">
				Kommende Termine
			</h2>
			{#if favoriteEvents.length === 0}
				<div class="card p-6 text-center">
					<p class="text-[1rem] font-medium text-text-default">
						Keine kommenden Termine für deine Favoriten
					</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each favoriteEvents as event (event.id)}
						<EventCard {event} />
					{/each}
				</div>
			{/if}
		</section>

		<section class="space-y-4" aria-labelledby="favorite-entities-heading">
			<h2 id="favorite-entities-heading" class="font-display text-[1.5rem] font-semibold text-text-default">
				Gespeicherte Einträge
			</h2>

			{#if favoriteOrganizers.length > 0}
				<div class="space-y-2">
					<h3 class="text-[0.9375rem] font-medium text-text-default">Veranstalter</h3>
					<ul class="space-y-2">
						{#each favoriteOrganizers as organizer (organizer.id)}
							<li class="card flex items-center justify-between gap-3 p-4">
								<a
									href={resolve(`/veranstalter/${organizer.slug}`)}
									class="min-w-0 font-medium text-text-default hover:text-action-primary"
								>
									{organizer.organizer}
								</a>
								<EntityFavoriteControl kind="organizer" id={organizer.id} size="sm" />
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if favoriteVenues.length > 0}
				<div class="space-y-2">
					<h3 class="text-[0.9375rem] font-medium text-text-default">Tanzräume</h3>
					<ul class="space-y-2">
						{#each favoriteVenues as venue (venue.id)}
							<li class="card flex items-center justify-between gap-3 p-4">
								<a
									href={resolve(`/?venue=${venue.id}`)}
									class="min-w-0 font-medium text-text-default hover:text-action-primary"
								>
									{venue.venue}
								</a>
								<EntityFavoriteControl kind="venue" id={venue.id} size="sm" />
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if favoriteDjs.length > 0}
				<div class="space-y-2">
					<h3 class="text-[0.9375rem] font-medium text-text-default">DJs</h3>
					<ul class="space-y-2">
						{#each favoriteDjs as dj (dj.slug)}
							<li class="card flex items-center justify-between gap-3 p-4">
								<a
									href={resolve(`/djs/${dj.slug}`)}
									class="min-w-0 font-medium text-text-default hover:text-action-primary"
								>
									{dj.name}
								</a>
								<EntityFavoriteControl kind="dj" id={dj.slug} size="sm" />
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}
</div>
