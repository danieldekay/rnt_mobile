<script lang="ts">
	import { resolve } from '$app/paths';
	import { format, parseISO } from 'date-fns';
	import { de } from 'date-fns/locale';
	import type { TribeEvent } from '$lib/types';
	import { extractDjFromDescription, formatEventCost } from '$lib/api/tribe';
	import { getEventAccentClass, getEventMusicBadgeClass, getEventMusicLabel, getEventTypeBadgeClass, getEventTypeLabel } from '$lib/utils/event-presentation';

	interface Props {
		event: TribeEvent;
		showImage?: boolean;
	}

	let { event, showImage = true }: Props = $props();

	const startDate = $derived(parseISO(event.start_date));
	const endDate = $derived(parseISO(event.end_date));
	const dj = $derived(extractDjFromDescription(event));
	
	const eventImage = $derived.by(() => {
		if (event.image && typeof event.image === 'string') return event.image;
		const match = event.description?.match(/<img[^>]+src="([^"]+)"/);
		return match ? match[1] : null;
	});
	
	const dayName = $derived(format(startDate, 'EEE', { locale: de }));
	const dayNumber = $derived(format(startDate, 'd'));
	const monthName = $derived(format(startDate, 'MMM', { locale: de }));
	const startTime = $derived(format(startDate, 'HH:mm'));
	const endTime = $derived(format(endDate, 'HH:mm'));

	const eventTypeLabel = $derived(getEventTypeLabel(event));
	const eventTypeBadgeClass = $derived(getEventTypeBadgeClass(event));
	const musicLabel = $derived(getEventMusicLabel(event));
	const musicBadgeClass = $derived(getEventMusicBadgeClass(event));
	const accentClass = $derived(getEventAccentClass(event));

</script>

<a 
	href={resolve(`/event/${event.id}`)} 
	class="card group block overflow-hidden transition-colors duration-150 hover:border-border-strong hover:bg-surface-canvas"
>
	<div class="flex gap-4 p-4">
		<div class="relative flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center rounded-control border border-border-default bg-surface-subtle text-text-default">
			<span class="absolute left-0 top-0 h-full w-1 rounded-l-control {accentClass}" aria-hidden="true"></span>
			<span class="text-[0.75rem] font-medium uppercase tracking-wide text-text-muted">{dayName}</span>
			<span class="font-display text-[1.5rem] font-semibold leading-none">{dayNumber}</span>
			<span class="text-[0.75rem] font-medium text-text-muted">{monthName}</span>
		</div>

		<div class="min-w-0 flex-1 space-y-3">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0 space-y-2">
					<div class="flex flex-wrap items-center gap-2">
						{#if eventTypeLabel}
							<span class="inline-flex min-h-8 items-center rounded-badge border px-2.5 py-1 text-[0.75rem] font-semibold {eventTypeBadgeClass}">
								{eventTypeLabel}
							</span>
						{/if}
						{#if musicLabel}
							<span class="inline-flex min-h-8 items-center rounded-badge border px-2.5 py-1 text-[0.75rem] font-semibold {musicBadgeClass}">
								{musicLabel}
							</span>
						{/if}
					</div>
					<h3 class="line-clamp-2 text-[1.125rem] font-semibold leading-tight text-text-default">
						{event.title}
					</h3>
				</div>

				{#if eventImage && showImage}
					<img
						src={eventImage}
						alt=""
						width="320"
						height="320"
						class="h-20 w-20 rounded-control border border-border-default object-cover"
						loading="lazy"
					/>
				{/if}
			</div>

			<div class="space-y-2 text-[0.9375rem] text-text-muted">
				<div class="flex items-start gap-2">
					<svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
					</svg>
					<span class="min-w-0 break-words">{event.venue?.city ?? 'Ort offen'}{event.venue?.venue ? ` · ${event.venue.venue}` : ''}</span>
				</div>

				<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
					<div class="flex items-center gap-2">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						<span>{event.all_day ? 'Ganztägig' : `${startTime} – ${endTime}`}</span>
					</div>

					{#if event.cost}
						<div class="flex items-center gap-2 font-medium text-text-default">
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<span>{formatEventCost(event.cost)}</span>
						</div>
					{/if}
				</div>

				{#if event.organizer?.length > 0 || dj}
					<div class="flex flex-wrap gap-x-4 gap-y-1 text-[0.875rem] text-text-muted">
						{#if event.organizer?.length > 0}
							<span class="flex items-center gap-1.5">
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
								</svg>
								{event.organizer[0].organizer}
							</span>
						{/if}
						{#if dj}
							<span class="flex items-center gap-1.5">
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
								</svg>
								DJ {dj}
							</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<div class="self-center text-text-muted transition-colors group-hover:text-text-default">
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
				</svg>
			</div>
		</div>
</a>
