/**
 * Generates a one-time random mask for network-level key scrambling.
 * This is used to "mask" the API key in the Network Tab response body.
 */
export const generateClientMask = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
