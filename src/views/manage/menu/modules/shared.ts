/**
 * Get route name by route path
 *
 * @param routeName
 */
export function getRoutePathByRouteName(routeName: string) {
  return `/${routeName.replace(/_/g, '/')}`;
}

/**
 * Get path param from route path
 *
 * @param routePath route path
 */
export function getPathParamFromRoutePath(routePath: string) {
  const [path, param = ''] = routePath.split('/:');

  return {
    path,
    param
  };
}

/**
 * Get route path with param
 *
 * @param routePath route path
 * @param param path param
 */
export function getRoutePathWithParam(routePath: string, param: string) {
  if (param.trim()) {
    return `${routePath}/:${param}`;
  }

  return routePath;
}
