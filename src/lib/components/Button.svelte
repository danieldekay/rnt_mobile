<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link' = 'primary';
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let tabindex = 0;
  export let leftIcon: string | null = null;
  export let rightIcon: string | null = null;
  export let as: keyof HTMLElementTagNameMap = 'button';
  export let ariaLabel: string | null = null;
  export let ariaDescribedBy: string | null = null;
  export let id: string | null = null;
  export let role: string | null = null;
  export let title: string | null = null;
  export let responsive: boolean = true;
  export let onclick: ((e: MouseEvent) => void) | null = null;

  // Get size classes
  const sizeClasses = {
    sm: responsive ? 'h-9 px-3 text-sm sm:h-10 sm:px-4' : 'h-9 px-3 text-sm',
    md: responsive ? 'h-10 px-4 text-base sm:h-11 sm:px-6' : 'h-10 px-4 text-base',
    lg: responsive ? 'h-11 px-6 text-lg sm:h-12 sm:px-8' : 'h-11 px-6 text-lg',
    xl: responsive ? 'h-12 px-8 text-xl sm:h-14 sm:px-10' : 'h-12 px-8 text-xl',
  };

  // Get variant classes
  const getVariantClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500`;
      
      case 'secondary':
        return `${baseClasses} bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500`;
      
      case 'accent':
        return `${baseClasses} bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500`;
      
      case 'outline':
        return `${baseClasses} border border-border-default bg-transparent text-text-default hover:bg-subtle focus:ring-border-default`;
      
      case 'ghost':
        return `${baseClasses} bg-transparent text-text-default hover:bg-subtle focus:ring-border-default`;
      
      case 'link':
        return `${baseClasses} bg-transparent text-text-link hover:underline focus:ring-text-link`;
      
      default:
        return `${baseClasses} bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500`;
    }
  };

  // Get full width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Handle click
  const handleClick = (e?: MouseEvent) => {
    if (!disabled && !loading) {
      onclick?.(e ?? new MouseEvent('click'));
    }
  };

  // Handle keydown
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(undefined);
    }
  };
</script>

<svelte:element 
  this={as}
  type={type}
  class={`
    ${getVariantClasses()}
    ${sizeClasses[size]}
    ${widthClass}
    rounded-md
    font-medium
    transition-all
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
  `}
  tabindex={tabindex}
  onclick={handleClick}
  onkeydown={handleKeydown}
  disabled={disabled || loading}
  aria-label={ariaLabel}
  aria-describedby={ariaDescribedBy}
  id={id}
  role={role}
  title={title}
>
  {#if loading}
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {:else if leftIcon}
    <span class="mr-2">{leftIcon}</span>
  {/if}

  <slot />

  {#if !loading && rightIcon}
    <span class="ml-2">{rightIcon}</span>
  {/if}
</svelte:element>