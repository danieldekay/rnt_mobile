<script lang="ts">
	import { resolve } from '$app/paths';
	import EventCard from '$lib/components/EventCard.svelte';
	import EntityFavoriteControl from '$lib/components/EntityFavoriteControl.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { hasAnyFavorites } from '$lib/utils/favorites';
	import { getFavoritePlanningSections } from '$lib/favorites/planning';
	import type { PageProps } from './$types';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { mapHubPageSeo } from '$lib/seo/pages';

	const seo = mapHubPageSeo('favoriten');

	let { data }: PageProps = $props();

	const planningSections = $derived.by(() =>
		getFavoritePlanningSections(data.events, favoritesStore.snapshot)
	);
	const favoriteEvents = $derived(planningSections.flatMap((section) => section.events));

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

	const favoriteEntityCount = $derived(
		favoriteOrganizers.length + favoriteVenues.length + favoriteDjs.length
	);
	const hasFavorites = $derived(hasAnyFavorites(favoritesStore.snapshot));
</script>

<SeoHead {seo} />

<div class="page-stack">
	<section class="space-y-2">
		<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">
			Deine Auswahl
		</p>
		<h1 class="font-display text-[2rem] font-semibold text-text-default">Favoriten & Planung</h1>
		<p class="meta-text max-w-[46ch]">
			Plane aus deinen gespeicherten Veranstaltungen, Veranstaltern, Tanzräumen und DJs.
			Die nächsten passenden Termine stehen zuerst.
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
		<section class="grid gap-3 md:grid-cols-3" aria-label="Planungsübersicht">
			<div class="card p-4">
				<p class="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
					Kommende Treffer
				</p>
				<p class="mt-1 font-display text-[1.75rem] font-semibold text-text-default">
					{favoriteEvents.length}
				</p>
				<p class="meta-text mt-1">Termine aus deinen Favoriten im 90-Tage-Fenster.</p>
			</div>
			<div class="card p-4">
				<p class="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
					Gespeicherte Einträge
				</p>
				<p class="mt-1 font-display text-[1.75rem] font-semibold text-text-default">
					{favoriteEntityCount}
				</p>
				<p class="meta-text mt-1">Veranstalter, Tanzräume und DJs, denen du folgst.</p>
			</div>
			<a
				href={resolve('/')}
				class="card flex min-h-28 flex-col justify-between p-4 transition-colors hover:border-border-accent hover:bg-action-secondary"
			>
				<span class="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
					Weitere Planung
				</span>
				<span class="font-medium text-text-default">Neue Events entdecken →</span>
			</a>
		</section>

		<section class="space-y-3" aria-labelledby="favorite-events-heading">
			<div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 id="favorite-events-heading" class="font-display text-[1.5rem] font-semibold text-text-default">
						Deine nächsten Optionen
					</h2>
					<p class="meta-text">Nach Entscheidungsnähe gruppiert.</p>
				</div>
				<a href={resolve('/?favorites=1')} class="text-sm font-medium text-action-primary hover:underline">
					Als Eventfilter öffnen
				</a>
			</div>

			{#if favoriteEvents.length === 0}
				<div class="card p-6 text-center">
					<p class="text-[1rem] font-medium text-text-default">
						Keine kommenden Termine für deine Favoriten
					</p>
					<p class="meta-text mt-2">
						Speichere weitere Events oder folge DJs, Veranstaltern und Tanzräumen.
					</p>
				</div>
			{:else}
				<div class="space-y-5">
					{#each planningSections as section (section.id)}
						{#if section.events.length > 0}
							<section class="space-y-2" aria-labelledby={`favorites-section-${section.id}`}>
								<div class="flex items-start justify-between gap-3">
									<div>
										<h3 id={`favorites-section-${section.id}`} class="text-[1rem] font-semibold text-text-default">
											{section.label}
										</h3>
										<p class="meta-text">{section.description}</p>
									</div>
									<p class="rounded-badge bg-surface-subtle px-2 py-1 text-xs font-medium text-text-muted">
										{section.events.length} Termine
									</p>
								</div>
								<div class="space-y-3">
									{#each section.events as event (event.id)}
										<EventCard {event} />
									{/each}
								</div>
							</section>
						{/if}
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
