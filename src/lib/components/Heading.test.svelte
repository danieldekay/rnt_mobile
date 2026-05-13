<script lang="ts">
  import { describe, it, expect } from 'vitest';
  import Heading from './Heading.svelte';

  describe('Heading Component', () => {
    it('renders h1 with default props', async () => {
      const { component } = await setup(Heading, { level: 1 });
      const heading = component.querySelector('h1');
      expect(heading).toBeTruthy();
      expect(heading?.classList.contains('text-3xl')).toBe(true);
      expect(heading?.classList.contains('font-semibold')).toBe(true);
    });

    it('renders different heading levels', async () => {
      const { component: h1 } = await setup(Heading, { level: 1 });
      const { component: h2 } = await setup(Heading, { level: 2 });
      const { component: h3 } = await setup(Heading, { level: 3 });
      const { component: h4 } = await setup(Heading, { level: 4 });
      const { component: h5 } = await setup(Heading, { level: 5 });
      const { component: h6 } = await setup(Heading, { level: 6 });
      
      expect(h1.querySelector('h1')).toBeTruthy();
      expect(h2.querySelector('h2')).toBeTruthy();
      expect(h3.querySelector('h3')).toBeTruthy();
      expect(h4.querySelector('h4')).toBeTruthy();
      expect(h5.querySelector('h5')).toBeTruthy();
      expect(h6.querySelector('h6')).toBeTruthy();
    });

    it('renders with explicit size', async () => {
      const { component } = await setup(Heading, { size: '2xl' });
      const heading = component.querySelector('[class*="text-"]');
      expect(heading?.classList.contains('text-2xl')).toBe(true);
    });

    it('renders with custom weight', async () => {
      const { component } = await setup(Heading, { weight: 'bold' });
      const heading = component.querySelector('[class*="font-"]');
      expect(heading?.classList.contains('font-bold')).toBe(true);
    });

    it('renders with custom line height', async () => {
      const { component } = await setup(Heading, { lineHeight: 'normal' });
      const heading = component.querySelector('[class*="leading-"]');
      expect(heading?.classList.contains('leading-normal')).toBe(true);
    });

    it('renders with different colors', async () => {
      const { component: defaultColor } = await setup(Heading, { color: 'default' });
      const { component: mutedColor } = await setup(Heading, { color: 'muted' });
      const { component: subtleColor } = await setup(Heading, { color: 'subtle' });
      const { component: inverseColor } = await setup(Heading, { color: 'inverse' });
      const { component: linkColor } = await setup(Heading, { color: 'link' });
      
      expect(defaultColor.querySelector('[class*="text-text-default"]')).toBeTruthy();
      expect(mutedColor.querySelector('[class*="text-text-muted"]')).toBeTruthy();
      expect(subtleColor.querySelector('[class*="text-text-subtle"]')).toBeTruthy();
      expect(inverseColor.querySelector('[class*="text-text-inverse"]')).toBeTruthy();
      expect(linkColor.querySelector('[class*="text-text-link"]')).toBeTruthy();
    });

    it('renders with tracking', async () => {
      const { component } = await setup(Heading, { tracking: 'wide' });
      const heading = component.querySelector('[class*="tracking-"]');
      expect(heading?.classList.contains('tracking-wide')).toBe(true);
    });

    it('renders with text transform', async () => {
      const { component } = await setup(Heading, { transform: 'uppercase' });
      const heading = component.querySelector('[class*="uppercase"]');
      expect(heading?.classList.contains('uppercase')).toBe(true);
    });

    it('renders with truncate enabled', async () => {
      const { component } = await setup(Heading, { truncate: true });
      const heading = component.querySelector('[class*="truncate"]');
      expect(heading?.classList.contains('truncate')).toBe(true);
    });

    it('renders with custom element type', async () => {
      const { component } = await setup(Heading, { as: 'div' });
      const heading = component.querySelector('div');
      expect(heading).toBeTruthy();
    });

    it('renders with accessibility attributes', async () => {
      const { component } = await setup(Heading, {
        id: 'test-heading',
        role: 'heading',
        level: 2
      });
      const heading = component.querySelector('h2');
      expect(heading?.getAttribute('id')).toBe('test-heading');
      expect(heading?.getAttribute('role')).toBe('heading');
    });

    it('renders with responsive behavior enabled', async () => {
      const { component } = await setup(Heading, { responsive: true, level: 1 });
      const heading = component.querySelector('h1');
      expect(heading?.classList.contains('sm:text-4xl')).toBe(true);
      expect(heading?.classList.contains('md:text-5xl')).toBe(true);
      expect(heading?.classList.contains('lg:text-6xl')).toBe(true);
    });

    it('renders with responsive behavior disabled', async () => {
      const { component } = await setup(Heading, { responsive: false, level: 1 });
      const heading = component.querySelector('h1');
      expect(heading?.classList.contains('sm:text-4xl')).toBe(false);
    });

    it('renders with slot content', async () => {
      const { component } = await setup(Heading, {
        level: 2,
        slot: { default: () => 'Test Heading' }
      });
      const heading = component.querySelector('h2');
      expect(heading?.textContent?.includes('Test Heading')).toBe(true);
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