<script lang="ts">
	import { onMount } from "svelte";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import { mapHubPageSeo } from "$lib/seo/pages";

	const seo = mapHubPageSeo("offline");

	let retrying = $state(false);

	async function retry() {
		if (retrying) return;
		retrying = true;
		try {
			const resp = await fetch("/api/wp-auth-status", {
				method: "HEAD",
				cache: "no-store",
			});
			if (resp.ok || resp.status === 401) {
				window.location.reload();
			} else {
				retrying = false;
			}
		} catch {
			retrying = false;
		}
	}

	onMount(() => {
		const handleOnline = () => {
			window.location.reload();
		};
		window.addEventListener("online", handleOnline);
		return () => window.removeEventListener("online", handleOnline);
	});
</script>

<SeoHead {seo} />

<div class="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
	<section class="card max-w-md space-y-4 p-8">
		<div
			class="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border-default bg-surface-subtle text-text-muted"
			aria-hidden="true"
		>
			<svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
				/>
			</svg>
		</div>
		<h1 class="font-display text-2xl font-semibold text-text-default">
			Offline — Keine Verbindung
		</h1>
		<p class="meta-text">
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
	</section>
</div>
