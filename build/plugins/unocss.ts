import unocss from 'unocss/vite';

/** The UnoCSS config is defined in `uno.config.ts`, the vite plugin picks it up automatically. */
export function setupUnocss() {
  return unocss();
}
