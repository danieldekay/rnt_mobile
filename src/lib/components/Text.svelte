<script lang="ts">
  export let size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' = 'base';
  export let weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular';
  export let lineHeight: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose' = 'normal';
  export let color: 'default' | 'muted' | 'subtle' | 'inverse' | 'link' = 'default';
  export let tracking: 'tight' | 'normal' | 'wide' = 'normal';
  export let transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize' = 'none';
  export let truncate = false;
  export let wrap = true;
  export let as: keyof HTMLElementTagNameMap = 'p';
  export let id: string | null = null;
  export let role: string | null = null;
  export let responsive: boolean = true;

  // Get size classes
  const sizeClasses = {
    xs: responsive ? 'text-xs sm:text-sm' : 'text-xs',
    sm: responsive ? 'text-sm sm:text-base' : 'text-sm',
    base: responsive ? 'text-base sm:text-lg' : 'text-base',
    lg: responsive ? 'text-lg sm:text-xl' : 'text-lg',
    xl: responsive ? 'text-xl sm:text-2xl' : 'text-xl',
    '2xl': responsive ? 'text-2xl sm:text-3xl' : 'text-2xl',
    '3xl': responsive ? 'text-3xl sm:text-4xl' : 'text-3xl',
    '4xl': responsive ? 'text-4xl sm:text-5xl' : 'text-4xl',
    '5xl': responsive ? 'text-5xl sm:text-6xl' : 'text-5xl',
    '6xl': responsive ? 'text-6xl' : 'text-6xl',
  };

  // Get weight classes
  const weightClasses = {
    regular: 'font-regular',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  // Get line height classes
  const lineHeightClasses = {
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  // Get color classes
  const colorClasses = {
    default: 'text-text-default',
    muted: 'text-text-muted',
    subtle: 'text-text-subtle',
    inverse: 'text-text-inverse',
    link: 'text-text-link',
  };

  // Get tracking classes
  const trackingClasses = {
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
  };

  // Get transform classes
  const transformClasses = {
    none: '',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
  };

  // Get wrap class
  const wrapClass = wrap ? 'whitespace-normal' : 'whitespace-nowrap';

  // Get truncate class
  const truncateClass = truncate ? 'truncate' : '';

  // Combine all classes
  const classes = `
    ${sizeClasses[size]}
    ${weightClasses[weight]}
    ${lineHeightClasses[lineHeight]}
    ${colorClasses[color]}
    ${trackingClasses[tracking]}
    ${transformClasses[transform]}
    ${wrapClass}
    ${truncateClass}
    font-sans
    ${'class' in $$props ? $$props.class : ''}
  `;
</script>

<svelte:element 
  this={as}
  class={classes}
  id={id}
  role={role}
>
  <slot />
</svelte:element>