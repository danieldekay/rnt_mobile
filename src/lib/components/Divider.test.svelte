<script lang="ts">
  import { describe, it, expect } from 'vitest';
  import Divider from './Divider.svelte';

  describe('Divider Component', () => {
    it('renders with default props', async () => {
      const { component } = await setup(Divider);
      const divider = component.querySelector('hr');
      expect(divider).toBeTruthy();
      expect(divider?.classList.contains('w-full')).toBe(true);
      expect(divider?.classList.contains('border-t')).toBe(true);
      expect(divider?.classList.contains('border-t-2')).toBe(true);
      expect(divider?.classList.contains('border-gray-300')).toBe(true);
    });

    it('renders with horizontal orientation', async () => {
      const { component } = await setup(Divider, { orientation: 'horizontal' });
      const divider = component.querySelector('hr');
      expect(divider?.classList.contains('w-full')).toBe(true);
      expect(divider?.classList.contains('border-t')).toBe(true);
      expect(divider?.classList.contains('border-l')).toBe(false);
    });

    it('renders with vertical orientation', async () => {
      const { component } = await setup(Divider, { orientation: 'vertical' });
      const divider = component.querySelector('hr');
      expect(divider?.classList.contains('h-full')).toBe(true);
      expect(divider?.classList.contains('border-l')).toBe(true);
      expect(divider?.classList.contains('border-t')).toBe(false);
      expect(divider?.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('renders with different variants', async () => {
      const { component: solid } = await setup(Divider, { variant: 'solid' });
      const { component: dashed } = await setup(Divider, { variant: 'dashed' });
      const { component: dotted } = await setup(Divider, { variant: 'dotted' });
      const { component: double } = await setup(Divider, { variant: 'double' });
      
      expect(solid.querySelector('hr')?.classList.contains('border-dashed')).toBe(false);
      expect(dashed.querySelector('hr')?.classList.contains('border-dashed')).toBe(true);
      expect(dotted.querySelector('hr')?.classList.contains('border-dotted')).toBe(true);
      expect(double.querySelector('hr')?.classList.contains('border-double')).toBe(true);
    });

    it('renders with different thickness levels', async () => {
      const { component: sm } = await setup(Divider, { thickness: 'sm' });
      const { component: md } = await setup(Divider, { thickness: 'md' });
      const { component: lg } = await setup(Divider, { thickness: 'lg' });
      
      expect(sm.querySelector('hr')?.classList.contains('border-t-1')).toBe(true);
      expect(md.querySelector('hr')?.classList.contains('border-t-2')).toBe(true);
      expect(lg.querySelector('hr')?.classList.contains('border-t-4')).toBe(true);
    });

    it('renders with different spacing levels', async () => {
      const { component: none } = await setup(Divider, { spacing: 'none' });
      const { component: sm } = await setup(Divider, { spacing: 'sm' });
      const { component: md } = await setup(Divider, { spacing: 'md' });
      const { component: lg } = await setup(Divider, { spacing: 'lg' });
      
      expect(none.querySelector('hr')?.classList.contains('my-')).toBe(false);
      expect(sm.querySelector('hr')?.classList.contains('my-2')).toBe(true);
      expect(md.querySelector('hr')?.classList.contains('my-4')).toBe(true);
      expect(lg.querySelector('hr')?.classList.contains('my-6')).toBe(true);
    });

    it('renders with spacing for vertical orientation', async () => {
      const { component: sm } = await setup(Divider, { 
        orientation: 'vertical', 
        spacing: 'sm' 
      });
      const divider = sm.querySelector('hr');
      expect(divider?.classList.contains('mx-2')).toBe(true);
      expect(divider?.classList.contains('my-')).toBe(false);
    });

    it('renders with different colors', async () => {
      const { component: defaultColor } = await setup(Divider, { color: 'default' });
      const { component: muted } = await setup(Divider, { color: 'muted' });
      const { component: subtle } = await setup(Divider, { color: 'subtle' });
      const { component: inverse } = await setup(Divider, { color: 'inverse' });
      
      expect(defaultColor.querySelector('hr')?.classList.contains('border-gray-300')).toBe(true);
      expect(muted.querySelector('hr')?.classList.contains('border-gray-200')).toBe(true);
      expect(subtle.querySelector('hr')?.classList.contains('border-gray-100')).toBe(true);
      expect(inverse.querySelector('hr')?.classList.contains('border-gray-600')).toBe(true);
    });

    it('renders with custom element type', async () => {
      const { component } = await setup(Divider, { as: 'div' });
      const divider = component.querySelector('div');
      expect(divider).toBeTruthy();
    });

    it('renders with accessibility attributes', async () => {
      const { component } = await setup(Divider, {
        id: 'test-divider',
        role: 'separator',
        title: 'Test Divider'
      });
      const divider = component.querySelector('hr');
      expect(divider?.getAttribute('id')).toBe('test-divider');
      expect(divider?.getAttribute('role')).toBe('separator');
      expect(divider?.getAttribute('title')).toBe('Test Divider');
    });

    it('renders with horizontal divider and role separator', async () => {
      const { component } = await setup(Divider, { 
        orientation: 'horizontal',
        role: 'separator'
      });
      const divider = component.querySelector('hr');
      expect(divider?.getAttribute('role')).toBe('separator');
      expect(divider?.getAttribute('aria-orientation')).toBe(null);
    });

    it('renders with vertical divider and automatic role', async () => {
      const { component } = await setup(Divider, { 
        orientation: 'vertical'
      });
      const divider = component.querySelector('hr');
      expect(divider?.getAttribute('role')).toBe('separator');
      expect(divider?.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('renders with responsive behavior enabled', async () => {
      const { component } = await setup(Divider, { responsive: true });
      const divider = component.querySelector('hr');
      expect(divider?.classList.contains('w-full')).toBe(true);
    });

    it('renders with responsive behavior disabled', async () => {
      const { component } = await setup(Divider, { responsive: false });
      const divider = component.querySelector('hr');
      expect(divider?.classList.contains('w-full')).toBe(true);
    });

    it('combines multiple styling properties correctly', async () => {
      const { component } = await setup(Divider, {
        orientation: 'horizontal',
        variant: 'dashed',
        thickness: 'lg',
        spacing: 'md',
        color: 'inverse'
      });
      const divider = component.querySelector('hr');
      expect(divider?.classList.contains('w-full')).toBe(true);
      expect(divider?.classList.contains('border-t')).toBe(true);
      expect(divider?.classList.contains('border-dashed')).toBe(true);
      expect(divider?.classList.contains('border-t-4')).toBe(true);
      expect(divider?.classList.contains('my-4')).toBe(true);
      expect(divider?.classList.contains('border-gray-600')).toBe(true);
    });
  });

  // Helper function to render components in tests
  async function setup(component: any, props = {}) {
    const instance = new component({
      target: document.body,
      props
    });
    
    return {
      component: instance.element,
      instance
    };
  }
</script>