export interface ExternalPlatform {
  id: string;
  name: string;
  domain: string;
  buildSearchUrl: (query: string) => string;
}

export const UKRAINIAN_PLATFORMS: ExternalPlatform[] = [
  {
    id: 'kyivstar-tv',
    name: 'Kyivstar TV',
    domain: 'tv.kyivstar.ua',
    buildSearchUrl: (query) =>
      `https://tv.kyivstar.ua/ua/search?query=${encodeURIComponent(query)}`,
  },
  {
    id: 'sweet-tv',
    name: 'Sweet.TV',
    domain: 'sweet.tv',
    buildSearchUrl: (query) => `https://sweet.tv/ua-uk/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: 'megogo',
    name: 'Megogo',
    domain: 'megogo.net',
    buildSearchUrl: (query) =>
      `https://megogo.net/ua/search-extended?q=${encodeURIComponent(query)}`,
  },
  // {
  //   id: 'uafix',
  //   name: 'UAФЛІКС',
  //   domain: 'uafix.net',
  //   buildSearchUrl: (query) =>
  //     `https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`,
  // },
];

export function getPlatformFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
