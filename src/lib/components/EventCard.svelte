<script lang="ts">
	import { resolve } from '$app/paths';
	import { format, parseISO } from 'date-fns';
	import { de } from 'date-fns/locale';
	import type { TribeEvent } from '$lib/types';
	import { extractDjFromDescription, formatEventCost } from '$lib/api/tribe';
	import { getEventAccentClass, getEventMusicBadgeClass, getEventMusicLabel, getEventTypeBadgeClass, getEventTypeLabel } from '$lib/utils/event-presentation';
	import Card from '$lib/components/Card.svelte';
	import Heading from '$lib/components/Heading.svelte';
	import Text from '$lib/components/Text.svelte';

	interface Props {
		event: TribeEvent;
		showImage?: boolean;
	}

	let { event, showImage = true }: Props = $props();

	const startDate = $derived(parseISO(event.start_date));
	const endDate = $derived(parseISO(event.end_date));
	const dj = $derived(extractDjFromDescription(event));

	const eventImage = $derived(event.image && typeof event.image === 'string' ? event.image : null);

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
	class="group block overflow-hidden transition-all duration-200 hover:border-border-accent hover:shadow-card-hover"
>
	<Card variant="outlined" shadow="md" padding="md" radius="lg" responsive={true}>
		<div class="flex items-start gap-4">
			<!-- Date Badge & Format Badges -->
			<div class="flex flex-col items-center gap-2 flex-shrink-0 w-[4.5rem]">
				<div class="relative flex h-[5.5rem] w-[4.5rem] flex-col items-center justify-center rounded-card bg-action-secondary text-text-default ring-1 ring-inset ring-border-default/50">
					<span class="absolute left-0 top-0 h-full w-1.5 rounded-l-card {accentClass} opacity-90" aria-hidden="true"></span>
					<Text size="xs" weight="bold" color="muted" tracking="wide" as="span" class="uppercase">{dayName}</Text>
					<span class="font-display text-[1.75rem] font-bold leading-none my-0.5">{dayNumber}</span>
					<Text size="xs" weight="bold" color="muted" tracking="wide" as="span" class="uppercase">{monthName}</Text>
				</div>

				<div class="flex flex-col items-center gap-1.5 w-full mt-1">
					{#if eventTypeLabel}
						<span class="inline-flex w-full min-h-5 items-center justify-center rounded-sm border px-1 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider text-center {eventTypeBadgeClass}">
							{eventTypeLabel}
						</span>
					{/if}
					{#if musicLabel}
						<span class="inline-flex w-full min-h-5 items-center justify-center rounded-sm border px-1 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider text-center {musicBadgeClass}">
							{musicLabel}
						</span>
					{/if}
				</div>
			</div>

			<div class="min-w-0 flex-1 space-y-3">
				<Heading level={3} weight="bold" lineHeight="snug" class="line-clamp-2 group-hover:text-action-primary transition-colors">
					{event.title}
				</Heading>

				<div class="space-y-1.5">
					<Text size="sm" color="muted" as="div">
						<div class="flex items-start gap-2">
							<svg class="mt-0.5 h-[1.125rem] w-[1.125rem] flex-shrink-0 text-text-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
							</svg>
							<span class="min-w-0 break-words font-medium">{event.venue?.city ?? 'Ort offen'}{event.venue?.venue ? ` · ${event.venue.venue}` : ''}</span>
						</div>

						<div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
							<div class="flex items-center gap-2">
								<svg class="h-[1.125rem] w-[1.125rem] flex-shrink-0 text-text-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
								<span class="font-medium">{event.all_day ? 'Ganztägig' : `${startTime} – ${endTime}`}</span>
							</div>

							{#if event.cost}
								<div class="flex items-center gap-1.5 font-bold text-text-default bg-surface-subtle px-2 py-0.5 rounded-sm">
									<span class="text-[0.75rem]" aria-hidden="true">€</span>
									<span>{formatEventCost(event.cost)}</span>
								</div>
							{/if}
						</div>

						{#if event.organizer?.length > 0 || dj}
							<div class="mt-1 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.8125rem]">
								{#if event.organizer?.length > 0}
									<span class="flex items-center gap-1.5 font-medium">
										<svg class="h-4 w-4 text-text-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
										</svg>
										{event.organizer[0].organizer}
									</span>
								{/if}
								{#if dj}
									<span class="flex items-center gap-1.5 font-medium">
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
			</div>

			{#if eventImage && showImage}
				<div class="flex-shrink-0 overflow-hidden rounded-[8px] ring-1 ring-inset ring-border-default/30">
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

			<div class="self-center flex-shrink-0 text-text-muted/40 transition-colors duration-200 group-hover:text-action-primary group-hover:translate-x-1 transform">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
				</svg>
			</div>
		</div>
	</Card>
</a>
