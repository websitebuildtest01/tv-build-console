import { ORG, WORKFLOW, findSite, json, corsHeaders, checkKey, githubFetch } from '../../_lib.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const cors = corsHeaders(request, env);
  if (!checkKey(request, env)) return json({ message: '访问密钥无效' }, 401, cors);
  const site = findSite(params.key);
  if (!site) return json({ message: '未知站点' }, 404, cors);
  try {
    const data = await githubFetch(`/repos/${ORG}/${site.repo}/actions/workflows/${WORKFLOW}/runs?per_page=8`, env);
    const runs = (data.workflow_runs || []).map(r => ({
      id: r.id, status: r.status, conclusion: r.conclusion,
      display_title: r.display_title, created_at: r.created_at,
      html_url: r.html_url, run_number: r.run_number
    }));
    return json({ ok: true, site: site.key, runs }, 200, cors);
  } catch (e) {
    return json({ ok: false, message: e.message }, 500, cors);
  }
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request, context.env) });
}
