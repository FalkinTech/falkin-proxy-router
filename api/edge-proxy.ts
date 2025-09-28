export const config = { runtime: 'edge' };

function parseTenantAndUpstreamPath(pathname: string) {
  if (pathname === '/check' || pathname.startsWith('/check/')) {
    const rest = pathname.replace(/^\/check/, '') || '/';
    return { tenant: 'falkin', upstreamPath: rest };
  }
  const m = pathname.match(/^\/demo\/([^/]+)(\/.*)?$/);
  if (m) {
    const tenant = m[1].toLowerCase();
    const rest = m[2] || '/';
    return { tenant, upstreamPath: rest };
  }
  return null;
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const { pathname, search } = url;

  const parsed = parseTenantAndUpstreamPath(pathname);
  if (!parsed) return new Response('Not found', { status: 404 });

  const { tenant, upstreamPath } = parsed;
  const upstream = new URL(`https://microsite-seven.vercel.app${upstreamPath}${search}`);

  const headers = new Headers(req.headers);
  headers.set('x-tenant', tenant);
  headers.delete('connection');
  headers.delete('transfer-encoding');

  const method = req.method || 'GET';
  const init: RequestInit = {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : req.body,
    redirect: 'manual',
  };

  const upstreamRes = await fetch(upstream, init);

  const resHeaders = new Headers(upstreamRes.headers);
  resHeaders.append('Set-Cookie', `tenant=${tenant}; Path=/; Secure; SameSite=Lax`);
  const vary = resHeaders.get('Vary');
  resHeaders.set('Vary', vary ? `${vary}, Cookie` : 'Cookie');

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: resHeaders,
  });
}


