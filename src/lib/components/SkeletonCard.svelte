<script lang="ts">
	import Card from '$lib/components/Card.svelte';

	interface Props {
		/** Layout orientation */
		variant?: 'horizontal' | 'vertical' | 'avatar-list';
		/** Shape of the image placeholder */
		imageShape?: 'square' | 'circle';
		/** Size of the image placeholder */
		imageSize?: 'sm' | 'md' | 'lg' | 'avatar';
		/** Number of text lines below the title */
		lines?: number;
		/** Additional CSS classes */
		class?: string;
	}

	let {
		variant = 'horizontal',
		imageShape = 'square',
		imageSize = 'md',
		lines = 2,
		class: className = ''
	}: Props = $props();

	const sizeMap = {
		sm: 'h-16 w-16',
		md: 'h-24 w-24 sm:h-32 sm:w-32',
		lg: 'h-32 w-32 sm:h-40 sm:w-40',
		avatar: 'h-[4.5rem] w-[4.5rem]'
	};

	const shapeMap = {
		square: 'rounded-card',
		circle: 'rounded-full'
	};
</script>

<Card variant="default" padding="md" radius="lg" class="animate-pulse {className}" role="status" aria-busy="true">
	<div
		class="flex {variant === 'horizontal'
			? 'flex-col gap-4 sm:flex-row'
			: variant === 'avatar-list'
				? 'flex-row items-start gap-4'
				: 'flex-col gap-4'}"
	>
		<!-- Image Placeholder -->
		<div class="shrink-0 bg-surface-subtle {sizeMap[imageSize]} {shapeMap[imageShape]}"></div>

		<!-- Content Placeholder -->
		<div class="flex-1 space-y-3 pt-1">
			<!-- Meta Row -->
			<div class="flex gap-2">
				<div class="h-3 w-16 rounded bg-surface-subtle"></div>
				{#if variant !== 'avatar-list'}
					<div class="h-3 w-20 rounded bg-surface-subtle"></div>
				{/if}
			</div>

			<!-- Title Line -->
			<div class="h-5 w-3/4 rounded bg-surface-subtle"></div>

			<!-- Excerpt/Description Lines -->
			<div class="space-y-2">
				{#each Array.from({ length: lines }) as _, i}
					<div
						class="h-4 rounded bg-surface-subtle"
						style="width: {i === lines - 1 && lines > 1 ? '65%' : '100%'}"
					></div>
				{/each}
			</div>

			<!-- Action Row (usually for horizontal cards) -->
			{#if variant === 'horizontal'}
				<div class="flex gap-2 pt-2">
					<div class="h-9 w-24 rounded-control bg-surface-subtle"></div>
					<div class="h-9 w-20 rounded-control bg-surface-subtle"></div>
				</div>
			{/if}
		</div>
	</div>
</Card>
