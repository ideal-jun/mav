import type { PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import progress from 'vite-plugin-progress';
import vueRootValidator from 'vite-plugin-vue-transition-root-validator';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import Fonts from 'unplugin-fonts/vite';
import { setupUnocss } from './unocss';
import { setupUnplugin } from './unplugin';
import { setupHtmlPlugin } from './html';
import { setupDevtoolsPlugin } from './devtools';

export function setupVitePlugins(viteEnv: Env.ImportMeta, buildTime: string) {
  const plugins: PluginOption = [
    vue({ template: { transformAssetUrls } }),
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss'
      }
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto Mono',
            weights: [400, 700]
          },
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic']
          }
        ]
      }
    }),
    vueJsx(),
    setupDevtoolsPlugin(viteEnv),
    setupUnocss(),
    ...setupUnplugin(viteEnv),
    progress(),
    setupHtmlPlugin(buildTime),
    vueRootValidator()
  ];

  return plugins;
}
