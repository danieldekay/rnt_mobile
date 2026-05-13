<script lang="ts">
  import { describe, it, expect } from 'vitest';
  import Button from './Button.svelte';

  describe('Button Component', () => {
    it('renders with default props', async () => {
      const { component } = await setup(Button);
      const button = component.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.classList.contains('bg-primary-500')).toBe(true);
      expect(button?.classList.contains('text-white')).toBe(true);
    });

    it('renders with primary variant', async () => {
      const { component } = await setup(Button, { variant: 'primary' });
      const button = component.querySelector('button');
      expect(button?.classList.contains('bg-primary-500')).toBe(true);
      expect(button?.classList.contains('text-white')).toBe(true);
    });

    it('renders with secondary variant', async () => {
      const { component } = await setup(Button, { variant: 'secondary' });
      const button = component.querySelector('button');
      expect(button?.classList.contains('bg-secondary-500')).toBe(true);
      expect(button?.classList.contains('text-white')).toBe(true);
    });

    it('renders with accent variant', async () => {
      const { component } = await setup(Button, { variant: 'accent' });
      const button = component.querySelector('button');
      expect(button?.classList.contains('bg-accent-500')).toBe(true);
      expect(button?.classList.contains('text-white')).toBe(true);
    });

    it('renders with outline variant', async () => {
      const { component } = await setup(Button, { variant: 'outline' });
      const button = component.querySelector('button');
      expect(button?.classList.contains('border')).toBe(true);
      expect(button?.classList.contains('border-border-default')).toBe(true);
      expect(button?.classList.contains('bg-transparent')).toBe(true);
    });

    it('renders with ghost variant', async () => {
      const { component } = await setup(Button, { variant: 'ghost' });
      const button = component.querySelector('button');
      expect(button?.classList.contains('bg-transparent')).toBe(true);
    });

    it('renders with link variant', async () => {
      const { component } = await setup(Button, { variant: 'link' });
      const button = component.querySelector('button');
      expect(button?.classList.contains('bg-transparent')).toBe(true);
      expect(button?.classList.contains('text-text-link')).toBe(true);
    });

    it('renders with different sizes', async () => {
      const { component: sm } = await setup(Button, { size: 'sm' });
      const { component: md } = await setup(Button, { size: 'md' });
      const { component: lg } = await setup(Button, { size: 'lg' });
      const { component: xl } = await setup(Button, { size: 'xl' });
      
      expect(sm.querySelector('button')?.classList.contains('h-9')).toBe(true);
      expect(md.querySelector('button')?.classList.contains('h-10')).toBe(true);
      expect(lg.querySelector('button')?.classList.contains('h-11')).toBe(true);
      expect(xl.querySelector('button')?.classList.contains('h-12')).toBe(true);
    });

    it('renders with disabled state', async () => {
      const { component } = await setup(Button, { disabled: true });
      const button = component.querySelector('button');
      expect(button?.disabled).toBe(true);
      expect(button?.classList.contains('disabled:opacity-50')).toBe(true);
    });

    it('renders with loading state', async () => {
      const { component } = await setup(Button, { loading: true });
      const button = component.querySelector('button');
      expect(button?.disabled).toBe(true);
      const spinner = button?.querySelector('svg');
      expect(spinner).toBeTruthy();
    });

    it('renders with full width', async () => {
      const { component } = await setup(Button, { fullWidth: true });
      const button = component.querySelector('button');
      expect(button?.classList.contains('w-full')).toBe(true);
    });

    it('renders with custom type', async () => {
      const { component } = await setup(Button, { type: 'submit' });
      const button = component.querySelector('button');
      expect(button?.getAttribute('type')).toBe('submit');
    });

    it('renders with left icon', async () => {
      const { component } = await setup(Button, { leftIcon: '←' });
      const button = component.querySelector('button');
      expect(button?.textContent?.includes('←')).toBe(true);
    });

    it('renders with right icon', async () => {
      const { component } = await setup(Button, { rightIcon: '→' });
      const button = component.querySelector('button');
      expect(button?.textContent?.includes('→')).toBe(true);
    });

    it('renders with custom element type', async () => {
      const { component } = await setup(Button, { as: 'a' });
      const button = component.querySelector('a');
      expect(button).toBeTruthy();
    });

    it('renders with accessibility attributes', async () => {
      const { component } = await setup(Button, {
        ariaLabel: 'Test Button',
        id: 'test-button',
        role: 'button',
        title: 'Test Title'
      });
      const button = component.querySelector('button');
      expect(button?.getAttribute('aria-label')).toBe('Test Button');
      expect(button?.getAttribute('id')).toBe('test-button');
      expect(button?.getAttribute('role')).toBe('button');
      expect(button?.getAttribute('title')).toBe('Test Title');
    });

    it('renders with responsive behavior enabled', async () => {
      const { component } = await setup(Button, { responsive: true, size: 'md' });
      const button = component.querySelector('button');
      expect(button?.classList.contains('sm:h-11')).toBe(true);
    });

    it('renders with responsive behavior disabled', async () => {
      const { component } = await setup(Button, { responsive: false, size: 'md' });
      const button = component.querySelector('button');
      expect(button?.classList.contains('sm:h-11')).toBe(false);
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