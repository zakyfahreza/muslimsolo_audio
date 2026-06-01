/**
 * MuslimSolo Audio — R2 presign Worker
 * ------------------------------------------------------------------
 * Issues short-lived presigned PUT URLs so the browser can upload audio
 * directly to a private Cloudflare R2 bucket without ever seeing the R2
 * credentials. Authorizes the request by verifying the caller's GitHub token
 * can write to the configured repo.
 *
 * Deploy with: cd worker && npm install && npx wrangler deploy
 *
 * This is an edge function, not a traditional backend: no server to maintain,
 * no database. It only signs upload URLs.
 */

import { AwsClient } from 'aws4fetch';

export interface Env {
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET: string;
  /** Public base URL serving the bucket, e.g. https://audio.muslimsolo.id */
  AUDIO_PUBLIC_BASE: string;
  /** GitHub repo allowed to upload, "owner/name". */
  GITHUB_REPO: string;
  /** Comma-separated list of allowed browser origins. */
  ALLOWED_ORIGINS: string;
}

interface PresignBody {
  key: string;
  contentType: string;
}

function corsHeaders(origin: string, allowed: string[]): HeadersInit {
  const allow = allowed.includes(origin) ? origin : allowed[0] ?? '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status: number, cors: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

/** Verify the GitHub token can push to the repo (i.e. is a collaborator). */
async function verifyGithubAccess(token: string, repo: string): Promise<boolean> {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'muslimsolo-r2-worker',
    },
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { permissions?: { push?: boolean } };
  return Boolean(data.permissions?.push);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    // Health check: visiting the Worker URL in a browser confirms it is live.
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '')) {
      return json(
        {
          ok: true,
          service: 'muslimsolo-r2-presign',
          bucket: env.R2_BUCKET,
          allowedOrigins: allowed,
        },
        200,
        cors,
      );
    }

    if (request.method !== 'POST' || !url.pathname.endsWith('/presign')) {
      return json({ error: 'Not found' }, 404, cors);
    }

    // --- Authorization ---
    const auth = request.headers.get('Authorization') ?? '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Missing token' }, 401, cors);

    const ok = await verifyGithubAccess(token, env.GITHUB_REPO);
    if (!ok) return json({ error: 'Forbidden' }, 403, cors);

    // --- Validate body ---
    let body: PresignBody;
    try {
      body = (await request.json()) as PresignBody;
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }
    const key = (body.key ?? '').replace(/^\/+/, '');
    if (!key || key.includes('..')) return json({ error: 'Invalid key' }, 400, cors);

    // --- Sign a PUT URL valid for 5 minutes ---
    const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`;
    const client = new AwsClient({
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      service: 's3',
      region: 'auto',
    });

    const signed = await client.sign(
      new Request(`${endpoint}?X-Amz-Expires=300`, {
        method: 'PUT',
        headers: { 'Content-Type': body.contentType || 'application/octet-stream' },
      }),
      { aws: { signQuery: true } },
    );

    return json(
      {
        uploadUrl: signed.url,
        publicUrl: `${env.AUDIO_PUBLIC_BASE.replace(/\/$/, '')}/${key}`,
        key,
      },
      200,
      cors,
    );
  },
};
