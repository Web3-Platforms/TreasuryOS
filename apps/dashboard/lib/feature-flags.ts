function normalizeBoolean(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

export function isSumsubKycEnabled(env: NodeJS.ProcessEnv = process.env) {
  return normalizeBoolean(env.KYC_SUMSUB_ENABLED);
}

export function isPilotManualKycBypassEnabled(env: NodeJS.ProcessEnv = process.env) {
  return normalizeBoolean(env.PILOT_ALLOW_MANUAL_KYC_BYPASS);
}

function hasNonEmptyValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isDemoAccessEnabled(env: NodeJS.ProcessEnv = process.env) {
  return normalizeBoolean(env.DEMO_ACCESS_ENABLED);
}

export function isDemoAccessAvailable(env: NodeJS.ProcessEnv = process.env) {
  return (
    isDemoAccessEnabled(env) &&
    hasNonEmptyValue(env.DEMO_ACCESS_EMAIL) &&
    hasNonEmptyValue(env.DEMO_ACCESS_PASSWORD)
  );
}
