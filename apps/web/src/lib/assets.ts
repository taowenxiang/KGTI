function normalizeBasePath(basePath: string) {
  if (!basePath || basePath === '/') {
    return '/';
  }

  return basePath.endsWith('/') ? basePath : `${basePath}/`;
}

export function toAppAssetPath(assetPath?: string | null) {
  if (!assetPath) {
    return null;
  }

  if (/^(https?:)?\/\//.test(assetPath)) {
    return assetPath;
  }

  const basePath = normalizeBasePath(import.meta.env.BASE_URL || '/');
  const normalizedAssetPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;

  return `${basePath}${normalizedAssetPath}`;
}
