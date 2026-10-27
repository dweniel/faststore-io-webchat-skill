/**
 * Serves a copy of someone else's homepage at `/` only.
 * Root-relative URLs are rewritten to the live origin so CSS, images and
 * links keep working. Do not set <base href>: it would also retarget the
 * local widget module (`/src/main.tsx`) at the client's domain.
 *
 * @param {{ origin: string, badge: string }} options
 */

/**
 * The storefront catalog API has no CORS header. A demo hosted on another
 * origin cannot read a SKU's page URL from the browser. Look it up here and
 * only return a link on the store's own host.
 *
 * @param {string} origin
 * @param {string} skuId
 * @returns {Promise<string | null>}
 */
export async function lookupProductLink(origin, skuId) {
  if (!/^[0-9A-Za-z_-]{1,40}$/.test(skuId)) return null;
  const site = origin.replace(/\/$/, '');
  const response = await fetch(
    `${site}/api/catalog_system/pub/products/search?fq=skuId:${encodeURIComponent(skuId)}`,
    { headers: { accept: 'application/json' } },
  );
  if (!response.ok) return null;
  const products = await response.json();
  const link = Array.isArray(products) ? products[0]?.link : null;
  if (typeof link !== 'string' || !link.startsWith(`${site}/`)) return null;
  return link;
}

export function homepageDemoPlugin({ origin, badge }) {
  const site = origin.replace(/\/$/, '');

  return {
    name: 'homepage-demo',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || '/').split('?')[0];
        if (req.method === 'GET' && path === '/api/product-link') {
          const sku = new URL(req.url || '/', 'http://localhost').searchParams.get('sku') || '';
          try {
            const link = await lookupProductLink(site, sku);
            res.statusCode = link ? 200 : 404;
            res.setHeader('content-type', 'application/json');
            res.setHeader('cache-control', 'no-store');
            res.end(JSON.stringify(link ? { link } : { link: null }));
          } catch {
            res.statusCode = 502;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ link: null }));
          }
          return;
        }
        if (req.method !== 'GET' || (path !== '/' && path !== '/index.html')) return next();

        try {
          const response = await fetch(`${site}/`, {
            headers: {
              accept: 'text/html',
              'user-agent': 'Mozilla/5.0',
            },
            redirect: 'follow',
          });
          if (!response.ok) {
            res.statusCode = 502;
            res.end(`A página inicial respondeu ${response.status}.`);
            return;
          }

          let html = await response.text();
          html = rewriteRootUrls(html, site);
          html = html.replace(/<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');

          const inject = `
<div class="wx-demo-badge">${escapeHtml(badge)}</div>
<style>
  .wx-demo-badge {
    position: fixed;
    left: 16px;
    bottom: 16px;
    z-index: 2147483000;
    padding: 8px 12px;
    border-radius: 999px;
    background: #141414;
    color: #f8f7f3;
    font: 500 12px/1.2 Moderat, "Helvetica Neue", Helvetica, Arial, sans-serif;
    letter-spacing: 0.04em;
    pointer-events: none;
  }
</style>
<script>
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (/^https?:\\/\\//i.test(href)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noreferrer');
    }
  }, true);
</script>
<script type="module">
  import RefreshRuntime from '/@react-refresh'
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true
</script>
<script type="module" src="/src/main.tsx"></script>`;

          html = html.includes('</body>') ? html.replace('</body>', `${inject}</body>`) : html + inject;
          res.statusCode = 200;
          res.setHeader('content-type', 'text/html; charset=utf-8');
          res.setHeader('cache-control', 'no-store');
          res.end(html);
        } catch (error) {
          res.statusCode = 502;
          res.end(error instanceof Error ? error.message : 'Não foi possível copiar a página inicial.');
        }
      });
    },
  };
}

function rewriteRootUrls(html, site) {
  const attr = new RegExp(String.raw`(\s(?:href|src|action|poster)=)(["']?)(\/(?!\/))`, 'gi');
  html = html.replace(attr, `$1$2${site}$3`);
  html = html.replace(/(\ssrcset=)(["'])([\s\S]*?)\2/gi, (_, pre, quote, value) => {
    const rewritten = value.replace(/(^|,\s*)(\/(?!\/))/g, `$1${site}$2`);
    return `${pre}${quote}${rewritten}${quote}`;
  });
  html = html.replace(/url\((['"]?)(\/(?!\/))/gi, `url($1${site}$2`);
  return html;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
