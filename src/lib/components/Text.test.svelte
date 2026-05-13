<script lang="ts">
  import { describe, it, expect } from 'vitest';
  import Text from './Text.svelte';

  describe('Text Component', () => {
    it('renders with default props', async () => {
      const { component } = await setup(Text);
      const text = component.querySelector('p');
      expect(text).toBeTruthy();
      expect(text?.classList.contains('text-base')).toBe(true);
      expect(text?.classList.contains('font-regular')).toBe(true);
    });

    it('renders with different sizes', async () => {
      const { component: xs } = await setup(Text, { size: 'xs' });
      const { component: sm } = await setup(Text, { size: 'sm' });
      const { component: base } = await setup(Text, { size: 'base' });
      const { component: lg } = await setup(Text, { size: 'lg' });
      const { component: xl } = await setup(Text, { size: 'xl' });
      const { component: size2xl } = await setup(Text, { size: '2xl' });
      const { component: size3xl } = await setup(Text, { size: '3xl' });
      const { component: size4xl } = await setup(Text, { size: '4xl' });
      const { component: size5xl } = await setup(Text, { size: '5xl' });
      const { component: size6xl } = await setup(Text, { size: '6xl' });
      
      expect(xs.querySelector('p')?.classList.contains('text-xs')).toBe(true);
      expect(sm.querySelector('p')?.classList.contains('text-sm')).toBe(true);
      expect(base.querySelector('p')?.classList.contains('text-base')).toBe(true);
      expect(lg.querySelector('p')?.classList.contains('text-lg')).toBe(true);
      expect(xl.querySelector('p')?.classList.contains('text-xl')).toBe(true);
      expect(size2xl.querySelector('p')?.classList.contains('text-2xl')).toBe(true);
      expect(size3xl.querySelector('p')?.classList.contains('text-3xl')).toBe(true);
      expect(size4xl.querySelector('p')?.classList.contains('text-4xl')).toBe(true);
      expect(size5xl.querySelector('p')?.classList.contains('text-5xl')).toBe(true);
      expect(size6xl.querySelector('p')?.classList.contains('text-6xl')).toBe(true);
    });

    it('renders with different weights', async () => {
      const { component: regular } = await setup(Text, { weight: 'regular' });
      const { component: medium } = await setup(Text, { weight: 'medium' });
      const { component: semibold } = await setup(Text, { weight: 'semibold' });
      const { component: bold } = await setup(Text, { weight: 'bold' });
      
      expect(regular.querySelector('p')?.classList.contains('font-regular')).toBe(true);
      expect(medium.querySelector('p')?.classList.contains('font-medium')).toBe(true);
      expect(semibold.querySelector('p')?.classList.contains('font-semibold')).toBe(true);
      expect(bold.querySelector('p')?.classList.contains('font-bold')).toBe(true);
    });

    it('renders with different line heights', async () => {
      const { component: tight } = await setup(Text, { lineHeight: 'tight' });
      const { component: snug } = await setup(Text, { lineHeight: 'snug' });
      const { component: normal } = await setup(Text, { lineHeight: 'normal' });
      const { component: relaxed } = await setup(Text, { lineHeight: 'relaxed' });
      const { component: loose } = await setup(Text, { lineHeight: 'loose' });
      
      expect(tight.querySelector('p')?.classList.contains('leading-tight')).toBe(true);
      expect(snug.querySelector('p')?.classList.contains('leading-snug')).toBe(true);
      expect(normal.querySelector('p')?.classList.contains('leading-normal')).toBe(true);
      expect(relaxed.querySelector('p')?.classList.contains('leading-relaxed')).toBe(true);
      expect(loose.querySelector('p')?.classList.contains('leading-loose')).toBe(true);
    });

    it('renders with different colors', async () => {
      const { component: defaultColor } = await setup(Text, { color: 'default' });
      const { component: mutedColor } = await setup(Text, { color: 'muted' });
      const { component: subtleColor } = await setup(Text, { color: 'subtle' });
      const { component: inverseColor } = await setup(Text, { color: 'inverse' });
      const { component: linkColor } = await setup(Text, { color: 'link' });
      
      expect(defaultColor.querySelector('p')?.classList.contains('text-text-default')).toBe(true);
      expect(mutedColor.querySelector('p')?.classList.contains('text-text-muted')).toBe(true);
      expect(subtleColor.querySelector('p')?.classList.contains('text-text-subtle')).toBe(true);
      expect(inverseColor.querySelector('p')?.classList.contains('text-text-inverse')).toBe(true);
      expect(linkColor.querySelector('p')?.classList.contains('text-text-link')).toBe(true);
    });

    it('renders with tracking', async () => {
      const { component: tight } = await setup(Text, { tracking: 'tight' });
      const { component: normal } = await setup(Text, { tracking: 'normal' });
      const { component: wide } = await setup(Text, { tracking: 'wide' });
      
      expect(tight.querySelector('p')?.classList.contains('tracking-tight')).toBe(true);
      expect(normal.querySelector('p')?.classList.contains('tracking-normal')).toBe(true);
      expect(wide.querySelector('p')?.classList.contains('tracking-wide')).toBe(true);
    });

    it('renders with text transform', async () => {
      const { component: uppercase } = await setup(Text, { transform: 'uppercase' });
      const { component: lowercase } = await setup(Text, { transform: 'lowercase' });
      const { component: capitalize } = await setup(Text, { transform: 'capitalize' });
      
      expect(uppercase.querySelector('p')?.classList.contains('uppercase')).toBe(true);
      expect(lowercase.querySelector('p')?.classList.contains('lowercase')).toBe(true);
      expect(capitalize.querySelector('p')?.classList.contains('capitalize')).toBe(true);
    });

    it('renders with truncate enabled', async () => {
      const { component } = await setup(Text, { truncate: true });
      const text = component.querySelector('p');
      expect(text?.classList.contains('truncate')).toBe(true);
    });

    it('renders with wrap enabled', async () => {
      const { component } = await setup(Text, { wrap: true });
      const text = component.querySelector('p');
      expect(text?.classList.contains('whitespace-normal')).toBe(true);
    });

    it('renders with wrap disabled', async () => {
      const { component } = await setup(Text, { wrap: false });
      const text = component.querySelector('p');
      expect(text?.classList.contains('whitespace-nowrap')).toBe(true);
    });

    it('renders with custom element type', async () => {
      const { component } = await setup(Text, { as: 'span' });
      const text = component.querySelector('span');
      expect(text).toBeTruthy();
    });

    it('renders with accessibility attributes', async () => {
      const { component } = await setup(Text, {
        id: 'test-text',
        role: 'paragraph'
      });
      const text = component.querySelector('p');
      expect(text?.getAttribute('id')).toBe('test-text');
      expect(text?.getAttribute('role')).toBe('paragraph');
    });

    it('renders with responsive behavior enabled', async () => {
      const { component } = await setup(Text, { responsive: true, size: 'base' });
      const text = component.querySelector('p');
      expect(text?.classList.contains('sm:text-lg')).toBe(true);
    });

    it('renders with responsive behavior disabled', async () => {
      const { component } = await setup(Text, { responsive: false, size: 'base' });
      const text = component.querySelector('p');
      expect(text?.classList.contains('sm:text-lg')).toBe(false);
    });

    it('renders with slot content', async () => {
      const { component } = await setup(Text, {
        slot: { default: () => 'Test Text Content' }
      });
      const text = component.querySelector('p');
      expect(text?.textContent?.includes('Test Text Content')).toBe(true);
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