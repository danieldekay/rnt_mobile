<script lang="ts">
  // Avatar props
  export let src: string | null = null;
  export let alt: string = '';
  export let name: string | null = null;
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let shape: 'circle' | 'square' = 'circle';
  export let variant: 'image' | 'initials' | 'icon' = 'image';
  export let icon: string | null = null;
  export let status: 'online' | 'offline' | 'busy' | 'away' | null = null;
  export let statusPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right';
  export let fallback: 'initials' | 'icon' | 'skeleton' = 'initials';
  export let as: keyof HTMLElementTagNameMap = 'div';
  export let id: string | null = null;
  export let role: string | null = null;
  export let title: string | null = null;
  export let responsive: boolean = true;
  
  // Derived classes
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return responsive ? 'w-6 h-6 text-xs' : 'w-6 h-6 text-xs';
      case 'sm': return responsive ? 'w-8 h-8 text-sm' : 'w-8 h-8 text-sm';
      case 'md': return responsive ? 'w-10 h-10 text-base' : 'w-10 h-10 text-base';
      case 'lg': return responsive ? 'w-12 h-12 text-lg' : 'w-12 h-12 text-lg';
      case 'xl': return responsive ? 'w-16 h-16 text-xl' : 'w-16 h-16 text-xl';
      default: return responsive ? 'w-10 h-10 text-base' : 'w-10 h-10 text-base';
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'circle': return 'rounded-full';
      case 'square': return 'rounded-md';
      default: return 'rounded-full';
    }
  };

  const getInitials = () => {
    if (!name) return '';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return '';
    }
  };

  const getStatusSize = () => {
    switch (size) {
      case 'xs': return 'w-1.5 h-1.5';
      case 'sm': return 'w-2 h-2';
      case 'md': return 'w-2.5 h-2.5';
      case 'lg': return 'w-3 h-3';
      case 'xl': return 'w-3.5 h-3.5';
      default: return 'w-2.5 h-2.5';
    }
  };

  const getStatusPositionClasses = () => {
    switch (statusPosition) {
      case 'bottom-right': return 'bottom-0 right-0';
      case 'bottom-left': return 'bottom-0 left-0';
      case 'top-right': return 'top-0 right-0';
      case 'top-left': return 'top-0 left-0';
      default: return 'bottom-0 right-0';
    }
  };

  // Error handling for image loading
  let imageError = false;
  
  const handleImageError = () => {
    imageError = true;
  };
</script>

<svelte:element
  this={as}
  id={id}
  role={role}
  title={title}
  class={getSizeClasses() + ' ' + getShapeClasses() + ' relative flex-shrink-0 overflow-hidden bg-gray-100 text-gray-600 font-medium'}
>
  {#if src && variant === 'image' && !imageError}
    <img 
      src={src} 
      alt={alt || name || 'Avatar'} 
      class="w-full h-full object-cover"
      on:error={handleImageError}
    />
  {:else if variant === 'icon' && icon}
    <span class="w-full h-full flex items-center justify-center">
      {icon}
    </span>
  {:else if variant === 'initials' || (fallback === 'initials' && (name || (!src && !icon)))}
    <span class="w-full h-full flex items-center justify-center">
      {getInitials()}
    </span>
  {:else if fallback === 'skeleton'}
    <div class="w-full h-full bg-gray-200 animate-pulse"></div>
  {:else}
    <span class="w-full h-full flex items-center justify-center">
      {getInitials()}
    </span>
  {/if}

  {#if status}
    <div 
      class={getStatusPositionClasses() + ' absolute ' + getStatusSize() + ' ' + getStatusClasses() + ' border-2 border-white'}
    ></div>
  {/if}
</svelte:element>