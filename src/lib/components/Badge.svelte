<script lang="ts">
  // Badge props
  export let variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'muted' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let shape: 'rounded' | 'pill' | 'square' = 'rounded';
  export let icon: string | null = null;
  export let iconPosition: 'left' | 'right' = 'left';
  export let dismissible = false;
  export let as: keyof HTMLElementTagNameMap = 'span';
  export let id: string | null = null;
  export let role: string | null = null;
  export let title: string | null = null;
  export let responsive: boolean = true;
  
  // Derived classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary': return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'secondary': return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      case 'accent': return 'bg-accent-100 text-accent-800 border-accent-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'muted': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    const baseSize = responsive ? 'inline-flex items-center justify-center' : 'inline-flex items-center justify-center';
    
    switch (size) {
      case 'sm': return responsive ? `${baseSize} px-2 py-1 text-xs` : `${baseSize} px-2 py-1 text-xs`;
      case 'md': return responsive ? `${baseSize} px-2.5 py-1.5 text-sm` : `${baseSize} px-2.5 py-1.5 text-sm`;
      case 'lg': return responsive ? `${baseSize} px-3 py-2 text-base` : `${baseSize} px-3 py-2 text-base`;
      default: return responsive ? `${baseSize} px-2.5 py-1.5 text-sm` : `${baseSize} px-2.5 py-1.5 text-sm`;
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'rounded': return 'rounded-md';
      case 'pill': return 'rounded-full';
      case 'square': return 'rounded-none';
      default: return 'rounded-md';
    }
  };

  const getBorderClasses = () => {
    return 'border';
  };

  // Event handlers
  let dismissibleInstance: any = null;
  
  const handleClick = (e: MouseEvent) => {
    if (dismissible) {
      e.preventDefault();
      dispatch('dismiss');
    }
  };

  const dispatch = (name: string, detail?: any) => {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      detail
    });
    dispatchEvent(event);
  };
</script>

<svelte:element
  this={as}
  id={id}
  role={role}
  title={title}
  class={getVariantClasses() + ' ' + getSizeClasses() + ' ' + getShapeClasses() + ' ' + getBorderClasses() + (dismissible ? ' cursor-pointer hover:opacity-80 transition-opacity' : '')}
  on:click={handleClick}
>
  {#if icon}
    <span class={iconPosition === 'left' ? 'mr-1' : 'ml-1'}>
      {icon}
    </span>
  {/if}

  <slot></slot>

  {#if dismissible}
    <svg 
      class="ml-1 h-3 w-3 flex-shrink-0" 
      fill="currentColor" 
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fill-rule="evenodd" 
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
        clip-rule="evenodd"
      />
    </svg>
  {/if}
</svelte:element>