<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		onJumpToTop: () => void;
		onLoadMore?: (() => void | Promise<void>) | null;
		canLoadMore?: boolean;
		appendLoading?: boolean;
		appendError?: string | null;
		nextLabel?: string;
	}

	let {
		onJumpToTop,
		onLoadMore = null,
		canLoadMore = false,
		appendLoading = false,
		appendError = null,
		nextLabel = 'Naechste 7 Tage laden'
	}: Props = $props();
</script>

<section class="card mt-6 space-y-4 p-4" aria-label="Listen-Navigation">
	<div class="space-y-2">
		<p class="meta-text">
			{#if canLoadMore}
				Mehr Termine entdecken oder direkt wieder zum Listenanfang springen.
			{:else}
				Schnell zurueck zum Listenanfang springen.
			{/if}
		</p>

		<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
			<button
				type="button"
				onclick={onJumpToTop}
				class="btn-secondary gap-2"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
				</svg>
				<span>Nach oben</span>
			</button>

			{#if canLoadMore && onLoadMore}
				<button
					type="button"
					onclick={onLoadMore}
					disabled={appendLoading}
					class="btn-primary gap-2 disabled:opacity-50"
				>
					<svg class="h-4 w-4 {appendLoading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
					<span>{appendLoading ? 'Laedt...' : nextLabel}</span>
				</button>
			{/if}
		</div>
	</div>

	<div class="rounded-control border border-border-default bg-surface-subtle p-3">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="text-sm font-medium text-text-default">Daten & Hilfe</p>
				<p class="mt-1 text-xs leading-relaxed text-text-muted">
					Wenn die Liste alt wirkt oder nicht laedt, pruefe den App-Status oder repariere die lokale App-Datenhaltung.
				</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<a class="btn-secondary min-h-10 px-3 py-2 text-sm" href={resolve('/app-status')}>
					App-Status
				</a>
				<a class="btn-secondary min-h-10 px-3 py-2 text-sm" href={resolve('/recovery')}>
					Reparatur
				</a>
			</div>
		</div>
	</div>

	{#if appendError && onLoadMore}
		<div class="space-y-2" role="status" aria-live="polite">
			<p class="text-sm font-medium text-[var(--color-danger-700,#b91c1c)]">{appendError}</p>
			<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
				<button
					type="button"
					onclick={onLoadMore}
					class="btn-secondary"
				>
					Erneut laden
				</button>
				<a class="btn-secondary" href={resolve('/recovery')}>Reparaturhinweise</a>
			</div>
		</div>
	{/if}
</section>