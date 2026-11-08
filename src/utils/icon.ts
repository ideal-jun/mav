/** Legacy icon name to Material Design Icons (MDI) name mapping. */
const legacyIconMap: Record<string, string> = {
  // local svg icons of the legacy icon system
  'no-permission': 'mdi-lock-outline',
  'not-found': 'mdi-map-search-outline',
  'service-error': 'mdi-server-network-off',
  'network-error': 'mdi-wifi-off',
  'empty-data': 'mdi-database-off-outline',
  'no-icon': 'mdi-circle-small',
  expectation: 'mdi-rocket-launch-outline',
  'custom-icon': 'mdi-shape-outline',
  banner: 'mdi-lightbulb-on-outline',
  avatar: 'mdi-account-circle-outline',
  activity: 'mdi-pulse',
  'at-sign': 'mdi-at',
  cast: 'mdi-cast',
  chrome: 'mdi-google-chrome',
  copy: 'mdi-content-copy',
  heart: 'mdi-heart',
  wind: 'mdi-weather-windy',
  logo: 'mdi-shape',
  // legacy icon names still returned by the backend menu data
  'mdi:menu': 'mdi-menu',
  'mdi:monitor-dashboard': 'mdi-monitor-dashboard',
  'ant-design:exception-outlined': 'mdi-alert-circle-outline',
  'carbon:cloud-service-management': 'mdi-cloud-cog-outline',
  'carbon:user-role': 'mdi-account-supervisor-outline',
  'fluent:book-information-24-regular': 'mdi-book-open-page-variant-outline',
  'ic:baseline-block': 'mdi-block-helper',
  'ic:baseline-web-asset-off': 'mdi-web-off',
  'ic:baseline-wifi-off': 'mdi-wifi-off',
  'ic:round-manage-accounts': 'mdi-account-multiple-outline',
  'ic:round-tab': 'mdi-tab',
  'icon-park-outline:all-application': 'mdi-apps',
  'material-symbols:route': 'mdi-routes',
  'heroicons:language': 'mdi-translate',
  'ph:user-circle': 'mdi-account-circle-outline',
  'majesticons:color-swatch-line': 'mdi-palette-outline',
  'material-symbols:sunny': 'mdi-white-balance-sunny',
  'material-symbols:nightlight-rounded': 'mdi-weather-night',
  'material-symbols:hdr-auto': 'mdi-theme-light-dark',
  'line-md:menu-fold-left': 'mdi-menu-open',
  'line-md:menu-fold-right': 'mdi-menu',
  'ph-caret-double-left-bold': 'mdi-chevron-double-left',
  'ph-caret-double-right-bold': 'mdi-chevron-double-right',
  'ant-design:bar-chart-outlined': 'mdi-chart-bar',
  'ant-design:money-collect-outlined': 'mdi-cash-multiple',
  'ant-design:trademark-circle-outlined': 'mdi-certificate-outline',
  'carbon:document-download': 'mdi-file-download-outline',
  'mingcute:zoom-out-line': 'mdi-magnify-minus-outline',
  'mingcute:zoom-in-line': 'mdi-magnify-plus-outline',
  'icon-park-outline:equal-ratio': 'mdi-fit-to-page-outline',
  'gg:ratio': 'mdi-aspect-ratio',
  'fe:question': 'mdi-help-circle-outline',
  'f7:flag-circle-fill': 'mdi-flag-variant',
  'f7:circle-fill': 'mdi-circle'
};

/** Get all local svg icon names in `src/assets/svg-icon` */
export function getLocalIcons() {
  const svgIcons = import.meta.glob('/src/assets/svg-icon/*.svg');

  const keys = Object.keys(svgIcons)
    .map(item => item.split('/').at(-1)?.replace('.svg', '') || '')
    .filter(Boolean);

  return keys;
}

/**
 * Resolve an icon name into a Material Design Icons (MDI) name.
 *
 * The project only renders Material Design Icons through the Vuetify `VIcon` component. Icons configured in the
 * backend (menu data) or in old route configs may still use a legacy icon name, so they are normalized here.
 *
 * @param icon icon name, it can be an MDI name (`mdi-home`) or a legacy name (`mdi:home`, `not-found`)
 */
export function resolveMdiIcon(icon?: string | null): string | undefined {
  if (!icon) {
    return undefined;
  }

  const name = icon.trim();

  if (!name) {
    return undefined;
  }

  const mapped = legacyIconMap[name];

  if (mapped) {
    return mapped;
  }

  if (name.startsWith('mdi-')) {
    return name;
  }

  if (name.startsWith('mdi:')) {
    return `mdi-${name.slice(4)}`;
  }

  return 'mdi-help-circle-outline';
}
