<script lang="ts">
	import { onMount } from "svelte";

	let retrying = $state(false);

	async function retry() {
		if (retrying) return;
		retrying = true;
		try {
			// Try a lightweight fetch to verify connectivity
			const resp = await fetch("/api/wp-auth-status", {
				method: "HEAD",
				cache: "no-store",
			});
			if (resp.ok || resp.status === 401) {
				// Site is reachable, reload
				window.location.reload();
			} else {
				// Server error, stay offline
				retrying = false;
			}
		} catch {
			retrying = false;
		}
	}

	onMount(() => {
		// Listen for online event to auto-recover
		const handleOnline = () => {
			window.location.reload();
		};
		window.addEventListener("online", handleOnline);
		return () => window.removeEventListener("online", handleOnline);
	});
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
	<div class="mb-6 text-6xl" aria-hidden="true">📡</div>
	<h1 class="font-display text-2xl font-semibold text-text-default mb-2">
		Offline — Keine Verbindung
	</h1>
	<p class="text-text-subtle mb-6 max-w-md">
		Du bist derzeit offline. Überprüfe deine Internetverbindung und versuche es erneut.
	</p>
	<button
		onclick={retry}
		disabled={retrying}
		type="button"
		class="btn-primary min-h-12"
		aria-label="Erneut versuchen"
	>
		{retrying ? "Prüfe Verbindung…" : "Erneut versuchen"}
	</button>
</div>
