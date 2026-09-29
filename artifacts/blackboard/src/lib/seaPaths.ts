/**
 * The Digital Sea scene's own sections. In the Blackboard build the scene is
 * mounted under a nested router at /sea, so these stay relative to it
 * (/sea/socials, /sea/blog, ...). Everything else the scene links to is a real
 * site page and must leave the scene.
 */
const SCENE_SECTIONS = new Set(['', 'socials', 'projects', 'fin', 'blog']);

/**
 * Resolve a path the scene navigates to. Scene sections come back unchanged;
 * site pages (/cli, /observatory, /books, /quotes...) get wouter's `~` prefix,
 * which means "from the site root" inside a nested router and is a no-op when
 * the scene is the whole site.
 */
export function scenePath(path: string): string {
  if (!path.startsWith('/')) return path;
  const section = path.slice(1).split(/[/?#]/)[0].toLowerCase();
  return SCENE_SECTIONS.has(section) ? path : `~${path}`;
}
