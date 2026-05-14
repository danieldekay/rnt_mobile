<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	type NavItem = {
		label: string;
		href: string;
		match: 'exact' | 'prefix';
	};

	type ExternalNavItem = {
		label: string;
		href: string;
	};

	type WordPressStatus = {
		checked: boolean;
		loggedIn: boolean;
		available: boolean;
		message: string;
		loginUrl: string;
		adminUrl: string;
	};

	const WORDPRESS_ORIGIN = 'https://www.rhein-neckar-tango.de';
	const WORDPRESS_ADMIN_URL = `${WORDPRESS_ORIGIN}/wp-admin/`;
	const DEFAULT_WORDPRESS_LOGIN_URL = `${WORDPRESS_ORIGIN}/wp-login.php?redirect_to=${encodeURIComponent(WORDPRESS_ADMIN_URL)}`;
	const WORDPRESS_STATUS_API = '/api/wp-auth-status';

	const navItems: NavItem[] = [
		{ label: 'Veranstaltungen', href: '/', match: 'exact' },
		{ label: 'Kalender', href: '/kalender', match: 'prefix' },
		{ label: 'News', href: '/blog', match: 'prefix' },
		{ label: 'Ankuendigungen', href: '/ankuendigungen', match: 'prefix' },
		{ label: 'DJs', href: '/djs', match: 'prefix' },
		{ label: 'Veranstalter', href: '/veranstalter', match: 'prefix' },
		{ label: 'Tanzraeume', href: '/tanzraeume', match: 'prefix' },
		{ label: 'Links', href: '/links', match: 'prefix' }
	];

	const footerLinks = [
		{ label: 'Impressum', href: '/impressum' },
		{ label: 'Datenschutz', href: '/datenschutz' },
		{ label: 'Cookie-Richtlinie', href: '/cookie-richtlinie' },
		{ label: 'Einwilligung', href: '/datenschutz#einwilligung' }
	];

	const wordpressPageLinks: ExternalNavItem[] = [
		{ label: 'Ankuendigungen', href: `${WORDPRESS_ORIGIN}/wp-admin/edit.php?post_type=ankuendigung` },
		{ label: 'Veranstaltungen', href: `${WORDPRESS_ORIGIN}/wp-admin/edit.php?post_type=tribe_events` },
		{ label: 'Veranstalter', href: `${WORDPRESS_ORIGIN}/wp-admin/edit.php?post_type=tribe_organizer` },
		{ label: 'Tanzraeume', href: `${WORDPRESS_ORIGIN}/wp-admin/edit.php?post_type=tribe_venue` }
	];

	let wordpressStatus = $state<WordPressStatus>({
		checked: false,
		loggedIn: false,
		available: true,
		message: 'WordPress-Status wird geprueft.',
		loginUrl: DEFAULT_WORDPRESS_LOGIN_URL,
		adminUrl: WORDPRESS_ADMIN_URL
	});

	const wordpressStatusLabel = $derived.by(() => {
		if (!wordpressStatus.checked) return 'WordPress-Status wird geprueft';
		if (!wordpressStatus.available) return 'WordPress-Status nicht verfuegbar';
		return wordpressStatus.loggedIn ? 'Bei WordPress eingeloggt' : 'Nicht bei WordPress eingeloggt';
	});

	const wordpressStatusClass = $derived.by(() => {
		if (!wordpressStatus.checked) {
			return 'border-border-default bg-surface-subtle text-text-muted';
		}

		if (!wordpressStatus.available) {
			return 'border-border-default bg-surface-subtle text-text-muted';
		}

		return wordpressStatus.loggedIn
			? 'border-action-primary/35 bg-action-secondary text-text-default'
			: 'border-border-default bg-surface-subtle text-text-muted';
	});

	onMount(async () => {
		try {
			const response = await fetch(WORDPRESS_STATUS_API, {
				method: 'GET',
				headers: {
					accept: 'application/json'
				},
				credentials: 'include'
			});

			const payload = (await response.json().catch(() => null)) as
				| {
					loggedIn?: boolean;
					available?: boolean;
					message?: string;
					loginUrl?: string;
					adminUrl?: string;
				}
				| null;

			wordpressStatus = {
				checked: true,
				loggedIn: payload?.loggedIn === true,
				available: payload?.available !== false,
				message:
					typeof payload?.message === 'string' && payload.message.length > 0
						? payload.message
						: 'WordPress-Status nicht verfuegbar.',
				loginUrl: payload?.loginUrl ?? DEFAULT_WORDPRESS_LOGIN_URL,
				adminUrl: payload?.adminUrl ?? WORDPRESS_ADMIN_URL
			};
		} catch {
			wordpressStatus = {
				checked: true,
				loggedIn: false,
				available: false,
				message: 'WordPress-Status nicht verfuegbar.',
				loginUrl: DEFAULT_WORDPRESS_LOGIN_URL,
				adminUrl: WORDPRESS_ADMIN_URL
			};
		}
	});

	function toHref(href: string): string {
		return resolve(href as any);
	}

	function isActive(item: NavItem): boolean {
		if (item.match === 'exact') {
			return $page.url.pathname === item.href;
		}

		return $page.url.pathname === item.href || $page.url.pathname.startsWith(`${item.href}/`);
	}
</script>

<aside
	class="hidden lg:flex lg:flex-col border-r border-border-default bg-surface-card text-text-default lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto"
	style="width: var(--desktop-sidebar-width);"
>
	<div class="flex flex-1 flex-col px-4 py-6">
		<a
			href={resolve('/')}
			class="flex items-center gap-3 rounded-control border border-border-default bg-surface-canvas px-4 py-3 transition-colors hover:bg-action-secondary"
			aria-label="RNT Kalender Startseite"
		>
			<div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-border-default bg-surface-card shadow-card">
				<img
					src="/rnt-logo.png"
					alt=""
					class="h-full w-full object-contain"
					loading="eager"
					decoding="async"
				/>
			</div>
			<div class="min-w-0">
				<p class="font-display text-[1.25rem] font-semibold text-text-default truncate">RNT Kalender</p>
				<p class="text-[0.8125rem] text-text-muted truncate">Rhein-Neckar-Tango</p>
			</div>
		</a>

		<nav class="mt-6 flex flex-col gap-2" aria-label="Desktop Navigation">
			{#each navItems as item (item.href)}
				{@const active = isActive(item)}
				<a
					href={toHref(item.href)}
					aria-current={active ? 'page' : undefined}
					class={`inline-flex min-h-11 items-center rounded-control border-l-4 px-3 py-2 text-[0.95rem] transition-colors ${
						active
							? 'border-action-primary bg-surface-subtle text-text-default'
							: 'border-transparent text-text-muted hover:bg-action-secondary hover:text-text-default'
					}`}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<section class="mt-6 border-t border-border-default pt-4" aria-labelledby="wordpress-section-heading">
			<div class="px-2">
				<p id="wordpress-section-heading" class="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-text-muted">
					WordPress
				</p>
				<div class={`mt-2 rounded-control border px-3 py-2 text-[0.8125rem] ${wordpressStatusClass}`}>
					<p class="font-medium">{wordpressStatusLabel}</p>
					<p class="mt-1 text-[0.75rem] opacity-80">{wordpressStatus.message}</p>
				</div>
			</div>

			<div class="mt-3 flex flex-col gap-2">
				<a
					href={wordpressStatus.loggedIn ? wordpressStatus.adminUrl : wordpressStatus.loginUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex min-h-11 items-center rounded-control border border-border-default px-3 py-2 text-[0.95rem] font-medium text-text-default transition-colors hover:bg-action-secondary"
				>
					{wordpressStatus.loggedIn ? 'WP Admin' : 'WP Login'}
				</a>

				<nav class="flex flex-col gap-2" aria-label="WordPress Seiten">
					{#each wordpressPageLinks as link (link.href)}
						<a
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							class="rounded-control px-2 py-1 text-sm text-text-muted transition-colors hover:bg-action-secondary hover:text-text-default"
						>
							{link.label}
						</a>
					{/each}
				</nav>
			</div>
		</section>

		<div class="mt-auto border-t border-border-default pt-4">
			<nav class="flex flex-col gap-2" aria-label="Rechtliches">
				{#each footerLinks as link (link.href)}
					<a
						href={toHref(link.href)}
						class="rounded-control px-2 py-1 text-sm text-text-muted transition-colors hover:bg-action-secondary hover:text-text-default"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
	</div>
</aside>