export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000";
}

export function getPublicListUrl(token: string) {
  return `${getAppUrl()}/l/${token}`;
}