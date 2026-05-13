<script lang="ts">
  // Divider props
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let variant: 'solid' | 'dashed' | 'dotted' | 'double' = 'solid';
  export let thickness: 'sm' | 'md' | 'lg' = 'md';
  export let spacing: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let color: 'default' | 'muted' | 'subtle' | 'inverse' = 'default';
  export let as: keyof HTMLElementTagNameMap = 'hr';
  export let id: string | null = null;
  export let role: string | null = null;
  export let title: string | null = null;
  export let responsive: boolean = true;
  
  // Derived classes
  const getOrientationClasses = () => {
    switch (orientation) {
      case 'horizontal': return responsive ? 'w-full border-t' : 'w-full border-t';
      case 'vertical': return responsive ? 'h-full border-l' : 'h-full border-l';
      default: return responsive ? 'w-full border-t' : 'w-full border-t';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'solid': return '';
      case 'dashed': return 'border-dashed';
      case 'dotted': return 'border-dotted';
      case 'double': return 'border-double';
      default: return '';
    }
  };

  const getThicknessClasses = () => {
    switch (thickness) {
      case 'sm': return 'border-t-1';
      case 'md': return 'border-t-2';
      case 'lg': return 'border-t-4';
      default: return 'border-t-2';
    }
  };

  const getSpacingClasses = () => {
    if (orientation === 'horizontal') {
      switch (spacing) {
        case 'none': return '';
        case 'sm': return responsive ? 'my-2' : 'my-2';
        case 'md': return responsive ? 'my-4' : 'my-4';
        case 'lg': return responsive ? 'my-6' : 'my-6';
        default: return responsive ? 'my-4' : 'my-4';
      }
    } else {
      switch (spacing) {
        case 'none': return '';
        case 'sm': return responsive ? 'mx-2' : 'mx-2';
        case 'md': return responsive ? 'mx-4' : 'mx-4';
        case 'lg': return responsive ? 'mx-6' : 'mx-6';
        default: return responsive ? 'mx-4' : 'mx-4';
      }
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'default': return 'border-gray-300';
      case 'muted': return 'border-gray-200';
      case 'subtle': return 'border-gray-100';
      case 'inverse': return 'border-gray-600';
      default: return 'border-gray-300';
    }
  };

  // For vertical divider, we need to set role appropriately
  const getRole = () => {
    if (orientation === 'vertical') {
      return role || 'separator';
    }
    return role;
  };
</script>

<svelte:element
  this={as}
  id={id}
  role={getRole()}
  title={title}
  aria-orientation={orientation}
  class={getOrientationClasses() + ' ' + getVariantClasses() + ' ' + getThicknessClasses() + ' ' + getSpacingClasses() + ' ' + getColorClasses()}
></svelte:element>