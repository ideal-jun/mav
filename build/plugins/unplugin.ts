import process from 'node:process';
import path from 'node:path';
import type { PluginOption } from 'vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

// vite-plugin-svg-icons@2.0.1 imports fast-glob without declaring it, so fast-glob is kept in the root devDependencies.

export function setupUnplugin(viteEnv: Env.ImportMeta) {
  const { VITE_ICON_LOCAL_PREFIX } = viteEnv;

  const localIconPath = path.join(process.cwd(), 'src/assets/svg-icon');

  const plugins: PluginOption[] = [
    createSvgIconsPlugin({
      iconDirs: [localIconPath],
      symbolId: `${VITE_ICON_LOCAL_PREFIX}-[dir]-[name]`,
      inject: 'body-last',
      customDomId: '__SVG_ICON_LOCAL__'
    })
  ];

  return plugins;
}
