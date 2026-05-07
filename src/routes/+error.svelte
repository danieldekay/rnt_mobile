<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { trackError } from '$lib/matomo';

	let { error, status } = $props<{ error: Error & { message?: string }; status: number }>();

	onMount(() => {
		trackError('component-error', error?.message ?? 'Unbekannter Fehler', {
			status: String(status),
			context: 'error_page'
		});
	});
</script>

<svelte:head>
	<title>{status} - Fehler - RNT Kalender</title>
</svelte:head>

<section class="card space-y-4 p-5" role="alert">
	<p class="font-display text-[1.5rem] font-semibold text-text-default">Ein Fehler ist aufgetreten</p>
	<p class="meta-text">{error?.message ?? 'Die Seite konnte nicht geladen werden.'}</p>
	<a href={resolve('/')} class="btn-primary inline-flex w-fit min-h-12 items-center justify-center">
		Zur Startseite
	</a>
</section>