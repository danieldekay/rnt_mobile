<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { fetchLegalPage, LEGAL_PAGE_CONFIG, type LegalDocumentPage, type LegalPageKey } from '$lib/api/legal';

	let { pageKey }: { pageKey: LegalPageKey } = $props();

	let legalPage = $state<LegalDocumentPage | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const fallback = $derived(LEGAL_PAGE_CONFIG[pageKey]);
	const formattedModified = $derived.by(() => {
		if (!legalPage?.modified) return null;
		return new Date(legalPage.modified).toLocaleDateString('de-DE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	});

	onMount(async () => {
		loading = true;
		error = null;

		try {
			legalPage = await fetchLegalPage(pageKey);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Die Rechtsseite konnte nicht geladen werden.';
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<div class="card flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
		<div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-action-secondary border-t-action-primary"></div>
		<p class="text-[1rem] font-medium text-text-default">Lade Rechtsinformationen…</p>
	</div>
{:else if error}
	<div class="card space-y-4 p-5" role="alert">
		<p class="font-display text-[1.5rem] font-semibold text-text-default">Rechtsseite nicht verfuegbar</p>
		<p class="meta-text">{error}</p>
		<div class="flex flex-wrap gap-3">
			<a class="btn-primary" href={fallback.canonicalUrl} target="_blank" rel="noopener noreferrer">
				Auf Originalseite lesen
			</a>
			<a class="btn-secondary" href={resolve('/')}>
				Zur Startseite
			</a>
		</div>
	</div>
{:else if legalPage}
	<article class="space-y-4">
		<div>
			<a href={resolve('/')} class="inline-flex min-h-12 items-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
				Zurueck
			</a>
		</div>

		<section class="card p-5">
			<div class="space-y-2 border-b border-border-default pb-4">
				<h1 class="font-display text-[2rem] font-semibold text-text-default">{legalPage.title}</h1>
				<p class="meta-text max-w-[42ch]">In-App-Spiegel der rechtlich massgeblichen Originalseite von Rhein-Neckar-Tango.</p>
				<div class="flex flex-wrap gap-3 text-sm text-text-muted">
					<a href={legalPage.canonicalUrl} target="_blank" rel="noopener noreferrer" class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default">
						Originalseite oeffnen
					</a>
					{#if formattedModified}
						<span>Zuletzt aktualisiert: {formattedModified}</span>
					{/if}
				</div>
			</div>
			<div class="legal-prose pt-5">
				{@html legalPage.content}
			</div>
		</section>
	</article>
{/if}