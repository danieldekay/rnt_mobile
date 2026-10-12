
<script lang="ts">
	import { resolve } from '$app/paths';
	import { format, parseISO } from 'date-fns';
	import { de } from 'date-fns/locale';
	import type { TribeEvent } from '$lib/types';
	import { extractDjFromDescription, formatEventCost } from '$lib/api/tribe';
	import {
		getEventAccentClass,
		getEventHighlights,
		getEventMusicBadgeClass,
		getEventMusicLabel,
		getEventTypeBadgeClass,
		getEventTypeLabel
	} from '$lib/utils/event-presentation';
	import Card from '$lib/components/Card.svelte';
	import Heading from '$lib/components/Heading.svelte';
	import Text from '$lib/components/Text.svelte';
	import EventFavoriteControl from '$lib/components/EventFavoriteControl.svelte';

	interface Props {
		event: TribeEvent;
		showImage?: boolean;
	}

	let { event, showImage = false }: Props = $props();

	const startDate = $derived(parseISO(event.start_date));
	const endDate = $derived(parseISO(event.end_date));
	const dj = $derived(extractDjFromDescription(event));

	const eventImage = $derived(event.image && typeof event.image === 'string' ? event.image : null);

	const dayName = $derived(format(startDate, 'EEE', { locale: de }));
	const dayNumber = $derived(format(startDate, 'd'));
	const monthName = $derived(format(startDate, 'MMM', { locale: de }));
	const startTime = $derived(format(startDate, 'HH:mm'));
	const endTime = $derived(format(endDate, 'HH:mm'));
	const timeLabel = $derived(event.all_day ? 'Ganztägig' : `${startTime} – ${endTime}`);
	const cityLabel = $derived(event.venue?.city ?? 'Ort offen');
	const venueLabel = $derived(event.venue?.venue ?? null);
	const organizerLabel = $derived(event.organizer?.[0]?.organizer ?? null);

	const eventTypeLabel = $derived(getEventTypeLabel(event));
	const eventTypeBadgeClass = $derived(getEventTypeBadgeClass(event));
	const musicLabel = $derived(getEventMusicLabel(event));
	const musicBadgeClass = $derived(getEventMusicBadgeClass(event));
	const eventHighlights = $derived(getEventHighlights(event));
	const accentClass = $derived(getEventAccentClass(event));
</script>

<div class="group relative block overflow-hidden transition-all duration-200 hover:border-border-accent hover:shadow-card-hover">
	<div class="absolute right-3 top-3 z-10">
		<EventFavoriteControl {event} size="sm" />
	</div>
	<a href={resolve(`/event/${event.id}`)} class="block">
		<Card variant="outlined" shadow="md" padding="md" radius="lg" responsive={true}>
			<div class="flex items-start gap-3 sm:gap-4">
				<div class="flex flex-col items-center gap-2 flex-shrink-0 w-14 sm:w-[4.5rem]">
					<div class="relative flex h-[4.75rem] w-14 flex-col items-center justify-center rounded-card bg-action-secondary text-text-default ring-1 ring-inset ring-border-default/50 sm:h-[5.5rem] sm:w-[4.5rem]">
						<span class="absolute left-0 top-0 h-full w-1.5 rounded-l-card {accentClass} opacity-90" aria-hidden="true"></span>
						<Text size="xs" weight="bold" color="muted" tracking="wide" as="span" class="uppercase">{dayName}</Text>
						<span class="font-display text-[1.55rem] font-bold leading-none my-0.5 sm:text-[1.75rem]">{dayNumber}</span>
						<Text size="xs" weight="bold" color="muted" tracking="wide" as="span" class="uppercase">{monthName}</Text>
					</div>
				</div>

				<div class="min-w-0 flex-1 space-y-2.5 pr-8">
					<div class="space-y-2">
						<div class="flex flex-wrap gap-1.5" aria-label="Event-Typ und Musik">
							{#if eventTypeLabel}
								<span class="inline-flex min-h-7 items-center rounded-badge border px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] {eventTypeBadgeClass}">
									{eventTypeLabel}
								</span>
							{/if}
							{#if musicLabel}
								<span class="inline-flex min-h-7 items-center rounded-badge border px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] {musicBadgeClass}">
									{musicLabel}
								</span>
							{/if}
						</div>

						<Heading level={3} weight="bold" lineHeight="snug" class="line-clamp-2 group-hover:text-action-primary transition-colors">
							{event.title}
						</Heading>
					</div>

					<Text size="sm" color="muted" as="div" class="space-y-2">
						<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-text-default">
							<span class="inline-flex items-center gap-1.5 font-semibold">
								<svg class="h-4 w-4 flex-shrink-0 text-text-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
								{timeLabel}
							</span>
							<span class="inline-flex min-w-0 items-center gap-1.5 font-semibold">
								<svg class="h-4 w-4 flex-shrink-0 text-text-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
								</svg>
								<span class="truncate">{cityLabel}</span>
							</span>
							{#if event.cost}
								<span class="inline-flex items-center gap-1 rounded-sm bg-surface-subtle px-2 py-0.5 text-[0.8125rem] font-bold text-text-default">
									<span aria-hidden="true">€</span>
									{formatEventCost(event.cost)}
								</span>
							{/if}
						</div>

						{#if venueLabel}
							<div class="min-w-0 text-[0.8125rem] font-medium text-text-muted">
								<span class="sr-only">Venue: </span>{venueLabel}
							</div>
						{/if}

						{#if eventHighlights.length > 0}
							<div class="flex flex-wrap gap-1.5" data-testid="event-card-highlights">
								{#each eventHighlights as highlight (highlight)}
									<span class="inline-flex items-center rounded-full border border-border-default/70 bg-surface-subtle px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-text-default">
										{highlight}
									</span>
								{/each}
							</div>
						{/if}

						{#if organizerLabel || dj}
							<div class="flex flex-wrap gap-x-3 gap-y-1 text-[0.8125rem]">
								{#if organizerLabel}
									<span class="inline-flex items-center gap-1.5 font-medium">
										<svg class="h-4 w-4 text-text-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
										</svg>
										{organizerLabel}
									</span>
								{/if}
								{#if dj}
									<span class="inline-flex items-center gap-1.5 font-medium">
										<svg class="h-4 w-4 text-text-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
										</svg>
										DJ {dj}
									</span>
								{/if}
							</div>
						{/if}
					</Text>
				</div>

				{#if eventImage && showImage}
					<div class="hidden flex-shrink-0 overflow-hidden rounded-[8px] ring-1 ring-inset ring-border-default/30 sm:block">
						<img
							src={eventImage}
							alt=""
							width="320"
							height="320"
							class="h-[4.75rem] w-[4.75rem] object-cover transition-transform duration-500 group-hover:scale-105"
							loading="lazy"
						/>
					</div>
				{/if}

				<div class="hidden self-center flex-shrink-0 text-text-muted/40 transition-colors duration-200 group-hover:text-action-primary group-hover:translate-x-1 transform sm:block">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
					</svg>
				</div>
			</div>
		</Card>
	</a>
</div>
