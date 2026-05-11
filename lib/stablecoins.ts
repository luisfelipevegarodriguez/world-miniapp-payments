/**
 * LATAM + Global stablecoin config — MiniKit 2.0
 * Fuente: https://www.mexc.co/en-NG/news/995448
 */
export interface StablecoinConfig {
  symbol: string;
  label: string;
  decimals: number;
  countries: string[];  // ISO 3166-1 alpha-2
  narrative: string;
}

export const SUPPORTED_STABLECOINS: StablecoinConfig[] = [
  {
    symbol: 'USDCE',
    label: 'USDC (Bridged)',
    decimals: 6,
    countries: ['*'],
    narrative: 'Global access to dollar yield'
  },
  {
    symbol: 'WLD',
    label: 'Worldcoin',
    decimals: 18,
    countries: ['*'],
    narrative: 'Universal human identity token'
  },
  {
    symbol: 'wARS',
    label: 'Wrapped ARS',
    decimals: 18,
    countries: ['AR'],
    narrative: 'Protect against Argentine inflation'
  },
  {
    symbol: 'wCOP',
    label: 'Wrapped COP',
    decimals: 18,
    countries: ['CO'],
    narrative: 'Colombian peso inflation hedge'
  },
  {
    symbol: 'wMXN',
    label: 'Wrapped MXN',
    decimals: 18,
    countries: ['MX'],
    narrative: 'Mexican peso on-chain'
  },
  {
    symbol: 'wBRL',
    label: 'Wrapped BRL',
    decimals: 18,
    countries: ['BR'],
    narrative: 'Brazilian real inflation protection'
  },
  {
    symbol: 'wPEN',
    label: 'Wrapped PEN',
    decimals: 18,
    countries: ['PE'],
    narrative: 'Peruvian sol to global yield'
  },
  {
    symbol: 'EURC',
    label: 'Euro Coin',
    decimals: 6,
    countries: ['ES', 'PT', 'FR', 'DE', 'IT', 'NL'],
    narrative: 'Euro-native DeFi access'
  },
];

export function getStablecoinsForCountry(countryCode: string): StablecoinConfig[] {
  return SUPPORTED_STABLECOINS.filter(
    sc => sc.countries.includes('*') || sc.countries.includes(countryCode)
  );
}
