import process from 'node:process';
import path from 'node:path';
import type { PluginOption } from 'vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import Components from 'unplugin-vue-components/vite';

export function setupUnplugin(viteEnv: Env.ImportMeta) {
  const { VITE_ICON_LOCAL_PREFIX } = viteEnv;

  const localIconPath = path.join(process.cwd(), 'src/assets/svg-icon');

  const plugins: PluginOption[] = [
    Components({
      dts: 'src/typings/components.d.ts',
      types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }]
    }),
    createSvgIconsPlugin({
      iconDirs: [localIconPath],
      symbolId: `${VITE_ICON_LOCAL_PREFIX}-[dir]-[name]`,
      inject: 'body-last',
      customDomId: '__SVG_ICON_LOCAL__'
    })
  ];

  return plugins;
}
