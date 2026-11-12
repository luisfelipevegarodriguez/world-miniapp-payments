/**
 * Public configuration report. Returns variable names only — never values.
 */

export interface EnvRequirement {
  anyOf: string[];
}

export interface PublicConfigStatus {
  configured: boolean;
  missingRequired: EnvRequirement[];
  missingOptional: string[];
}

const REQUIRED: EnvRequirement[] = [
  { anyOf: ['NEXT_PUBLIC_WORLD_APP_ID', 'NEXT_PUBLIC_APP_ID', 'WORLD_APP_ID'] },
  { anyOf: ['NEXT_PUBLIC_PAYMENT_RECEIVER'] },
  { anyOf: ['DATABASE_URL'] },
  { anyOf: ['UPSTASH_REDIS_REST_URL', 'KV_REST_API_URL'] },
  { anyOf: ['UPSTASH_REDIS_REST_TOKEN', 'KV_REST_API_TOKEN'] },
  { anyOf: ['DEV_PORTAL_API_KEY', 'WORLD_API_KEY'] },
];

const OPTIONAL = [
  'NEXT_PUBLIC_WORLD_ACTION_ID',
  'AGENT_CRON_SECRET',
  'CRON_SECRET',
  'GROK_API_KEY',
  'EXA_API_KEY',
  'BROWSERBASE_API_KEY',
  'BROWSERBASE_PROJECT_ID',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DEPLOYER_PRIVATE_KEY',
  'CELO_PRIVATE_KEY',
  'CELO_CONTRACT_ADDRESS',
  'CELOSCAN_API_KEY',
  'VERCEL_TOKEN',
  'DOMAIN',
  'NEXT_PUBLIC_WALLETCONNECT_ID',
  'OKTA_HUMAN_PRINCIPAL_KEY',
  'TARGET_JURISDICTIONS',
];

export function isEnvSet(name: string): boolean {
  const value = process.env[name];
  return typeof value === 'string' && value.trim().length > 0;
}

export function readEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

export function getConfigStatus(): PublicConfigStatus {
  const missingRequired = REQUIRED.filter((requirement) => {
    return !requirement.anyOf.some((name) => isEnvSet(name));
  });

  const cronReady = isEnvSet('AGENT_CRON_SECRET') || isEnvSet('CRON_SECRET');
  const missingOptional = OPTIONAL.filter((name) => {
    if (cronReady && (name === 'AGENT_CRON_SECRET' || name === 'CRON_SECRET')) {
      return false;
    }
    return !isEnvSet(name);
  });

  return {
    configured: missingRequired.length === 0,
    missingRequired,
    missingOptional,
  };
}

export function notConfiguredBody() {
  return {
    success: false as const,
    error: 'not_configured' as const,
    missing: getConfigStatus().missingRequired,
  };
}
