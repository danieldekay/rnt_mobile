<script lang="ts">
	import { resolve } from '$app/paths';
	import type { TribeEvent } from '$lib/types';
	import Card from '$lib/components/Card.svelte';
	import Heading from '$lib/components/Heading.svelte';
	import Text from '$lib/components/Text.svelte';

	interface Props {
		events: TribeEvent[];
		heading: string;
	}

	let { events, heading }: Props = $props();

	function formatDayChip(date: string): { day: string; month: string } {
		const eventDate = new Date(date);

		return {
			day: eventDate.toLocaleDateString('de-DE', { day: '2-digit' }),
			month: eventDate.toLocaleDateString('de-DE', { month: 'short' })
		};
	}

	function formatEventTime(event: TribeEvent): string {
		if (event.all_day) {
			return 'Ganztägig';
		}

		return new Date(event.start_date).toLocaleTimeString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatEventDate(date: string): string {
		return new Date(date).toLocaleDateString('de-DE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	}
</script>

<Card variant="default" padding="lg" radius="lg">
	<div>
		<Text size="lg" color="muted" as="p">Agenda</Text>
		<Heading level={2} class="mt-2">{heading}</Heading>
	</div>

	{#if events.length > 0}
		<div class="space-y-3 border-t border-border-default pt-4">
			{#each events as event (event.id)}
				{@const chip = formatDayChip(event.start_date)}
				<div class="flex items-start gap-3">
					<div class="flex w-14 shrink-0 flex-col items-center rounded-card border border-border-default bg-surface-subtle px-2 py-2 text-text-default">
						<Text size="xs" weight="medium" tracking="wide" color="muted" as="span" transform="uppercase">{chip.month}</Text>
						<span class="font-display text-[1.25rem] font-semibold leading-none">{chip.day}</span>
					</div>

					<div class="min-w-0 flex-1 space-y-1">
						<Text size="lg" color="muted" as="p">{formatEventDate(event.start_date)} · {formatEventTime(event)}</Text>
						<a
							href={resolve(`/event/${event.id}`)}
							class="block text-[1rem] font-semibold leading-snug text-text-link underline underline-offset-4 transition-colors hover:text-text-default"
						>
							{event.title}
						</a>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="border-t border-border-default pt-4">
			<Text size="base" weight="medium" as="p">Keine Veranstaltungen</Text>
			<Text size="lg" color="muted" as="p" class="mt-2">Für diesen Zeitraum sind aktuell keine Veranstaltungen sichtbar.</Text>
		</div>
	{/if}
</Card>