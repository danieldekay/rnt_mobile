<script lang="ts">
  export let level: 1 | 2 | 3 | 4 | 5 | 6 = 1;
  export let size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | null = null;
  export let weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'semibold';
  export let lineHeight: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose' = 'tight';
  export let color: 'default' | 'muted' | 'subtle' | 'inverse' | 'link' = 'default';
  export let tracking: 'tight' | 'normal' | 'wide' = 'normal';
  export let transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize' = 'none';
  export let truncate = false;
  export let as: keyof HTMLElementTagNameMap = 'h1';
  export let id: string | null = null;
  export let role: string | null = null;
  export let responsive: boolean = true;

  // Get size classes based on level or explicit size
  const getSizeClasses = () => {
    if (size) {
      switch (size) {
        case 'xs': return responsive ? 'text-xs sm:text-sm' : 'text-xs';
        case 'sm': return responsive ? 'text-sm sm:text-base' : 'text-sm';
        case 'base': return responsive ? 'text-base sm:text-lg' : 'text-base';
        case 'lg': return responsive ? 'text-lg sm:text-xl' : 'text-lg';
        case 'xl': return responsive ? 'text-xl sm:text-2xl' : 'text-xl';
        case '2xl': return responsive ? 'text-2xl sm:text-3xl' : 'text-2xl';
        case '3xl': return responsive ? 'text-3xl sm:text-4xl' : 'text-3xl';
        case '4xl': return responsive ? 'text-4xl sm:text-5xl' : 'text-4xl';
        case '5xl': return responsive ? 'text-5xl sm:text-6xl' : 'text-5xl';
        case '6xl': return responsive ? 'text-6xl' : 'text-6xl';
      }
    }
    
    // Default sizes based on heading level
    switch (level) {
      case 1: return responsive ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl' : 'text-4xl';
      case 2: return responsive ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl' : 'text-3xl';
      case 3: return responsive ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl';
      case 4: return responsive ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl';
      case 5: return responsive ? 'text-base sm:text-lg md:text-xl' : 'text-lg';
      case 6: return responsive ? 'text-sm sm:text-base md:text-lg' : 'text-base';
      default: return responsive ? 'text-xl sm:text-2xl' : 'text-xl';
    }
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

  // Get truncate class
  const truncateClass = truncate ? 'truncate' : '';

  // Combine all classes
  const classes = `
    ${getSizeClasses()}
    ${weightClasses[weight]}
    ${lineHeightClasses[lineHeight]}
    ${colorClasses[color]}
    ${trackingClasses[tracking]}
    ${transformClasses[transform]}
    ${truncateClass}
    font-sans
    ${'class' in $$props ? $$props.class : ''}
  `;

  // Set the element type based on level
  const getElement = () => {
    if (as !== 'h1' && as !== 'h2' && as !== 'h3' && as !== 'h4' && as !== 'h5' && as !== 'h6') {
      // Use the specified element type
      return as;
    }
    // Use the heading level as the element type
    return `h${level}`;
  };
</script>

<svelte:element 
  this={getElement()}
  class={classes}
  id={id}
  role={role}
>
  <slot />
</svelte:element>