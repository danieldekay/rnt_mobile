<script lang="ts">
  export let variant: 'default' | 'elevated' | 'outlined' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  export let shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  export let borderColor: string | null = null;
  export let background: string | null = null;
  export let as: keyof HTMLElementTagNameMap = 'div';
  export let tabindex = 0;
  export let role: string | null = null;
  export let ariaLabel: string | null = null;
  export let ariaDescribedBy: string | null = null;
  export let ariaHidden = false;
  export let id: string | null = null;
  export let title: string | null = null;
  export let responsive: boolean = true;
  export let onclick: ((e: MouseEvent) => void) | null = null;

  // Get padding classes
  const paddingClasses = responsive
    ? {
        none: '',
        sm: 'p-2 sm:p-3 md:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8',
        xl: 'p-8 sm:p-10',
      }[padding]
    : {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      }[padding];

  // Get radius classes
  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };
  const radiusClasses = radiusMap[radius];

  // Get shadow classes
  const shadowMap: Record<string, string> = {
    none: '',
    sm: responsive ? 'shadow-sm hover:shadow-md' : 'shadow-sm',
    md: responsive ? 'shadow-md hover:shadow-lg' : 'shadow-md',
    lg: responsive ? 'shadow-lg hover:shadow-xl' : 'shadow-lg',
    xl: responsive ? 'shadow-xl hover:shadow-2xl' : 'shadow-xl',
    '2xl': responsive ? 'shadow-2xl' : 'shadow-2xl',
  };
  const shadowClasses = shadowMap[shadow];

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-card shadow-lg hover:shadow-xl transition-shadow duration-200';
      case 'outlined':
        return 'bg-card border border-border-default';
      default:
        return 'bg-card shadow-md';
    }
  };

  // Get custom styles
  const getCustomStyles = () => {
    const styles: string[] = [];
    
    if (borderColor) {
      styles.push(`border-color: var(--${borderColor})`);
    }
    
    if (background) {
      styles.push(`background-color: var(--${background})`);
    }
    
    return styles.length > 0 ? styles.join(';') : undefined;
  };
</script>

<svelte:element 
  this={as}
  class={`
    ${getVariantClasses()}
    ${paddingClasses}
    ${radiusClasses}
    ${shadowClasses}
    focus:outline-none
    focus:ring-2
    focus:ring-focus-ring
    focus:ring-offset-2
    transition-all duration-200
    w-full
    ${'class' in $$props ? $$props.class : ''}
  `}
  style={getCustomStyles()}
  tabindex={tabindex}
  role={role ?? undefined}
  aria-label={ariaLabel ?? undefined}
  aria-describedby={ariaDescribedBy ?? undefined}
  aria-hidden={ariaHidden || undefined}
  id={id ?? undefined}
  title={title ?? undefined}
  onclick={onclick ?? undefined}
>
  <slot />
</svelte:element>