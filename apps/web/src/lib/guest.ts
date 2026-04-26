import { api } from './api';

const GUEST_TOKEN_KEY = 'kgti_guest_token';

export function getGuestToken() {
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function getOrCreateGuestToken() {
  const existing = getGuestToken();
  if (existing) return existing;

  const token =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  localStorage.setItem(GUEST_TOKEN_KEY, token);
  return token;
}

export function saveGuestToken(token: string | null | undefined) {
  if (!token) return;
  localStorage.setItem(GUEST_TOKEN_KEY, token);
}

export async function claimGuestResults() {
  const guestToken = getGuestToken();
  if (!guestToken) return 0;

  try {
    const result = await api.post<{ claimedCount: number }>('/test/claim-results', { guestToken });
    return result.claimedCount;
  } catch {
    return 0;
  }
}
