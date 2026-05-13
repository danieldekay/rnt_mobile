<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { fetchLegalPage, LEGAL_PAGE_CONFIG, type LegalDocumentPage, type LegalPageKey } from '$lib/api/legal';
	import Card from '$lib/components/Card.svelte';
	import Heading from '$lib/components/Heading.svelte';
	import Text from '$lib/components/Text.svelte';
	import LegalHeader from '$lib/components/LegalHeader.svelte';
	import LegalNav from '$lib/components/LegalNav.svelte';

	const { pageKey } = $props<{ pageKey: LegalPageKey }>();

	let legalPage = $state<LegalDocumentPage | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let contentWithIds = $state('');
	let tocSections = $state<Array<{ id: string; title: string }>>([]);

	const fallback = $derived(LEGAL_PAGE_CONFIG[pageKey as LegalPageKey]);
	const formattedModified = $derived.by(() => {
		if (!legalPage?.modified) return null;
		return new Date(legalPage.modified).toLocaleDateString('de-DE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
			});
	});

	/** Sanitize HTML and inject section IDs for TOC anchors. */
	function sanitizeWithIds(html: string) {
		const sections: Array<{ id: string; title: string }> = [];
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const headings = doc.querySelectorAll('h2, h3');
		headings.forEach((heading) => {
			const text = heading.textContent?.trim() || `heading-${sections.length + 1}`;
			const clean = text
				.toLowerCase()
				.replace(/[^a-z0-9äöüß\s-]/g, '')
				.trim()
				.replace(/\s+/g, '-');
			const id = `section-${clean || `heading-${sections.length + 1}`}`;
			heading.setAttribute('id', id);
			sections.push({ id, title: text });
			});
		return { contentWithIds: doc.body.innerHTML, tocSections: sections };
		}

	$effect(() => {
		if (legalPage) {
			const result = sanitizeWithIds(legalPage.content);
			contentWithIds = result.contentWithIds;
			tocSections = result.tocSections;
			}
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

	function handlePrint() {
		window.print();
		}
</script>

<style>
	.legal-prose {
		line-height: 1.7;
	}
	.legal-prose :global(h2) {
		font-size: 1.4rem;
		font-weight: 600;
		margin-top: 1.5em;
		margin-bottom: 0.5em;
		page-break-after: avoid;
	}
	.legal-prose :global(h3) {
		font-size: 1.15rem;
		font-weight: 600;
		margin-top: 1.2em;
		margin-bottom: 0.4em;
		page-break-after: avoid;
	}
	.legal-prose :global(p),
	.legal-prose :global(ul),
	.legal-prose :global(ol) {
		margin-bottom: 1em;
	}
	.legal-prose :global(img) {
		max-width: 100%;
		height: auto;
	}
	.legal-prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1em;
	}
	.legal-prose :global(th),
	.legal-prose :global(td) {
		padding: 0.5em;
		border: 1px solid var(--color-border-default, #ddd);
	}
	.legal-prose :global(a) {
		color: var(--color-text-default, #1a1a2e);
		text-decoration: underline;
	}
	.legal-print-button {
		display: inline-flex;
	}

	/* Print media queries */
	@media print {
		.legal-header-inline,
		:global(.legal-nav),
		.legal-print-button {
			display: none !important;
		}
			.legal-page {
			background: none !important;
			color: #000 !important;
			}
			.card {
			border: 1px solid #ccc !important;
			box-shadow: none !important;
			break-inside: avoid;
			}
			.legal-prose :global(h2),
			.legal-prose :global(h3) {
			page-break-after: avoid;
			}
			.legal-prose :global(p),
			.legal-prose :global(table),
			.legal-prose :global(img) {
			page-break-inside: avoid;
			}
			.legal-prose {
				max-width: none !important;
			}
		}
</style>

<div class="legal-page">
	{#if loading}
			<div class="mx-auto flex-1 w-full">
				<div class="card flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
					<div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-action-secondary border-t-action-primary"></div>
					<Text size="base" weight="medium" as="p">Lade Rechtsinformationen...</Text>
				</div>
			</div>
	{:else if error}
			<div class="mx-auto flex-1 w-full">
				<article class="space-y-4">
					<div>
						<a href={resolve('/')} class="inline-flex min-h-12 items-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary">
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
							</svg>
						Zurück
						</a>
					</div>
					<section class="card space-y-4 p-5" role="alert" aria-live="polite">
						<Heading level={2}>Rechtsseite nicht verfügbar</Heading>
						<Text size="lg" color="muted" as="p">{error}</Text>
						<div class="flex flex-wrap gap-3">
							<a class="btn-primary" href={fallback.canonicalUrl} target="_blank" rel="noopener noreferrer">
							Auf Originalseite lesen
							</a>
							<a class="btn-secondary" href={resolve('/')}>
							Zur Startseite
							</a>
						</div>
					</section>
				</article>
			</div>
	{:else if legalPage}
			<div class="space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-6 lg:space-y-0">
				<div class="relative w-full">
					<!-- Mobile: inline header with TOC above content -->
					{#if tocSections.length > 1}
						<div class="lg:hidden legal-header-inline mb-4">
							<LegalHeader title={legalPage.title} sections={tocSections} />
						</div>
					{/if}
					<!-- Main content card -->
					<section class="card p-5">
							<div class="space-y-2 border-b border-border-default pb-4">
								<div class="flex items-center justify-between gap-4">
									<Heading level={1} id="legal-title">
										{legalPage.title}
									</Heading>
									<button
									type="button"
									class="legal-print-button flex min-h-12 shrink-0 items-center gap-2 rounded-control border border-border-default bg-surface-card px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-card hover:text-text-default"
									aria-label="Seite drucken oder als PDF speichern"
									onclick={handlePrint}
									>
										<svg class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
										</svg>
									Drucken
									</button>
								</div>
								<p class="meta-text max-w-[42ch]">In-App-Spiegel der rechtlich maßgeblichen Originalseite von Rhein-Neckar-Tango.</p>
								<div class="flex flex-wrap gap-3 text-sm text-text-muted">
									<a href={legalPage.canonicalUrl} target="_blank" rel="noopener noreferrer" class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default">
									Originalseite öffnen
									</a>
									{#if formattedModified}
										<span>Zuletzt aktualisiert: {formattedModified}</span>
									{/if}
								</div>
							</div>
							<!-- Content with injected section IDs for TOC anchors -->
							<div class="legal-prose pt-5">
								{@html contentWithIds}
							</div>
						</section>
				</div>
				
				<aside class="hidden lg:block lg:sticky lg:top-6">
					{#if tocSections.length > 1}
						<LegalNav sections={tocSections} />
					{/if}
				</aside>
			</div>
	{/if}
</div>
