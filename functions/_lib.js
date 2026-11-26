// Cloudflare Pages Functions 共享逻辑（以 _ 开头，不作为路由）

export const ORG = 'websitebuildtest01';
export const WORKFLOW = 'build.yml';
export const REF = 'main';

export const SITES = [
  { key: 'titanium', name: 'Titanium Valleys', repo: 'titanium-valleys-demo', site: 'https://titanium-valleys-demo.pages.dev' },
  { key: 'plantextract', name: 'Plant Extract', repo: 'plantextract-demo', site: 'https://plantextract-demo.pages.dev' },
  { key: 'furniture', name: 'Furniture', repo: 'furniture-demo', site: 'https://furniture-demo-dq4.pages.dev' }
];

export function findSite(key) {
  return SITES.find(s => s.key === key);
}

export function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  // 允许同源访问（页面与 API 同域），以及可选配置的额外来源
  const extra = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowed = extra.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowed || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Access-Key',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Cache-Control': 'no-store'
  };
}

// 访问密钥校验：防止公开页面被任意调用触发构建
export function checkKey(request, env) {
  if (!env.ACCESS_KEY) return true; // 未配置则不校验（不推荐）
  return request.headers.get('X-Access-Key') === env.ACCESS_KEY;
}

export function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
}

export async function githubFetch(apiPath, env, options = {}) {
  if (!env.GITHUB_TOKEN) throw new Error('服务端未配置 GITHUB_TOKEN');
  const res = await fetch('https://api.github.com' + apiPath, {
    method: options.method || 'GET',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tv-cloud-build-console',
      'Content-Type': 'application/json'
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
  if (!res.ok) throw new Error((data && data.message) || ('GitHub API HTTP ' + res.status));
  return data;
}
