# Falkin Proxy Router (Vercel)

Purpose
- Serve the apex domain `falkin.com` from Framer via reverse proxy.
- Serve the microsite under `falkin.com/check` (and keep `check.falkin.com`) from the Vercel microsite project.
- Redirect `www.falkin.com` → `falkin.com`.

How it works
- Single `vercel.json` (no app code) deployed on Vercel.
- Rewrites:
  - `falkin.com/check/:path*` → `https://<microsite>.vercel.app/:path*`
  - everything else under `falkin.com` → `https://<framer-project>.framer.app/:path*`
- Redirects: `www.falkin.com/:path*` → `https://falkin.com/:path*` (301)

Files
- `vercel.json` only (plus this README and `.gitignore`)

DNS (after verification)
- `falkin.com` A → `76.76.21.21` (Vercel universal apex)
- `www.falkin.com` CNAME → `cname.vercel-dns.com`
- `check.falkin.com` CNAME → `cname.vercel-dns.com`
- TXT records: as provided by Vercel for each domain until “Verified”.

Configuration
- Edit `vercel.json` and replace:
  - `https://microsite-seven.vercel.app` with your microsite’s default Vercel URL
  - `https://able-ways-807681.framer.app` with your Framer project URL

Local testing (dry-run)
- Use your Vercel deployment URL with a Host header:
  - Apex→Framer: `curl -I https://<deploy>.vercel.app/ -H 'Host: falkin.com'`
  - Apex /check→Microsite: `curl -I https://<deploy>.vercel.app/check -H 'Host: falkin.com'`

Security headers
- `vercel.json` includes HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- Enable HSTS includeSubDomains later only when all subdomains are HTTPS-capable.

Rollback
- Switch Route53 apex/www back to previous targets.
