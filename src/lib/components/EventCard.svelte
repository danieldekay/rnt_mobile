<script lang="ts">
	import { format, parseISO } from 'date-fns';
	import { de } from 'date-fns/locale';
	import type { TribeEvent } from '$lib/types';
	import { extractDjFromDescription } from '$lib/api/tribe';

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

	const categoryNames = $derived(event.categories?.map((c) => c.name).filter((n) => n) ?? []);
	
	const isMilonga = $derived(categoryNames.some((c) => c.toLowerCase().includes('milonga')));
	const isPractica = $derived(categoryNames.some((c) => c.toLowerCase().includes('practica')));
	const isWorkshop = $derived(categoryNames.some((c) => c.toLowerCase().includes('workshop')));
	
	const badgeColor = $derived(isMilonga ? 'bg-coral' : isPractica ? 'bg-mint' : isWorkshop ? 'bg-lavender' : 'bg-primary-500');
	const badgeGradient = $derived(isMilonga ? 'from-coral/20 to-coral/5' : isPractica ? 'from-mint/20 to-mint/5' : isWorkshop ? 'from-lavender/20 to-lavender/5' : 'from-primary-500/20 to-primary-500/5');
	const dateGradient = $derived(isMilonga ? 'from-coral to-rose-500' : isPractica ? 'from-mint to-teal-500' : isWorkshop ? 'from-lavender to-purple-500' : 'from-primary-500 to-primary-600');

	function getPriceDisplay(cost: string): string {
		if (!cost) return 'auf Anfrage';
		if (cost.includes('frei') || cost === '0') return 'frei';
		return cost.includes('€') ? cost : `€${cost}`;
	}
</script>

<a 
	href="/event/{event.id}" 
	class="card block overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group"
>
	{#if eventImage && showImage}
		<div class="relative h-36 overflow-hidden">
			<img 
				src={eventImage} 
				alt=""
				class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
				loading="lazy"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
			{#if event.featured}
				<div class="absolute top-3 left-3 px-2.5 py-1 bg-amber text-white text-[10px] font-bold rounded-full shadow-lg">
					Empfohlen
				</div>
			{/if}
			<div class="absolute top-3 right-3">
				<span class="px-2.5 py-1 {badgeColor} text-white text-[10px] font-bold rounded-full shadow-lg">
					{isMilonga ? 'Milonga' : isPractica ? 'Practica' : isWorkshop ? 'Workshop' : 'Event'}
				</span>
			</div>
		</div>
	{/if}
	
	<div class="p-4 {eventImage && showImage ? '' : 'pt-5'}">
		<div class="flex gap-3">
			{#if !eventImage || !showImage}
				<div class="flex-shrink-0 w-14 h-14 bg-gradient-to-br {dateGradient} rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
					<span class="text-[10px] font-medium uppercase tracking-wide opacity-90">{dayName}</span>
					<span class="text-xl font-bold leading-none">{dayNumber}</span>
					<span class="text-[10px] font-medium opacity-90">{monthName}</span>
				</div>
			{/if}

			<div class="flex-1 min-w-0">
				{#if eventImage}
					<div class="flex items-center gap-2 mb-1.5">
						<span class="px-2 py-0.5 bg-gradient-to-r {badgeGradient} {badgeColor} text-white text-[10px] font-bold rounded-full">
							{isMilonga ? 'Milonga' : isPractica ? 'Practica' : isWorkshop ? 'Workshop' : 'Event'}
						</span>
						<span class="text-[10px] text-gray-400 font-medium">{dayName}, {dayNumber}. {monthName}</span>
					</div>
				{/if}

				<h3 class="font-bold text-gray-900 leading-tight mb-1.5 line-clamp-2 {(eventImage && showImage) ? 'text-base' : 'text-base'}">
					{event.title}
				</h3>

				{#if !eventImage || !showImage}
					<div class="flex items-center gap-1 text-sm text-gray-500 mb-2">
						<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
						</svg>
						<span class="truncate">
							{event.venue?.venue ?? 'Ort noch nicht angegeben'}
							{#if event.venue?.city}
								<span class="text-gray-400">· {event.venue.city}</span>
							{/if}
						</span>
					</div>
				{:else}
					<div class="flex items-center gap-1 text-xs text-gray-500 mb-2">
						<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
						</svg>
						<span class="truncate">
							{event.venue?.venue ?? 'Ort noch nicht angegeben'}{event.venue?.city ? ` · ${event.venue.city}` : ''}
						</span>
					</div>
				{/if}

				<div class="flex items-center gap-3 text-sm">
					<div class="flex items-center gap-1.5 {(eventImage && showImage) ? 'text-gray-600' : 'text-gray-500'}">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						<span>{startTime}{event.all_day ? '' : ` – ${endTime}`}</span>
					</div>
					
					{#if event.cost}
						<div class="flex items-center gap-1.5 font-semibold {event.cost.includes('frei') || event.cost === '0' ? 'text-mint' : 'text-primary-600'}">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<span>{getPriceDisplay(event.cost)}</span>
						</div>
					{/if}
				</div>

				{#if (event.organizer?.length > 0 || dj) && !event.image}
					<div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
						{#if event.organizer?.length > 0}
							<span class="flex items-center gap-1">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
								</svg>
								{event.organizer[0].organizer}
							</span>
						{/if}
						{#if dj}
							<span class="flex items-center gap-1">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
								</svg>
								DJ {dj}
							</span>
						{/if}
					</div>
				{/if}
			</div>

			<div class="flex-shrink-0 self-center text-gray-300 group-hover:text-primary-400 transition-colors">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
				</svg>
			</div>
		</div>
	</div>
</a>
