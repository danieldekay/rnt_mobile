<script lang="ts">
	import Card from "./Card.svelte";
	import Badge from "./Badge.svelte";
	import { resolve } from "$app/paths";
	import type { EnhancedVenue, VenueNextEventSummary } from "$lib/types";

	let { 
		venue, 
		nextEvents = [],
		responsive = true 
	}: {
		venue: EnhancedVenue;
		nextEvents?: VenueNextEventSummary[];
		responsive?: boolean;
	} = $props();

	// Format address
	function formatAddress() {
		if (!venue.address) return "";
		const parts = [
			venue.city || venue.address.split(",").pop()?.trim() || ""
		].filter(Boolean);
		return parts.join(", ");
	}
</script>

<Card 
	{responsive}
	variant="outlined"
	padding="md"
	role="article"
>
	<div class="venue-info">
		<!-- Name and City -->
		<div class="venue-header">
			<h2 class="venue-name">
				<a
					href={resolve(`/?venue=${venue.id}`)}
					data-sveltekit-preload-data="hover"
					class="transition-colors hover:text-action-primary"
				>
					{venue.venue}
				</a>
			</h2>
			<div class="venue-badges">
				{#if venue.city}
					<Badge variant="muted" size="sm">{venue.city}</Badge>
				{/if}
				{#if venue.upcomingCount !== undefined && venue.upcomingCount > 0}
					<Badge variant="primary" size="sm">{venue.upcomingCount} Termine</Badge>
				{/if}
			</div>
		</div>

		<!-- Next Event -->
		{#if nextEvents.length > 0}
			<div class="next-events">
				<div class="space-y-2 pt-1 border-t border-border-default/50">
					{#each nextEvents.slice(0, 1) as event}
						<a
							href={event.internalPath ? resolve(event.internalPath) : event.externalUrl}
							data-sveltekit-preload-data="hover"
							target={event.externalUrl && !event.internalPath ? "_blank" : undefined}
							rel={event.externalUrl && !event.internalPath ? "noopener noreferrer" : undefined}
							class="block hover:opacity-90 transition-opacity"
						>
							<div class="flex items-start gap-2">
								<svg
									class="h-4 w-4 text-action-primary flex-shrink-0 mt-0.5"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 2-2-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
										clip-rule="evenodd"
									/>
								</svg>
								<div class="flex-1 min-w-0">
									<p
										class="text-sm font-medium leading-snug text-text-default line-clamp-2"
									>
										{event.title}
									</p>
									<p class="text-xs text-text-muted mt-0.5">
										{event.dateLabel}{event.city ? " · " + event.city : ""}
									</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{:else}
			<div class="space-y-2 pt-1 border-t border-amber-200/30">
				<div class="flex items-start gap-2">
					<svg
						class="h-4 w-4 text-amber-600/80 flex-shrink-0 mt-0.5"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0 1 1 0 002 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
							clip-rule="evenodd"
						/>
					</svg>
					<p class="text-sm text-amber-800/80">
						Kein Termin geplant
					</p>
				</div>
			</div>
		{/if}

		<!-- Action Button -->
		<div class="venue-actions">
			<a
				href={resolve(`/?venue=${venue.id}`)}
				data-sveltekit-preload-data="hover"
				class="inline-flex min-h-9 items-center justify-center rounded-control border border-border-default bg-surface-subtle px-3 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary"
			>
				Termine ansehen
			</a>
		</div>
	</div>
</Card>

<style>
	.venue-info {
		flex: 1;
		min-width: 0;
	}

	.venue-header {
		margin-bottom: 0.75rem;
		min-height: 2.5rem;
	}

	.venue-name {
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.25;
		color: var(--text-default);
		margin: 0 0 0.5rem 0;
	}

	.venue-name a {
		color: inherit;
		text-decoration: none;
	}

	.venue-badges {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.venue-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 1rem;
	}

	@media (max-width: 768px) {
		.venue-info {
			text-align: center;
		}
	}
</style>