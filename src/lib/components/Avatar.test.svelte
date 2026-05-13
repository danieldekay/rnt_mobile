<script lang="ts">
  import { describe, it, expect } from 'vitest';
  import Avatar from './Avatar.svelte';

  describe('Avatar Component', () => {
    it('renders with default props', async () => {
      const { component } = await setup(Avatar);
      const avatar = component.querySelector('div');
      expect(avatar).toBeTruthy();
      expect(avatar?.classList.contains('w-10')).toBe(true);
      expect(avatar?.classList.contains('h-10')).toBe(true);
      expect(avatar?.classList.contains('rounded-full')).toBe(true);
    });

    it('renders with different sizes', async () => {
      const { component: xs } = await setup(Avatar, { size: 'xs' });
      const { component: sm } = await setup(Avatar, { size: 'sm' });
      const { component: md } = await setup(Avatar, { size: 'md' });
      const { component: lg } = await setup(Avatar, { size: 'lg' });
      const { component: xl } = await setup(Avatar, { size: 'xl' });
      
      expect(xs.querySelector('div')?.classList.contains('w-6')).toBe(true);
      expect(sm.querySelector('div')?.classList.contains('w-8')).toBe(true);
      expect(md.querySelector('div')?.classList.contains('w-10')).toBe(true);
      expect(lg.querySelector('div')?.classList.contains('w-12')).toBe(true);
      expect(xl.querySelector('div')?.classList.contains('w-16')).toBe(true);
    });

    it('renders with different shapes', async () => {
      const { component: circle } = await setup(Avatar, { shape: 'circle' });
      const { component: square } = await setup(Avatar, { shape: 'square' });
      
      expect(circle.querySelector('div')?.classList.contains('rounded-full')).toBe(true);
      expect(square.querySelector('div')?.classList.contains('rounded-md')).toBe(true);
    });

    it('renders with image variant', async () => {
      const { component } = await setup(Avatar, { 
        src: 'test.jpg', 
        variant: 'image',
        alt: 'Test Avatar'
      });
      const avatar = component.querySelector('div');
      const img = avatar?.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.getAttribute('src')).toBe('test.jpg');
      expect(img?.getAttribute('alt')).toBe('Test Avatar');
    });

    it('renders with initials variant', async () => {
      const { component } = await setup(Avatar, { 
        name: 'John Doe',
        variant: 'initials'
      });
      const avatar = component.querySelector('div');
      const initials = avatar?.textContent?.trim();
      expect(initials).toBe('JD');
    });

    it('renders with icon variant', async () => {
      const { component } = await setup(Avatar, { 
        icon: '👤',
        variant: 'icon'
      });
      const avatar = component.querySelector('div');
      expect(avatar?.textContent?.includes('👤')).toBe(true);
    });

    it('renders with status indicator', async () => {
      const { component } = await setup(Avatar, { 
        status: 'online',
        statusPosition: 'bottom-right'
      });
      const avatar = component.querySelector('div');
      const status = avatar?.querySelector('div');
      expect(status).toBeTruthy();
      expect(status?.classList.contains('bg-green-500')).toBe(true);
      expect(status?.classList.contains('bottom-0')).toBe(true);
      expect(status?.classList.contains('right-0')).toBe(true);
    });

    it('renders with different status colors', async () => {
      const { component: online } = await setup(Avatar, { status: 'online' });
      const { component: offline } = await setup(Avatar, { status: 'offline' });
      const { component: busy } = await setup(Avatar, { status: 'busy' });
      const { component: away } = await setup(Avatar, { status: 'away' });
      
      expect(online.querySelector('div')?.classList.contains('bg-green-500')).toBe(true);
      expect(offline.querySelector('div')?.classList.contains('bg-gray-400')).toBe(true);
      expect(busy.querySelector('div')?.classList.contains('bg-red-500')).toBe(true);
      expect(away.querySelector('div')?.classList.contains('bg-yellow-500')).toBe(true);
    });

    it('renders with different status positions', async () => {
      const { component: br } = await setup(Avatar, { statusPosition: 'bottom-right' });
      const { component: bl } = await setup(Avatar, { statusPosition: 'bottom-left' });
      const { component: tr } = await setup(Avatar, { statusPosition: 'top-right' });
      const { component: tl } = await setup(Avatar, { statusPosition: 'top-left' });
      
      expect(br.querySelector('div')?.classList.contains('bottom-0')).toBe(true);
      expect(br.querySelector('div')?.classList.contains('right-0')).toBe(true);
      expect(bl.querySelector('div')?.classList.contains('bottom-0')).toBe(true);
      expect(bl.querySelector('div')?.classList.contains('left-0')).toBe(true);
      expect(tr.querySelector('div')?.classList.contains('top-0')).toBe(true);
      expect(tr.querySelector('div')?.classList.contains('right-0')).toBe(true);
      expect(tl.querySelector('div')?.classList.contains('top-0')).toBe(true);
      expect(tl.querySelector('div')?.classList.contains('left-0')).toBe(true);
    });

    it('renders with skeleton fallback', async () => {
      const { component } = await setup(Avatar, { 
        fallback: 'skeleton'
      });
      const avatar = component.querySelector('div');
      const skeleton = avatar?.querySelector('div');
      expect(skeleton?.classList.contains('animate-pulse')).toBe(true);
    });

    it('handles image error gracefully', async () => {
      const { component } = await setup(Avatar, { 
        src: 'invalid.jpg',
        variant: 'image',
        name: 'John Doe'
      });
      const avatar = component.querySelector('div');
      // After error, it should fall back to initials
      const initials = avatar?.textContent?.trim();
      expect(initials).toBe('JD');
    });

    it('renders with custom element type', async () => {
      const { component } = await setup(Avatar, { as: 'span' });
      const avatar = component.querySelector('span');
      expect(avatar).toBeTruthy();
    });

    it('renders with accessibility attributes', async () => {
      const { component } = await setup(Avatar, {
        id: 'test-avatar',
        role: 'img',
        title: 'Test Avatar'
      });
      const avatar = component.querySelector('div');
      expect(avatar?.getAttribute('id')).toBe('test-avatar');
      expect(avatar?.getAttribute('role')).toBe('img');
      expect(avatar?.getAttribute('title')).toBe('Test Avatar');
    });

    it('renders with responsive behavior enabled', async () => {
      const { component } = await setup(Avatar, { responsive: true, size: 'md' });
      const avatar = component.querySelector('div');
      expect(avatar?.classList.contains('w-10')).toBe(true);
      expect(avatar?.classList.contains('h-10')).toBe(true);
    });

    it('renders with responsive behavior disabled', async () => {
      const { component } = await setup(Avatar, { responsive: false, size: 'md' });
      const avatar = component.querySelector('div');
      expect(avatar?.classList.contains('w-10')).toBe(true);
      expect(avatar?.classList.contains('h-10')).toBe(true);
    });

    it('generates correct initials from name', async () => {
      const { component } = await setup(Avatar, { name: 'Jane Marie Smith' });
      const avatar = component.querySelector('div');
      const initials = avatar?.textContent?.trim();
      expect(initials).toBe('JS');
    });

    it('handles empty name gracefully', async () => {
      const { component } = await setup(Avatar, { name: '' });
      const avatar = component.querySelector('div');
      const initials = avatar?.textContent?.trim();
      expect(initials).toBe('');
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