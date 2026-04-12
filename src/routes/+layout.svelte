<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
		<div class="max-w-lg mx-auto px-4 py-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
						<span class="text-white text-lg font-bold">R</span>
					</div>
					<div>
						<h1 class="font-bold text-gray-900">RNT Kalender</h1>
						<p class="text-xs text-gray-400">Rhein-Neckar-Tango</p>
					</div>
				</div>
				
				<nav class="flex items-center gap-2">
					<a href="/" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Event Liste">
						<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
						</svg>
					</a>
					<a href="/calendar" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Kalender">
						<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
						</svg>
					</a>
				</nav>
			</div>
		</div>
	</header>

	<!-- Main content -->
	<main class="flex-1 max-w-lg mx-auto w-full px-4 py-4">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-100 py-4 mt-auto">
		<div class="max-w-lg mx-auto px-4 text-center">
			<p class="text-xs text-gray-400">
				<a href="https://www.rhein-neckar-tango.de" target="_blank" rel="noopener noreferrer" class="hover:text-primary-500 transition-colors">
					rhein-neckar-tango.de
				</a>
			</p>
		</div>
	</footer>
</div>
