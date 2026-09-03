export const SSO_COOKIE_URL = "https://ca.account.sony.com/api/v1/ssocookie";
export const AUTHORIZE_URL = "https://ca.account.sony.com/api/authz/v3/oauth/authorize";
export const NPSSO_LIFETIME_DAYS = 60;

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function npssoExpiry(from = Date.now()): Date {
  return new Date(from + NPSSO_LIFETIME_DAYS * 86_400_000);
}

export async function diagnoseRejection(fetchImpl: typeof fetch = fetch): Promise<string> {
  try {
    const response = await fetchImpl(`${AUTHORIZE_URL}?response_type=code`, {
      headers: { Cookie: "npsso=probe" },
      redirect: "manual",
    });
    if (response.status >= 300 && response.status < 400) {
      return "sony is reachable · the npsso itself is expired or malformed";
    }
    return `sony answered ${response.status} instead of a redirect · a network or proxy is interfering, the npsso may be fine`;
  } catch (error) {
    return `sony unreachable (${(error as Error).message}) · check the network before blaming the npsso`;
  }
}
