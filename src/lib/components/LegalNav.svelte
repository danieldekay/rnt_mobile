<script lang="ts">
	/** @type {Array<{ id: string; title: string }>} */
	export let sections: Array<{ id: string; title: string }> = [];
</script>

<nav aria-label="Inhaltsverzeichnis" class="legal-nav sticky top-[60px] z-40 max-h-[50vh] overflow-y-auto rounded-control border border-border-default bg-surface-canvas/95 p-4 backdrop-blur-sm">
	<p class="mb-2 text-sm font-medium text-text-default">Inhalte</p>
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

<style>
	.legal-nav a:target {
		scroll-margin-top: 70px;
	}
</style>
