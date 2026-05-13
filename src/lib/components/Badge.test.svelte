<script lang="ts">
  import { describe, it, expect } from 'vitest';
  import Badge from './Badge.svelte';

  describe('Badge Component', () => {
    it('renders with default props', async () => {
      const { component } = await setup(Badge);
      const badge = component.querySelector('span');
      expect(badge).toBeTruthy();
      expect(badge?.classList.contains('bg-primary-100')).toBe(true);
      expect(badge?.classList.contains('text-primary-800')).toBe(true);
      expect(badge?.classList.contains('border-primary-200')).toBe(true);
    });

    it('renders with different variants', async () => {
      const { component: primary } = await setup(Badge, { variant: 'primary' });
      const { component: secondary } = await setup(Badge, { variant: 'secondary' });
      const { component: accent } = await setup(Badge, { variant: 'accent' });
      const { component: success } = await setup(Badge, { variant: 'success' });
      const { component: warning } = await setup(Badge, { variant: 'warning' });
      const { component: error } = await setup(Badge, { variant: 'error' });
      const { component: info } = await setup(Badge, { variant: 'info' });
      const { component: muted } = await setup(Badge, { variant: 'muted' });
      
      expect(primary.querySelector('span')?.classList.contains('bg-primary-100')).toBe(true);
      expect(secondary.querySelector('span')?.classList.contains('bg-secondary-100')).toBe(true);
      expect(accent.querySelector('span')?.classList.contains('bg-accent-100')).toBe(true);
      expect(success.querySelector('span')?.classList.contains('bg-green-100')).toBe(true);
      expect(warning.querySelector('span')?.classList.contains('bg-yellow-100')).toBe(true);
      expect(error.querySelector('span')?.classList.contains('bg-red-100')).toBe(true);
      expect(info.querySelector('span')?.classList.contains('bg-blue-100')).toBe(true);
      expect(muted.querySelector('span')?.classList.contains('bg-gray-100')).toBe(true);
    });

    it('renders with different sizes', async () => {
      const { component: sm } = await setup(Badge, { size: 'sm' });
      const { component: md } = await setup(Badge, { size: 'md' });
      const { component: lg } = await setup(Badge, { variant: 'lg' });
      
      expect(sm.querySelector('span')?.classList.contains('text-xs')).toBe(true);
      expect(md.querySelector('span')?.classList.contains('text-sm')).toBe(true);
      expect(lg.querySelector('span')?.classList.contains('text-base')).toBe(true);
    });

    it('renders with different shapes', async () => {
      const { component: rounded } = await setup(Badge, { shape: 'rounded' });
      const { component: pill } = await setup(Badge, { shape: 'pill' });
      const { component: square } = await setup(Badge, { shape: 'square' });
      
      expect(rounded.querySelector('span')?.classList.contains('rounded-md')).toBe(true);
      expect(pill.querySelector('span')?.classList.contains('rounded-full')).toBe(true);
      expect(square.querySelector('span')?.classList.contains('rounded-none')).toBe(true);
    });

    it('renders with icon on left', async () => {
      const { component } = await setup(Badge, { icon: '📌', iconPosition: 'left' });
      const badge = component.querySelector('span');
      expect(badge?.textContent?.includes('📌')).toBe(true);
    });

    it('renders with icon on right', async () => {
      const { component } = await setup(Badge, { icon: '📌', iconPosition: 'right' });
      const badge = component.querySelector('span');
      expect(badge?.textContent?.includes('📌')).toBe(true);
    });

    it('renders with dismissible button', async () => {
      const { component } = await setup(Badge, { dismissible: true });
      const badge = component.querySelector('span');
      expect(badge?.classList.contains('cursor-pointer')).toBe(true);
      expect(badge?.classList.contains('hover:opacity-80')).toBe(true);
    });

    it('renders with custom element type', async () => {
      const { component } = await setup(Badge, { as: 'div' });
      const badge = component.querySelector('div');
      expect(badge).toBeTruthy();
    });

    it('renders with accessibility attributes', async () => {
      const { component } = await setup(Badge, {
        id: 'test-badge',
        role: 'status',
        title: 'Test Badge'
      });
      const badge = component.querySelector('span');
      expect(badge?.getAttribute('id')).toBe('test-badge');
      expect(badge?.getAttribute('role')).toBe('status');
      expect(badge?.getAttribute('title')).toBe('Test Badge');
    });

    it('renders with responsive behavior enabled', async () => {
      const { component } = await setup(Badge, { responsive: true, size: 'md' });
      const badge = component.querySelector('span');
      expect(badge?.classList.contains('inline-flex')).toBe(true);
    });

    it('renders with responsive behavior disabled', async () => {
      const { component } = await setup(Badge, { responsive: false, size: 'md' });
      const badge = component.querySelector('span');
      expect(badge?.classList.contains('inline-flex')).toBe(true); // Still should have flex
    });

    it('renders with slot content', async () => {
      const { component } = await setup(Badge, {
        slot: { default: () => 'Test Badge Content' }
      });
      const badge = component.querySelector('span');
      expect(badge?.textContent?.includes('Test Badge Content')).toBe(true);
    });

    it('emits dismiss event when clicked', async () => {
      let dismissed = false;
      const { component } = await setup(Badge, { dismissible: true });
      
      component.querySelector('span')?.addEventListener('dismiss', () => {
        dismissed = true;
      });
      
      const badge = component.querySelector('span');
      badge?.click();
      expect(dismissed).toBe(true);
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