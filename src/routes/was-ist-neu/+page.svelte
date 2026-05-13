<script lang="ts">
	import { resolve } from '$app/paths';
	import { releaseNotes } from '$lib/content/release-notes';

	const formattedReleaseNotes = releaseNotes.map((entry) => ({
		...entry,
		formattedDate: new Date(entry.releasedAt).toLocaleDateString('de-DE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}));
</script>

<svelte:head>
	<title>Was ist neu? - RNT Kalender</title>
	<meta
		name="description"
		content="Versionshinweise und neue Funktionen des RNT Kalenders in deutscher Sprache."
	/>
</svelte:head>

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
			<h1 class="font-display text-[2rem] font-semibold text-text-default">Was ist neu?</h1>
			<p class="meta-text max-w-[48ch]">
				Hier findest du die laufenden Release-Notizen des RNT Kalenders. Neue Versionen stehen oben.
			</p>
			<div class="flex flex-wrap gap-3 text-sm text-text-muted">
				<span>Aktuelle App-Version: {__APP_VERSION__}</span>
				<span>Historie wird fortlaufend erweitert.</span>
			</div>
		</div>

		<div class="space-y-4 pt-5">
			{#each formattedReleaseNotes as note (note.version)}
				<section class="rounded-card border border-border-default bg-surface-subtle p-4 sm:p-5">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="space-y-1">
							<p class="font-display text-[1.35rem] font-semibold text-text-default">Version {note.version}</p>
							<p class="text-sm font-medium text-text-default">{note.headline}</p>
						</div>
						<span class="inline-flex min-h-10 items-center rounded-badge border border-border-default bg-surface-card px-3 py-1 text-sm font-medium text-text-default">
							{note.formattedDate}
						</span>
					</div>
					<p class="meta-text mt-3 max-w-[52ch]">{note.summary}</p>
					<ul class="mt-4 space-y-2 text-sm text-text-default">
						{#each note.highlights as highlight (`${note.version}-${highlight}`)}
							<li class="flex items-start gap-3">
								<span class="mt-[0.42rem] h-2 w-2 shrink-0 rounded-full bg-action-primary"></span>
								<span>{highlight}</span>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	</section>
</article>