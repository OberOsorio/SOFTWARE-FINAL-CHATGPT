const EXPECTED_EMPTY_CAMPAIGN_MESSAGES = [
  /no tiene (?:una )?campaña asignada/i,
  /no tiene (?:una )?organización electoral asignada/i,
  /no existe (?:una )?campaña (?:activa )?accesible/i
];

/**
 * A candidate without an assigned campaign is a valid empty state while the
 * global administrator completes setup. It must not be rendered as an error.
 */
export const isExpectedEmptyCampaignState = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return EXPECTED_EMPTY_CAMPAIGN_MESSAGES.some(pattern => pattern.test(message));
};
