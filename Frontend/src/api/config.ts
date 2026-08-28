export function getApiBaseUrl(value = process.env.EXPO_PUBLIC_API_URL): string {
  const url = value?.trim().replace(/\/$/, '');
  if (!url || !/^https?:\/\//.test(url)) throw new Error('EXPO_PUBLIC_API_URL must be a valid http(s) backend URL.');
  return url;
}
