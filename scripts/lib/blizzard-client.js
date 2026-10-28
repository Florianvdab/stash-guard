const TOKEN_URL = 'https://oauth.battle.net/token';
const MAX_ATTEMPTS = 5;
const REQUEST_TIMEOUT_MS = 15_000;

export async function createBlizzardClient({ clientId, clientSecret, region = 'eu', locale = 'en_US' }) {
  const token = await requestToken(clientId, clientSecret);
  const baseUrl = `https://${region}.api.blizzard.com/d3/data`;

  return {
    get: (path) => getWithRetry(`${baseUrl}/${path}?locale=${locale}`, token),
  };
}

async function requestToken(clientId, clientSecret) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Token request failed with ${response.status}`);
  return (await response.json()).access_token;
}

async function getWithRetry(url, token, attempt = 1) {
  const response = await fetchWithTimeout(url, { headers: { Authorization: `Bearer ${token}` } });
  if (response.ok) return response.json();
  if (response.status === 404) return null;
  if (attempt >= MAX_ATTEMPTS) throw new Error(`${url} failed with ${response.status} ${response.statusText}`);

  await sleep(attempt * 1000);
  return getWithRetry(url, token, attempt + 1);
}

// Timeouts and network errors become a failed response, so they're retried like a server error.
async function fetchWithTimeout(url, options) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (error) {
    return new Response(null, { status: 599, statusText: error.name });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
