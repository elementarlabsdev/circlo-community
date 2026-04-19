import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Home and public textContent benefit from SSR for SEO and fast TTFB
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  // Heavy, editor/admin areas render on the client to avoid SSR overhead and editor DOM issues
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'studio',
    renderMode: RenderMode.Client,
  },
  // Fallback to SSR for everything else
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
