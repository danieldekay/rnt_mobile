<script lang="ts">
	import Heading from '$lib/components/Heading.svelte';
	import Text from '$lib/components/Text.svelte';

	export let title: string = '';
	export let sections: Array<{ id: string; title: string }> = [];

	$: hasToc = sections.length > 1;
</script>

<header class="space-y-3" aria-labelledby="legal-title">
	<div class="flex items-start justify-between gap-4">
		<div class="space-y-1">
			<Heading level={2} id="legal-title">{title}</Heading>
			<Text size="lg" color="muted" as="p" class="max-w-[42ch]">
				In-App-Spiegel der rechtlich massgeblichen Originalseite von Rhein-Neckar-Tango.
			</Text>
		</div>
		<button
			type="button"
			class="flex min-h-12 shrink-0 items-center gap-2 rounded-control border border-border-default bg-surface-card px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-card hover:text-text-default"
			aria-label="Seite drucken oder als PDF speichern"
			onclick={() => window.print()}
		>
			<svg class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
			</svg>
			Drucken
		</button>
	</div>

	{#if hasToc}
		<nav aria-label="Inhaltsverzeichnis" class="rounded-control border border-border-default bg-surface-subtle p-4">
			<Text size="sm" weight="medium" as="p" class="mb-2">Inhalte</Text>
			<ul class="space-y-1 text-sm">
				{#each sections as section}
					<li>
						<a
							href="#{section.id}"
							class="block py-0.5 text-text-muted transition-colors hover:text-text-default"
							aria-label="Zu {section.title} springen"
						>
							{section.title}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</header>
