<script lang="ts">
	let {
		hasUpdate,
		checking,
		checkError,
		recoveryOpen,
		onApply,
		onToggleRecovery,
		onManualCheck
	}: {
		hasUpdate: boolean;
		checking: boolean;
		checkError: string | null;
		recoveryOpen: boolean;
		onApply: () => void;
		onToggleRecovery: () => void;
		onManualCheck: () => void;
	} = $props();
</script>

{#if hasUpdate || checkError}
	<section class="card border border-border-accent bg-surface-card p-5 shadow-card" aria-live="polite">
		<div class="space-y-3 text-left">
			<div class="space-y-1">
				<p class="font-display text-[1.4rem] font-semibold text-text-default">
					{hasUpdate ? 'Update bereit' : 'Update-Prüfung fehlgeschlagen'}
				</p>
				<p class="meta-text">
					{#if hasUpdate}
						Eine neuere App-Version ist verfügbar. Du kannst sie direkt aus der installierten App laden.
					{:else}
						{checkError ?? 'Die App bleibt nutzbar, aber der Update-Status konnte gerade nicht bestätigt werden.'}
					{/if}
				</p>
			</div>

			<div class="flex flex-wrap gap-3">
				{#if hasUpdate}
					<button class="btn-primary" type="button" onclick={onApply}>
						Jetzt aktualisieren
					</button>
				{:else}
					<button class="btn-secondary" type="button" onclick={onManualCheck} disabled={checking}>
						{checking ? 'Prüfe…' : 'Erneut prüfen'}
					</button>
				{/if}
				<button class="btn-secondary" type="button" onclick={onToggleRecovery}>
					{recoveryOpen ? 'Hinweise ausblenden' : 'Wenn die alte Ansicht bleibt'}
				</button>
			</div>

			{#if recoveryOpen}
				<div class="rounded-control border border-border-default bg-surface-subtle p-4">
					<p class="meta-text font-medium text-text-default">Wenn die installierte App noch alt aussieht:</p>
					<ol class="mt-2 list-decimal space-y-1 pl-5 text-sm text-text-muted">
						<li>App komplett schließen.</li>
						<li>Vom Home-Bildschirm erneut öffnen.</li>
						<li>Falls nötig die Seite einmal direkt im Browser neu laden.</li>
					</ol>
				</div>
			{/if}
		</div>
	</section>
{/if}